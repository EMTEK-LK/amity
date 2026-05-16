'use client';

import {
  LocalAudioTrack,
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
  | 'activating'
  | 'streaming'
  | 'error';

export interface LiveKitAvatarSnapshot {
  status: LiveKitAvatarStatus;
  error: string | null;
  videoAttached: boolean;
}

type Listener = (snapshot: LiveKitAvatarSnapshot) => void;

const RELEASE_DELAY_MS = 600;
const BP_WARMUP_MS = 3000;
const BP_JOIN_TIMEOUT_MS = 20000;
/** Keep audio published after clip ends so BP can finish lip-sync video. */
const AUDIO_UNPUBLISH_GRACE_MS = 8000;

interface SessionEntry {
  sessionId: string;
  refCount: number;
  releaseTimer: ReturnType<typeof setTimeout> | null;
  room: Room | null;
  connectGen: number;
  bpActivated: boolean;
  activatePromise: Promise<void> | null;
  audioPublish: LocalAudioTrack | null;
  videoEl: HTMLVideoElement | null;
  status: LiveKitAvatarStatus;
  error: string | null;
  videoAttached: boolean;
  listeners: Set<Listener>;
}

const sessions = new Map<string, SessionEntry>();

function emit(entry: SessionEntry) {
  const snapshot: LiveKitAvatarSnapshot = {
    status: entry.status,
    error: entry.error,
    videoAttached: entry.videoAttached,
  };
  entry.listeners.forEach((l) => l(snapshot));
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
      bpActivated: false,
      activatePromise: null,
      audioPublish: null,
      videoEl: null,
      status: 'idle',
      error: null,
      videoAttached: false,
      listeners: new Set(),
    };
    sessions.set(sessionId, entry);
  }
  return entry;
}

function isRemoteAvatarParticipant(identity: string): boolean {
  return !identity.startsWith('amity-user-');
}

function logRoomParticipants(entry: SessionEntry, label: string) {
  const room = entry.room;
  if (!room) {
    recoveryDebug('LiveKit', `${label}: no room`, { sessionId: entry.sessionId });
    return;
  }

  const remote = [...room.remoteParticipants.values()].map((p) => ({
    identity: p.identity,
    sid: p.sid,
    tracks: [...p.trackPublications.values()].map((pub) => ({
      kind: pub.kind,
      sid: pub.trackSid,
      subscribed: pub.isSubscribed,
      hasTrack: Boolean(pub.track),
    })),
  }));

  recoveryDebug('LiveKit', label, {
    sessionId: entry.sessionId,
    roomName: room.name,
    roomState: room.state,
    localIdentity: room.localParticipant.identity,
    remoteCount: remote.length,
    remote,
  });
}

async function waitForAvatarParticipant(entry: SessionEntry): Promise<boolean> {
  const room = entry.room;
  if (!room) return false;

  const hasAvatar = () => {
    for (const participant of room.remoteParticipants.values()) {
      if (isRemoteAvatarParticipant(participant.identity)) return true;
    }
    return false;
  };

  if (hasAvatar()) {
    logRoomParticipants(entry, 'BP participant already in room');
    return true;
  }

  recoveryDebug('LiveKit', 'waiting for BP participant…', {
    sessionId: entry.sessionId,
    timeoutMs: BP_JOIN_TIMEOUT_MS,
  });

  const deadline = Date.now() + BP_JOIN_TIMEOUT_MS;
  let polls = 0;
  while (Date.now() < deadline) {
    polls += 1;
    await new Promise((r) => setTimeout(r, 400));
    if (hasAvatar()) {
      logRoomParticipants(entry, `BP participant joined (poll #${polls})`);
      return true;
    }
    if (polls % 5 === 0) {
      logRoomParticipants(entry, `still waiting (poll #${polls})`);
    }
  }

  logRoomParticipants(entry, 'BP participant never joined');
  return false;
}

