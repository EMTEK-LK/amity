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
  agentReady: boolean;
}

type Listener = (snapshot: LiveKitAvatarSnapshot) => void;

const SPEAK_TOPIC = 'amity/speak';
/** Long delay so React Strict Mode / child remounts do not tear down the room mid-session. */
const RELEASE_DELAY_MS = 12_000;
const AGENT_JOIN_TIMEOUT_MS = 45_000;
const RECONNECT_DEBOUNCE_MS = 1_200;
/** Avoid stacking multiple agent jobs on the same room (causes "AgentSession is not running"). */
const REDISPATCH_COOLDOWN_MS = 90_000;

interface CachedCredentials {
  livekitUrl: string;
  token: string;
}

interface SessionEntry {
  sessionId: string;
  refCount: number;
  releaseTimer: ReturnType<typeof setTimeout> | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  room: Room | null;
  connectGen: number;
  connectPromise: Promise<void> | null;
  credentials: CachedCredentials | null;
  videoEl: HTMLVideoElement | null;
  audioEl: HTMLAudioElement | null;
  status: LiveKitAvatarStatus;
  error: string | null;
  videoAttached: boolean;
  agentReady: boolean;
  listeners: Set<Listener>;
  lastSpeakId: number;
  pendingSpeak: { text: string; requestId: number } | null;
  lastAgentDispatchAt: number;
}

const sessions = new Map<string, SessionEntry>();

function emit(entry: SessionEntry) {
  entry.listeners.forEach((l) =>
    l({
      status: entry.status,
      error: entry.error,
      videoAttached: entry.videoAttached,
      agentReady: entry.agentReady,
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
      reconnectTimer: null,
      room: null,
      connectGen: 0,
      connectPromise: null,
      credentials: null,
      videoEl: null,
      audioEl: null,
      status: 'idle',
      error: null,
      videoAttached: false,
      agentReady: false,
      listeners: new Set(),
      lastSpeakId: -1,
      pendingSpeak: null,
      lastAgentDispatchAt: 0,
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
    isAgent: p.isAgent,
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

function attachRemoteAvatarAudio(
  entry: SessionEntry,
  track: RemoteTrack,
  participantIdentity?: string
) {
  if (!entry.room || track.kind !== Track.Kind.Audio) return;
  if (participantIdentity && !isAvatarVideoParticipant(participantIdentity)) return;

  if (!entry.audioEl) {
    entry.audioEl = document.createElement('audio');
    entry.audioEl.setAttribute('playsinline', 'true');
    entry.audioEl.autoplay = true;
  }

  recoveryDebug('LiveKit', 'attaching avatar audio (lip-sync)', {
    participantIdentity,
    trackSid: track.sid,
  });
  track.attach(entry.audioEl);
  void entry.audioEl.play().catch(() => undefined);
}

function reattachExistingTracks(entry: SessionEntry) {
  if (!entry.room) return;
  entry.room.remoteParticipants.forEach((participant) => {
    if (!isAvatarVideoParticipant(participant.identity)) return;
    participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
      pub.setSubscribed(true);
      if (!pub.track) return;
      if (pub.kind === Track.Kind.Video) {
        attachRemoteVideo(entry, pub.track, participant.identity);
      } else if (pub.kind === Track.Kind.Audio) {
        attachRemoteAvatarAudio(entry, pub.track, participant.identity);
      }
    });
  });
}

function abandonRoom(room: Room | null, entry: SessionEntry) {
  if (!room) return;
  if (entry.room === room) entry.room = null;
  try {
    room.disconnect();
  } catch {
    /* already disconnected */
  }
}

function scheduleReconnect(entry: SessionEntry) {
  if (entry.refCount <= 0) return;
  if (entry.reconnectTimer) return;

  entry.reconnectTimer = setTimeout(() => {
    entry.reconnectTimer = null;
    if (entry.refCount <= 0) return;
    if (entry.room?.state === 'connected') return;
    recoveryDebug('LiveKit', 'debounced reconnect');
    void connectSession(entry);
  }, RECONNECT_DEBOUNCE_MS);
}

function wireRoomEvents(entry: SessionEntry, room: Room, gen: number) {
  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    recoveryDebug('LiveKit', 'connection state', { state, gen });
    if (state === 'connected' && gen === entry.connectGen) {
      void waitForRecoveryAgent(entry).then((ok) => {
        if (!ok && gen === entry.connectGen) {
          setError(
            entry,
            'Agent worker not in room. Run: npm run agent:dev in a second terminal.'
          );
        }
        void flushPendingSpeak(entry);
      });
    }
  });

  room.on(
    RoomEvent.TrackSubscribed,
    (track: RemoteTrack, _pub, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Video) {
        attachRemoteVideo(entry, track, participant.identity);
      } else if (track.kind === Track.Kind.Audio) {
        attachRemoteAvatarAudio(entry, track, participant.identity);
      }
    }
  );

  room.on(
    RoomEvent.TrackPublished,
    (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (!isAvatarVideoParticipant(participant.identity)) return;
      publication.setSubscribed(true);
      if (!publication.track) return;
      if (publication.kind === Track.Kind.Video) {
        attachRemoteVideo(entry, publication.track, participant.identity);
      } else if (publication.kind === Track.Kind.Audio) {
        attachRemoteAvatarAudio(entry, publication.track, participant.identity);
      }
    }
  );

  room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
    recoveryDebug('LiveKit', 'ParticipantConnected', { identity: participant.identity });
    if (isAmityAgentParticipant(participant)) {
      entry.agentReady = true;
      emit(entry);
    }
    if (isAvatarVideoParticipant(participant.identity)) {
      participant.trackPublications.forEach((pub) => {
        pub.setSubscribed(true);
        if (!pub.track) return;
        if (pub.kind === Track.Kind.Video) {
          attachRemoteVideo(entry, pub.track, participant.identity);
        } else if (pub.kind === Track.Kind.Audio) {
          attachRemoteAvatarAudio(entry, pub.track, participant.identity);
        }
      });
    }
  });

  room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
    recoveryDebugWarn('LiveKit', 'ParticipantDisconnected', { identity: participant.identity });
    if (isAvatarVideoParticipant(participant.identity)) {
      entry.videoAttached = false;
      emit(entry);
    }
  });

  room.on(RoomEvent.Disconnected, () => {
    if (gen !== entry.connectGen) return;
    recoveryDebugWarn('LiveKit', 'room disconnected', { sessionId: entry.sessionId });
    if (entry.room === room) entry.room = null;
    entry.agentReady = false;
    entry.videoAttached = false;
    setStatus(entry, 'connecting');
    scheduleReconnect(entry);
  });
}

