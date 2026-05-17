'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type MicrophonePermissionStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

export interface UseMicrophonePermissionResult {
  status: MicrophonePermissionStatus;
  error: string | null;
  requestPermission: () => Promise<boolean>;
}

export function useMicrophonePermission(enabled: boolean): UseMicrophonePermissionResult {
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<MicrophonePermissionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setError('Microphone not supported in this browser');
      return false;
    }

    setStatus('requesting');
    setError(null);

    try {
      stopTracks();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setStatus('granted');
      return true;
    } catch (err) {
      const name = err instanceof DOMException ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setStatus('denied');
        setError('Microphone permission denied');
      } else {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Microphone unavailable');
      }
      return false;
    }
  }, [stopTracks]);

  useEffect(() => {
    if (!enabled) {
      stopTracks();
      setStatus('idle');
      setError(null);
      return;
    }

    void requestPermission();

    return () => {
      stopTracks();
    };
  }, [enabled, requestPermission, stopTracks]);

  return { status, error, requestPermission };
}
