'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FacialAwarenessSignal, FacialAwarenessStatus } from '@/types/facial-awareness';
import {
  createCameraOffSignal,
  createNoFaceSignal,
  detectExpressionFromVideo,
  FACE_DETECTION_INTERVAL_MS,
  isVideoReadyForDetection,
  loadFaceApiModels,
} from '@/lib/browser/face-awareness-client';

export interface UseFacialAwarenessResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: FacialAwarenessStatus;
  signal: FacialAwarenessSignal | null;
  error: string | null;
}

function isPermissionDenied(err: unknown): boolean {
  if (err instanceof DOMException) {
    return err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
  }
  return false;
}

export function useFacialAwareness(enabled: boolean): UseFacialAwarenessResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<FacialAwarenessStatus>('idle');
  const [signal, setSignal] = useState<FacialAwarenessSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      stopCamera();
      setStatus('camera_off');
      setSignal(createCameraOffSignal());
      setError(null);
      return () => {
        mountedRef.current = false;
        stopCamera();
      };
    }

    let cancelled = false;

    async function start() {
      setStatus('loading_models');
      setError(null);

      const modelResult = await loadFaceApiModels();
      if (cancelled || !mountedRef.current) return;

      if (!modelResult.ok) {
        setStatus('models_missing');
        setError(modelResult.error ?? 'Model files missing');
        setSignal(null);
        return;
      }

      setStatus('waiting_for_camera');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });

        if (cancelled || !mountedRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((t) => t.stop());
          setStatus('error');
          setError('Video element not ready');
          return;
        }

        video.srcObject = stream;
        await video.play();

        if (cancelled || !mountedRef.current) return;

        const waitForDimensions = () =>
          new Promise<void>((resolve) => {
            if (isVideoReadyForDetection(video)) {
              resolve();
              return;
            }
            const onReady = () => {
              if (isVideoReadyForDetection(video)) {
                video.removeEventListener('loadeddata', onReady);
                resolve();
              }
            };
            video.addEventListener('loadeddata', onReady);
            setTimeout(() => {
              video.removeEventListener('loadeddata', onReady);
              resolve();
            }, 3000);
          });

        await waitForDimensions();

        if (cancelled || !mountedRef.current) return;

        const runDetection = async () => {
          const el = videoRef.current;
          if (!el || cancelled || !isVideoReadyForDetection(el)) return;

          const detected = await detectExpressionFromVideo(el);
          if (cancelled || !mountedRef.current) return;

          if (!detected) {
            setStatus('no_face');
            setSignal(createNoFaceSignal());
            return;
          }

          setStatus('running');
          setSignal(detected);
        };

        setStatus('running');
        await runDetection();
        intervalRef.current = setInterval(runDetection, FACE_DETECTION_INTERVAL_MS);
      } catch (err) {
        if (cancelled || !mountedRef.current) return;
        if (isPermissionDenied(err)) {
          setStatus('permission_denied');
          setError('Camera permission denied');
        } else {
          const message =
            err instanceof Error ? err.message : 'Camera access failed or is unavailable';
          setStatus('error');
          setError(message);
        }
        setSignal(null);
      }
    }

    void start();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      stopCamera();
    };
  }, [enabled, stopCamera]);

  return { videoRef, status, signal, error };
}