async function fetchCredentials(
  entry: SessionEntry,
  dispatchAgent: boolean
): Promise<CachedCredentials> {
  const res = await fetch('/api/recovery/avatar-livekit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: entry.sessionId,
      phase: dispatchAgent ? 'connect' : 'token',
    }),
  });
  const data = (await res.json()) as {
    livekitUrl?: string;
    token?: string;
    message?: string;
    error?: string;
  };

  if (!res.ok || !data.livekitUrl || !data.token) {
    throw new Error(data.message ?? data.error ?? 'Could not create LiveKit room');
  }

  return { livekitUrl: data.livekitUrl, token: data.token };
}

function hasLiveAgentWorker(room: Room): boolean {
  for (const p of room.remoteParticipants.values()) {
    if (isAmityAgentParticipant(p)) return true;
  }
  return false;
}

function hasBeyAvatarParticipant(room: Room): boolean {
  for (const p of room.remoteParticipants.values()) {
    if (isAvatarVideoParticipant(p.identity)) return true;
  }
  return false;
}

async function waitForRecoveryAgent(entry: SessionEntry): Promise<boolean> {
  const room = entry.room;
  if (!room) return false;

  if (hasLiveAgentWorker(room) || hasBeyAvatarParticipant(room)) {
    entry.agentReady = true;
    emit(entry);
    if (hasBeyAvatarParticipant(room)) {
      reattachExistingTracks(entry);
    }
    return true;
  }

  setStatus(entry, 'waiting_agent');
  recoveryDebugWarn(
    'LiveKit',
    'Bey video may show but agent worker not in room — run npm run agent:dev'
  );

  const deadline = Date.now() + AGENT_JOIN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (room.state !== 'connected') return false;
    await new Promise((r) => setTimeout(r, 500));
    if (hasLiveAgentWorker(room) || hasBeyAvatarParticipant(room)) {
      entry.agentReady = true;
      emit(entry);
      logRoomParticipants(entry, 'agent worker joined');
      if (hasBeyAvatarParticipant(room)) {
        reattachExistingTracks(entry);
      }
      return true;
    }
  }

  logRoomParticipants(entry, 'agent worker join timeout');
  entry.agentReady = false;
  emit(entry);

  const now = Date.now();
  if (now - entry.lastAgentDispatchAt < REDISPATCH_COOLDOWN_MS) {
    recoveryDebugWarn('LiveKit', 'agent join timeout — redispatch skipped (cooldown)');
    return false;
  }

  entry.lastAgentDispatchAt = now;
  try {
    await fetch('/api/recovery/avatar-livekit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: entry.sessionId, phase: 'connect' }),
    });
    recoveryDebug('LiveKit', 'requested agent redispatch after timeout');
  } catch {
    /* retry on next speak */
  }

  return false;
}

