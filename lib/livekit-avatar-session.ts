'use client';

import {
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from 'livekit-client';
import { recoveryDebug, recoveryDebugError, recoveryDebugWarn } from '@/lib/recovery-debug';

export type LiveKitAvatarStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'waiting_agent'
  | 'streaming'
  | 'error';

export interface LiveKitAvatarSnapshot {
  status: LiveKitAvatarStatus;
  error: string | null;
  videoAttached: boolean;
}

type Listener = (snapshot: LiveKitAvatarSnapshot) => void;

const SPEAK_TOPIC = 'amity/speak';
const RELEASE_DELAY_MS = 600;
const AGENT_JOIN_TIMEOUT_MS = 30000;

interface SessionEntry {
  sessionId: string;
  refCount: number;
  releaseTimer: ReturnType<typeof setTimeout> | null;
  room: Room | null;
  connectGen: number;
  videoEl: HTMLVideoElement | null;
  status: LiveKitAvatarStatus;
  error: string | null;
  videoAttached: boolean;
  agentReady: boolean;
  listeners: Set<Listener>;
}

const sessions = new Map<string, SessionEntry>();

function emit(entry: SessionEntry) {
  entry.listeners.forEach((l) =>
    l({
      status: entry.status,
      error: entry.error,
      videoAttached: entry.videoAttached,
    })
  );
}

function setStatus(entry: SessionEntry, status: LiveKitAvatarStatus) {
  recoveryDebug('LiveKit', `status → ${status}`, { sessionId: entry.sessionId });
  entry.status = status;
  emit(entry);
}

function setError(entry: SessionEntry, error: string | null) {
  if (error) recoveryDebugWarn('LiveKit', error, { sessionId: entry.sessionId });
  entry.error = error;
  emit(entry);
}

function getOrCreateEntry(sessionId: string): SessionEntry {
  let entry = sessions.get(sessionId);
  if (!entry) {
    entry = {
      sessionId,
      refCount: 0,
      releaseTimer: null,
      room: null,
      connectGen: 0,
      videoEl: null,
      status: 'idle',
      error: null,
      videoAttached: false,
      agentReady: false,
      listeners: new Set(),
    };
    sessions.set(sessionId, entry);
  }
  return entry;
}

function isAvatarVideoParticipant(identity: string): boolean {
  return identity.startsWith('bey-');
}

function isAmityAgentParticipant(participant: RemoteParticipant): boolean {
  if (participant.isAgent) return true;
  const id = participant.identity;
  return (
    id.startsWith('agent-') ||
    id === 'amity-recovery-agent' ||
    id.includes('amity-recovery')
  );
}

function logRoomParticipants(entry: SessionEntry, label: string) {
  const room = entry.room;
  if (!room) return;

  const remote = [...room.remoteParticipants.values()].map((p) => ({
    identity: p.identity,
    tracks: [...p.trackPublications.values()].map((pub) => ({
      kind: pub.kind,
      subscribed: pub.isSubscribed,
      hasTrack: Boolean(pub.track),
    })),
  }));

  recoveryDebug('LiveKit', label, {
    sessionId: entry.sessionId,
    roomState: room.state,
    remoteCount: remote.length,
    remote,
  });
}

function attachRemoteVideo(
  entry: SessionEntry,
  track: RemoteTrack,
  participantIdentity?: string
) {
  const el = entry.videoEl;
  if (!el || track.kind !== Track.Kind.Video || !entry.room) return;
  if (participantIdentity && !isAvatarVideoParticipant(participantIdentity)) return;

  recoveryDebug('LiveKit', 'attaching avatar video', { participantIdentity, trackSid: track.sid });
  track.attach(el);
  void el.play().catch(() => undefined);
  entry.videoAttached = true;
  setStatus(entry, 'streaming');
}

function reattachExistingVideo(entry: SessionEntry) {
  if (!entry.room || !entry.videoEl) return;
  entry.room.remoteParticipants.forEach((participant) => {
    if (!isAvatarVideoParticipant(participant.identity)) return;
    participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
      if (pub.kind === Track.Kind.Video) {
        pub.setSubscribed(true);
        if (pub.track) attachRemoteVideo(entry, pub.track, participant.identity);
      }
    });
  });
}

async function waitForRecoveryAgent(entry: SessionEntry): Promise<boolean> {
  const room = entry.room;
  if (!room) return false;

  const hasAgent = () => {
    for (const p of room.remoteParticipants.values()) {
      if (isAmityAgentParticipant(p) || isAvatarVideoParticipant(p.identity)) {
        return true;
      }
    }
    return false;
  };

  if (hasAgent()) {
    entry.agentReady = true;
    return true;
  }

  setStatus(entry, 'waiting_agent');
  const deadline = Date.now() + AGENT_JOIN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 500));
    if (hasAgent()) {
      entry.agentReady = true;
      logRoomParticipants(entry, 'agent/avatar joined');
      return true;
    }
  }

  logRoomParticipants(entry, 'agent join timeout');
  return false;
}