function attachRemoteVideo(
  entry: SessionEntry,
  track: RemoteTrack,
  participantIdentity?: string
) {
  const el = entry.videoEl;
  if (!el || track.kind !== Track.Kind.Video || !entry.room) {
    recoveryDebugWarn('LiveKit', 'attachRemoteVideo skipped', {
      hasEl: Boolean(el),
      trackKind: track.kind,
      hasRoom: Boolean(entry.room),
      participantIdentity,
    });
    return;
  }
  if (participantIdentity && !isRemoteAvatarParticipant(participantIdentity)) {
    recoveryDebug('LiveKit', 'ignoring non-avatar video track', { participantIdentity });
    return;
  }

  recoveryDebug('LiveKit', 'attaching remote video', {
    sessionId: entry.sessionId,
    participantIdentity,
    trackSid: track.sid,
  });

  track.attach(el);
  void el.play().catch((err) => {
    recoveryDebugWarn('LiveKit', 'video element play() failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  });
  entry.videoAttached = true;
  entry.status = 'streaming';
  emit(entry);
}

function reattachExistingVideo(entry: SessionEntry) {
  if (!entry.room || !entry.videoEl) return;
  logRoomParticipants(entry, 'reattachExistingVideo');
  entry.room.remoteParticipants.forEach((participant) => {
    if (!isRemoteAvatarParticipant(participant.identity)) return;
    participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
      if (pub.kind === Track.Kind.Video) {
        pub.setSubscribed(true);
        if (pub.track) attachRemoteVideo(entry, pub.track, participant.identity);
      }
    });
  });
}

async function activateBp(entry: SessionEntry): Promise<void> {
  if (entry.bpActivated) {
    recoveryDebug('LiveKit', 'BP already activated', { sessionId: entry.sessionId });
    return;
  }
  if (entry.activatePromise) {
    await entry.activatePromise;
    return;
  }

  const run = async () => {
    setStatus(entry, 'activating');
    recoveryDebug('LiveKit', 'POST avatar-livekit activate', { sessionId: entry.sessionId });

    const res = await fetch('/api/recovery/avatar-livekit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: entry.sessionId, phase: 'activate' }),
    });
    const data = (await res.json()) as {
      message?: string;
      error?: string;
      beySessionId?: string;
      avatarId?: string;
    };

    recoveryDebug('LiveKit', 'activate response', {
      ok: res.ok,
      status: res.status,
      beySessionId: data.beySessionId,
      avatarId: data.avatarId,
      error: data.error,
      message: data.message,
    });

    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'Could not start Beyond Presence avatar');
    }

    entry.bpActivated = true;
    await new Promise((r) => setTimeout(r, BP_WARMUP_MS));
    await waitForAvatarParticipant(entry);
    if (entry.status === 'activating') setStatus(entry, 'connected');
  };

  entry.activatePromise = run();
  try {
    await entry.activatePromise;
  } finally {
    entry.activatePromise = null;
  }
}