async function connectSessionInner(entry: SessionEntry): Promise<void> {
  if (entry.room?.state === 'connected') {
    setStatus(entry, entry.agentReady ? 'connected' : 'waiting_agent');
    reattachExistingTracks(entry);
    void waitForRecoveryAgent(entry);
    return;
  }

  if (entry.room?.state === 'connecting') return;

  const gen = ++entry.connectGen;
  setStatus(entry, 'connecting');
  setError(entry, null);

  try {
    const dispatchAgent = !entry.credentials;
    if (dispatchAgent) {
      entry.lastAgentDispatchAt = Date.now();
    }
    if (!entry.credentials) {
      entry.credentials = await fetchCredentials(entry, dispatchAgent);
    } else {
      entry.credentials = await fetchCredentials(entry, false);
    }

    if (gen !== entry.connectGen) return;

    const room = new Room({ adaptiveStream: true, dynacast: true });
    entry.room = room;
    wireRoomEvents(entry, room, gen);

    await room.connect(entry.credentials.livekitUrl, entry.credentials.token);
    if (gen !== entry.connectGen) {
      abandonRoom(room, entry);
      return;
    }

    try {
      await room.startAudio();
    } catch {
      /* gesture */
    }

    setStatus(entry, 'connected');
    logRoomParticipants(entry, 'browser connected');
    reattachExistingTracks(entry);
    void waitForRecoveryAgent(entry);
    void flushPendingSpeak(entry);
  } catch (err) {
    if (gen !== entry.connectGen) return;
    recoveryDebugError('LiveKit', 'connect failed', err);
    setError(entry, err instanceof Error ? err.message : 'LiveKit connection failed');
    setStatus(entry, 'error');
    scheduleReconnect(entry);
  }
}

function connectSession(entry: SessionEntry): Promise<void> {
  if (!entry.connectPromise) {
    entry.connectPromise = connectSessionInner(entry).finally(() => {
      entry.connectPromise = null;
    });
  }
  return entry.connectPromise;
}

function teardownSession(entry: SessionEntry) {
  if (entry.reconnectTimer) {
    clearTimeout(entry.reconnectTimer);
    entry.reconnectTimer = null;
  }
  entry.connectGen++;
  abandonRoom(entry.room, entry);
  entry.room = null;
  entry.agentReady = false;
  entry.videoAttached = false;
  entry.credentials = null;
  entry.pendingSpeak = null;
  entry.status = 'idle';
  entry.error = null;
  emit(entry);
}

async function flushPendingSpeak(entry: SessionEntry): Promise<void> {
  const pending = entry.pendingSpeak;
  if (!pending) return;
  entry.pendingSpeak = null;
  await publishSpeakText(entry, pending.text, pending.requestId);
}

export async function publishSpeakText(
  entry: SessionEntry,
  text: string,
  requestId: number
): Promise<boolean> {
  const trimmed = text.trim();
  if (!trimmed) return false;

  if (requestId === entry.lastSpeakId) {
    recoveryDebug('LiveKit', 'speak skipped — duplicate request id');
    return true;
  }

  const room = entry.room;
  if (!room || room.state !== 'connected') {
    entry.pendingSpeak = { text: trimmed, requestId };
    recoveryDebugWarn('LiveKit', 'speak queued — room not connected');
    if (entry.refCount > 0) void connectSession(entry);
    return false;
  }

  const ready = entry.agentReady || (await waitForRecoveryAgent(entry));
  if (!ready) {
    entry.pendingSpeak = { text: trimmed, requestId };
    setError(entry, 'Start the agent worker: npm run agent:dev');
    return false;
  }

  const payload = new TextEncoder().encode(
    JSON.stringify({ type: 'amity/speak', text: trimmed, requestId })
  );

  try {
    recoveryDebug('LiveKit', 'publishData amity/speak', { requestId, chars: trimmed.length });
    await room.localParticipant.publishData(payload, { reliable: true, topic: SPEAK_TOPIC });
    entry.lastSpeakId = requestId;
    entry.pendingSpeak = null;
    setError(entry, null);
    return true;
  } catch (err) {
    recoveryDebugWarn('LiveKit', 'publishData failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    entry.pendingSpeak = { text: trimmed, requestId };
    return false;
  }
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
    agentReady: entry.agentReady,
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
  if (element) reattachExistingTracks(entry);
}

export function publishLiveKitAvatarSpeak(
  sessionId: string,
  text: string,
  requestId: number
): Promise<boolean> {
  const entry = getOrCreateEntry(sessionId);
  return publishSpeakText(entry, text, requestId);
}