async function connectSession(entry: SessionEntry): Promise<void> {
  if (entry.room?.state === 'connected') {
    setStatus(entry, entry.agentReady ? 'connected' : 'waiting_agent');
    reattachExistingVideo(entry);
    void waitForRecoveryAgent(entry);
    return;
  }

  if (entry.status === 'connecting') return;

  const gen = ++entry.connectGen;
  setStatus(entry, 'connecting');
  setError(entry, null);

  try {
    recoveryDebug('LiveKit', 'POST avatar-livekit connect (dispatches agent worker)', {
      sessionId: entry.sessionId,
    });

    const res = await fetch('/api/recovery/avatar-livekit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: entry.sessionId, phase: 'connect' }),
    });
    const data = (await res.json()) as {
      livekitUrl?: string;
      token?: string;
      agentDispatched?: boolean;
      message?: string;
      error?: string;
    };

    recoveryDebug('LiveKit', 'connect response', {
      ok: res.ok,
      agentDispatched: data.agentDispatched,
      error: data.error,
    });

    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'Could not create LiveKit room');
    }
    if (gen !== entry.connectGen) return;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    entry.room = room;

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      recoveryDebug('LiveKit', 'connection state', { state });
    });

    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, _pub, participant: RemoteParticipant) => {
        recoveryDebug('LiveKit', 'TrackSubscribed', {
          kind: track.kind,
          identity: participant.identity,
        });
        if (track.kind === Track.Kind.Video) {
          attachRemoteVideo(entry, track, participant.identity);
        }
      }
    );

    room.on(
      RoomEvent.TrackPublished,
      (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        if (publication.kind !== Track.Kind.Video) return;
        if (!isAvatarVideoParticipant(participant.identity)) return;
        publication.setSubscribed(true);
        if (publication.track) {
          attachRemoteVideo(entry, publication.track, participant.identity);
        }
      }
    );

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      recoveryDebug('LiveKit', 'ParticipantConnected', { identity: participant.identity });
      if (isAmityAgentParticipant(participant)) entry.agentReady = true;
      if (isAvatarVideoParticipant(participant.identity)) {
        participant.trackPublications.forEach((pub) => {
          if (pub.kind === Track.Kind.Video && pub.track) {
            attachRemoteVideo(entry, pub.track, participant.identity);
          }
        });
      }
    });

    room.on(RoomEvent.Disconnected, () => {
      if (gen !== entry.connectGen) return;
      entry.room = null;
      entry.agentReady = false;
      entry.videoAttached = false;
      setStatus(entry, 'idle');
    });

    await room.connect(data.livekitUrl!, data.token!);
    if (gen !== entry.connectGen) {
      room.disconnect();
      return;
    }

    try {
      await room.startAudio();
    } catch {
      /* gesture */
    }

    setStatus(entry, 'connected');
    logRoomParticipants(entry, 'browser connected');
    void waitForRecoveryAgent(entry).then((ok) => {
      if (!ok) {
        setError(
          entry,
          'LiveKit agent worker not in room. Run: npm run agent:dev in a second terminal.'
        );
      } else {
        setStatus(entry, 'connected');
      }
    });
    reattachExistingVideo(entry);
  } catch (err) {
    if (gen !== entry.connectGen) return;
    recoveryDebugError('LiveKit', 'connect failed', err);
    setError(entry, err instanceof Error ? err.message : 'LiveKit connection failed');
    setStatus(entry, 'error');
  }
}

function teardownSession(entry: SessionEntry) {
  entry.connectGen++;
  entry.room?.disconnect();
  entry.room = null;
  entry.agentReady = false;
  entry.videoAttached = false;
  entry.status = 'idle';
  entry.error = null;
  emit(entry);
}

export async function publishSpeakText(entry: SessionEntry, text: string): Promise<void> {
  const room = entry.room;
  if (!room || room.state !== 'connected') {
    recoveryDebugWarn('LiveKit', 'speak skipped — not connected');
    return;
  }

  const trimmed = text.trim();
  if (!trimmed) return;

  const ready = entry.agentReady || (await waitForRecoveryAgent(entry));
  if (!ready) {
    setError(entry, 'Start the agent worker: npm run agent:dev');
    return;
  }

  const payload = new TextEncoder().encode(
    JSON.stringify({ type: 'amity/speak', text: trimmed })
  );

  recoveryDebug('LiveKit', 'publishData amity/speak', { chars: trimmed.length });
  await room.localParticipant.publishData(payload, { reliable: true, topic: SPEAK_TOPIC });
}

export function retainLiveKitAvatarSession(sessionId: string): () => void {
  const entry = getOrCreateEntry(sessionId);
  entry.refCount += 1;
  if (entry.releaseTimer) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
  }
  void connectSession(entry);

  return () => {
    entry.refCount = Math.max(0, entry.refCount - 1);
    if (entry.refCount > 0) return;
    entry.releaseTimer = setTimeout(() => {
      if (entry.refCount > 0) return;
      teardownSession(entry);
      sessions.delete(sessionId);
    }, RELEASE_DELAY_MS);
  };
}

export function subscribeLiveKitAvatarSession(
  sessionId: string,
  listener: Listener
): () => void {
  const entry = getOrCreateEntry(sessionId);
  listener({
    status: entry.status,
    error: entry.error,
    videoAttached: entry.videoAttached,
  });
  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}

export function setLiveKitAvatarVideoElement(
  sessionId: string,
  element: HTMLVideoElement | null
): void {
  const entry = getOrCreateEntry(sessionId);
  entry.videoEl = element;
  if (element) reattachExistingVideo(entry);
}

export function publishLiveKitAvatarSpeak(sessionId: string, text: string): void {
  const entry = sessions.get(sessionId);
  if (!entry) return;
  void publishSpeakText(entry, text).catch((err) => {
    recoveryDebugError('LiveKit', 'publishSpeakText failed', err);
    setError(entry, err instanceof Error ? err.message : 'Could not send speak to agent');
  });
}