async function connectSession(entry: SessionEntry): Promise<void> {
  if (entry.room?.state === 'connected') {
    recoveryDebug('LiveKit', 'reusing connected room', { sessionId: entry.sessionId });
    setStatus(entry, 'connected');
    reattachExistingVideo(entry);
    if (!entry.bpActivated) {
      void activateBp(entry).catch((err) => {
        recoveryDebugError('LiveKit', 'BP activation failed', err);
        setError(entry, err instanceof Error ? err.message : 'Beyond Presence activation failed');
      });
    }
    return;
  }

  if (entry.status === 'connecting') return;

  const gen = ++entry.connectGen;
  setStatus(entry, 'connecting');
  setError(entry, null);

  try {
    recoveryDebug('LiveKit', 'POST avatar-livekit connect', { sessionId: entry.sessionId, gen });

    const res = await fetch('/api/recovery/avatar-livekit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: entry.sessionId, phase: 'connect' }),
    });
    const data = (await res.json()) as {
      livekitUrl?: string;
      token?: string;
      roomName?: string;
      message?: string;
      error?: string;
    };

    recoveryDebug('LiveKit', 'connect response', {
      ok: res.ok,
      status: res.status,
      roomName: data.roomName,
      livekitUrl: data.livekitUrl,
      tokenLength: data.token?.length,
      error: data.error,
    });

    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'Could not create LiveKit room');
    }
    if (gen !== entry.connectGen) {
      recoveryDebugWarn('LiveKit', 'stale connect aborted', { gen, current: entry.connectGen });
      return;
    }

    const room = new Room({ adaptiveStream: true, dynacast: true });
    entry.room = room;

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      recoveryDebug('LiveKit', 'connection state', { sessionId: entry.sessionId, state });
    });

    room.on(
      RoomEvent.TrackSubscribed,
      (track: RemoteTrack, pub, participant: RemoteParticipant) => {
        recoveryDebug('LiveKit', 'TrackSubscribed', {
          kind: track.kind,
          participant: participant.identity,
          trackSid: track.sid,
          pubSid: pub.trackSid,
        });
        if (track.kind === Track.Kind.Video) {
          attachRemoteVideo(entry, track, participant.identity);
        }
      }
    );

    room.on(
      RoomEvent.TrackPublished,
      (publication: RemoteTrackPublication, participant: RemoteParticipant) => {
        recoveryDebug('LiveKit', 'TrackPublished', {
          kind: publication.kind,
          participant: participant.identity,
          trackSid: publication.trackSid,
          hasTrack: Boolean(publication.track),
        });
        if (publication.kind !== Track.Kind.Video) return;
        if (!isRemoteAvatarParticipant(participant.identity)) return;
        publication.setSubscribed(true);
        if (publication.track) {
          attachRemoteVideo(entry, publication.track, participant.identity);
        }
      }
    );

    room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
      recoveryDebug('LiveKit', 'TrackUnsubscribed', { kind: track.kind, sid: track.sid });
      track.detach();
      entry.videoAttached = false;
      emit(entry);
    });

    room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      recoveryDebug('LiveKit', 'ParticipantConnected', {
        identity: participant.identity,
        sid: participant.sid,
      });
      if (!isRemoteAvatarParticipant(participant.identity)) return;
      participant.trackPublications.forEach((pub: RemoteTrackPublication) => {
        if (pub.kind === Track.Kind.Video) {
          pub.setSubscribed(true);
          if (pub.track) attachRemoteVideo(entry, pub.track, participant.identity);
        }
      });
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      recoveryDebugWarn('LiveKit', 'ParticipantDisconnected', {
        identity: participant.identity,
      });
    });

    room.on(RoomEvent.Disconnected, (reason) => {
      recoveryDebugWarn('LiveKit', 'room Disconnected', { reason, gen, connectGen: entry.connectGen });
      if (gen !== entry.connectGen) return;
      entry.room = null;
      entry.bpActivated = false;
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
      recoveryDebug('LiveKit', 'room.startAudio() ok');
    } catch (err) {
      recoveryDebugWarn('LiveKit', 'room.startAudio() failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    setStatus(entry, 'connected');
    logRoomParticipants(entry, 'connected');
    reattachExistingVideo(entry);

    void activateBp(entry).catch((err) => {
      recoveryDebugError('LiveKit', 'BP activation failed after connect', err);
      setError(entry, err instanceof Error ? err.message : 'Beyond Presence activation failed');
    });
  } catch (err) {
    if (gen !== entry.connectGen) return;
    recoveryDebugError('LiveKit', 'connect failed', err);
    setError(entry, err instanceof Error ? err.message : 'LiveKit connection failed');
    setStatus(entry, 'error');
  }
}

async function loadAudioBuffer(audioUrl: string): Promise<AudioBuffer> {
  let arrayBuffer: ArrayBuffer;
  if (audioUrl.startsWith('data:')) {
    const base64 = audioUrl.split(',')[1] ?? '';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    arrayBuffer = bytes.buffer;
  } else {
    const res = await fetch(audioUrl);
    if (!res.ok) throw new Error('Could not load recovery audio');
    arrayBuffer = await res.arrayBuffer();
  }
  const ctx = new AudioContext();
  try {
    return await ctx.decodeAudioData(arrayBuffer);
  } finally {
    void ctx.close();
  }
}

function teardownSession(entry: SessionEntry) {
  recoveryDebug('LiveKit', 'teardown session', { sessionId: entry.sessionId });
  entry.connectGen++;
  entry.audioPublish?.stop();
  entry.audioPublish = null;
  entry.room?.disconnect();
  entry.room = null;
  entry.bpActivated = false;
  entry.activatePromise = null;
  entry.videoAttached = false;
  entry.status = 'idle';
  entry.error = null;
  emit(entry);
}

async function publishAudioToRoom(entry: SessionEntry, audioUrl: string): Promise<void> {
  const room = entry.room;
  if (!room || room.state !== 'connected') {
    recoveryDebugWarn('LiveKit', 'publish skipped — room not connected', {
      roomState: room?.state,
    });
    return;
  }

  recoveryDebug('LiveKit', 'publishAudioToRoom start', {
    sessionId: entry.sessionId,
    audioUrlPrefix: audioUrl.slice(0, 40),
    audioUrlLength: audioUrl.length,
  });

  await activateBp(entry);

  const avatarReady = await waitForAvatarParticipant(entry);
  if (!avatarReady) {
    recoveryDebugWarn(
      'LiveKit',
      'BP participant missing — publishing audio anyway (voice-only fallback)'
    );
    setError(
      entry,
      'Avatar video waiting: Beyond Presence has not joined yet. Voice should still play locally.'
    );
  }

  if (entry.audioPublish) {
    await room.localParticipant.unpublishTrack(entry.audioPublish).catch(() => undefined);
    entry.audioPublish.stop();
    entry.audioPublish = null;
  }

  const audioBuffer = await loadAudioBuffer(audioUrl);
  const ctx = new AudioContext();
  await ctx.resume();

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;

  // Single playback path → speakers (no separate Voice hook in LiveKit mode).
  source.connect(ctx.destination);

  const dest = ctx.createMediaStreamDestination();
  source.connect(dest);

  const mediaTrack = dest.stream.getAudioTracks()[0];
  if (!mediaTrack) {
    void ctx.close();
    throw new Error('Could not create LiveKit audio stream');
  }

  const localTrack = new LocalAudioTrack(mediaTrack);
  entry.audioPublish = localTrack;

  recoveryDebug('LiveKit', 'publishing Web Audio track (mic source)', {
    durationSec: audioBuffer.duration,
  });
  await room.localParticipant.publishTrack(localTrack, {
    source: Track.Source.Microphone,
    name: 'amity-tts',
  });
  logRoomParticipants(entry, 'after audio publish');

  const waitForVideo = new Promise<void>((resolve) => {
    const deadline = Date.now() + 45000;
    const check = () => {
      if (entry.videoAttached) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        recoveryDebugWarn('LiveKit', 'no video track within 45s after audio publish');
        resolve();
        return;
      }
      setTimeout(check, 500);
    };
    check();
  });

  source.start(0);
  recoveryDebug('LiveKit', 'Web Audio playback started');

  source.onended = () => {
    recoveryDebug('LiveKit', 'Web Audio ended — grace period before unpublish', {
      graceMs: AUDIO_UNPUBLISH_GRACE_MS,
    });
    void waitForVideo.then(() => {
      setTimeout(() => {
        void room.localParticipant.unpublishTrack(localTrack).catch(() => undefined);
        localTrack.stop();
        if (entry.audioPublish === localTrack) entry.audioPublish = null;
        void ctx.close();
        if (!entry.videoAttached && entry.status !== 'error') {
          setStatus(entry, 'connected');
        }
        logRoomParticipants(entry, 'after audio unpublish');
      }, AUDIO_UNPUBLISH_GRACE_MS);
    });
  };
}

export function retainLiveKitAvatarSession(sessionId: string): () => void {
  const entry = getOrCreateEntry(sessionId);
  entry.refCount += 1;
  recoveryDebug('LiveKit', 'retain session', { sessionId, refCount: entry.refCount });
  if (entry.releaseTimer) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = null;
  }
  void connectSession(entry);

  return () => {
    entry.refCount = Math.max(0, entry.refCount - 1);
    recoveryDebug('LiveKit', 'release session', { sessionId, refCount: entry.refCount });
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
  recoveryDebug('LiveKit', 'video element set', { sessionId, hasElement: Boolean(element) });
  if (element) reattachExistingVideo(entry);
}

export function publishLiveKitAvatarAudio(sessionId: string, audioUrl: string): void {
  const entry = sessions.get(sessionId);
  if (!entry?.room) {
    recoveryDebugWarn('LiveKit', 'publishLiveKitAvatarAudio: no room', { sessionId });
    return;
  }
  void publishAudioToRoom(entry, audioUrl).catch((err) => {
    recoveryDebugError('LiveKit', 'publishAudioToRoom failed', err);
    setError(entry, err instanceof Error ? err.message : 'Failed to stream audio to avatar');
    setStatus(entry, 'error');
  });
}
