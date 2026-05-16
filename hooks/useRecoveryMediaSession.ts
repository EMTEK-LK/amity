'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFacialAwareness } from './useFacialAwareness';
import { useMicrophonePermission } from './useMicrophonePermission';
import { useSpeechTranscript } from './useSpeechTranscript';
import type { FacialAwarenessSignal, FacialAwarenessStatus } from '@/types/facial-awareness';
import type { MicrophonePermissionStatus } from './useMicrophonePermission';
import type { SpeechTranscriptStatus } from './useSpeechTranscript';

export type RecoverySessionState =
  | 'idle'
  | 'requesting_permissions'
  | 'active_listening'
  | 'processing'
  | 'responding'
  | 'paused'
  | 'crisis'
  | 'ended'
  | 'error';

export type CameraStatus = 'off' | 'active' | 'denied' | 'unavailable';

/** Higher-level phases the page drives around the Gemini call. */
type AgentPhase = 'none' | 'processing' | 'responding' | 'crisis' | 'ended';

export interface UseRecoveryMediaSessionResult {
  sessionState: RecoverySessionState;
  cameraStatus: CameraStatus;
  facialStatus: FacialAwarenessStatus;
  microphoneStatus: MicrophonePermissionStatus;
  transcriptStatus: SpeechTranscriptStatus;
  facialSignal: FacialAwarenessSignal | null;
  transcript: string;
  interimTranscript: string;
  finalTranscriptHistory: string[];
  speechSupported: boolean;
  speechMessage: string | null;
  errorMessage: string | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  withCamera: boolean;
  /** One action: requests camera + mic together and begins listening. */
  startSession: (opts?: { withCamera?: boolean }) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  clearTranscript: () => void;
  /** Page-driven phases around POST /api/agent/respond */
  markProcessing: () => void;
  markResponding: () => void;
  markActive: () => void;
  markCrisis: () => void;
}

function cameraStatusFrom(
  withCamera: boolean,
  status: FacialAwarenessStatus
): CameraStatus {
  if (!withCamera) return 'off';
  if (status === 'permission_denied') return 'denied';
  if (status === 'error' || status === 'models_missing') return 'unavailable';
  if (status === 'camera_off' || status === 'idle') return 'off';
  return 'active';
}

export function useRecoveryMediaSession(): UseRecoveryMediaSessionResult {
  const [withCamera, setWithCamera] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [agentPhase, setAgentPhase] = useState<AgentPhase>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedAtRef = useRef(0);

  const live = started && !paused && agentPhase !== 'crisis' && agentPhase !== 'ended';

  const facial = useFacialAwareness(withCamera && live);
  const microphone = useMicrophonePermission(live);
  const speech = useSpeechTranscript(microphone.status === 'granted' && live);

  // Begin/auto-resume listening while the live session is active.
  useEffect(() => {
    if (live && microphone.status === 'granted' && speech.supported) {
      if (speech.status === 'idle' || speech.status === 'stopped') {
        speech.startListening();
      }
    }
    if ((!live || microphone.status !== 'granted') && speech.isListening) {
      speech.stopListening();
    }
  }, [live, microphone.status, speech]);

  // Surface a non-blocking media error message (camera/mic optional).
  useEffect(() => {
    if (!started) {
      setErrorMessage(null);
      return;
    }
    if (microphone.status === 'denied') {
      setErrorMessage('Microphone is off. Use text input.');
    } else if (withCamera && facial.status === 'permission_denied') {
      setErrorMessage('Camera is off. Facial awareness is disabled.');
    } else if (withCamera && facial.status === 'models_missing') {
      setErrorMessage(
        'Facial model files missing. Session can continue without facial awareness.'
      );
    } else {
      setErrorMessage(null);
    }
  }, [started, withCamera, facial.status, microphone.status]);

  const startSession = useCallback((opts?: { withCamera?: boolean }) => {
    setWithCamera(opts?.withCamera ?? false);
    setStarted(true);
    setPaused(false);
    setAgentPhase('none');
    setErrorMessage(null);
    startedAtRef.current = Date.now();
  }, []);

  const pauseSession = useCallback(() => setPaused(true), []);
  const resumeSession = useCallback(() => {
    setPaused(false);
    setAgentPhase((p) => (p === 'crisis' || p === 'ended' ? p : 'none'));
  }, []);
  const stopSession = useCallback(() => {
    setStarted(false);
    setPaused(false);
    setWithCamera(false);
    setAgentPhase('none');
    speech.stopListening();
    speech.resetTranscript();
  }, [speech]);

  const clearTranscript = useCallback(() => speech.resetTranscript(), [speech]);

  const markProcessing = useCallback(() => setAgentPhase('processing'), []);
  const markResponding = useCallback(() => setAgentPhase('responding'), []);
  const markActive = useCallback(() => setAgentPhase('none'), []);
  const markCrisis = useCallback(() => setAgentPhase('crisis'), []);

  let sessionState: RecoverySessionState;
  if (!started) {
    sessionState = errorMessage && microphone.status === 'error' ? 'error' : 'idle';
  } else if (agentPhase === 'crisis') {
    sessionState = 'crisis';
  } else if (agentPhase === 'ended') {
    sessionState = 'ended';
  } else if (agentPhase === 'processing') {
    sessionState = 'processing';
  } else if (agentPhase === 'responding') {
    sessionState = 'responding';
  } else if (paused) {
    sessionState = 'paused';
  } else if (microphone.status === 'requesting' || microphone.status === 'idle') {
    sessionState = 'requesting_permissions';
  } else {
    sessionState = 'active_listening';
  }

  return {
    sessionState,
    cameraStatus: cameraStatusFrom(withCamera, facial.status),
    facialStatus: facial.status,
    microphoneStatus: microphone.status,
    transcriptStatus: speech.status,
    facialSignal: facial.signal,
    transcript: speech.transcript,
    interimTranscript: speech.interimTranscript,
    finalTranscriptHistory: speech.finalSegments,
    speechSupported: speech.supported,
    speechMessage: speech.statusMessage,
    errorMessage,
    videoRef: facial.videoRef,
    withCamera,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    clearTranscript,
    markProcessing,
    markResponding,
    markActive,
    markCrisis,
  };
}
