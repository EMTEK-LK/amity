'use client';

import { useEffect, useRef } from 'react';
import { recoveryDebug, recoveryDebugWarn } from '@/lib/recovery-debug';

/** Plays ElevenLabs audio locally — always on, independent of LiveKit. */
export function useRecoveryVoicePlayback(audioUrl: string | null | undefined, enabled: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) {
      recoveryDebug('Voice', 'playback disabled', {
        hasUrl: Boolean(audioUrl),
      });
      return;
    }
    if (!audioUrl) {
      recoveryDebug('Voice', 'no audioUrl yet');
      return;
    }

    recoveryDebug('Voice', 'playing reply', {
      urlPrefix: audioUrl.slice(0, 48),
      urlLength: audioUrl.length,
    });

    const audio = new Audio(audioUrl);
    audio.setAttribute('playsinline', 'true');
    audioRef.current = audio;

    void (async () => {
      try {
        await audio.play();
        recoveryDebug('Voice', 'play() succeeded', { duration: audio.duration });
      } catch (err) {
        recoveryDebugWarn('Voice', 'play() blocked or failed', {
          error: err instanceof Error ? err.message : String(err),
          name: err instanceof Error ? err.name : undefined,
        });
      }
    })();

    audio.addEventListener('ended', () => {
      recoveryDebug('Voice', 'playback ended');
    });

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, [audioUrl, enabled]);

  return audioRef;
}
