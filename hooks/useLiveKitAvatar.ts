'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  publishLiveKitAvatarAudio,
  retainLiveKitAvatarSession,
  setLiveKitAvatarVideoElement,
  subscribeLiveKitAvatarSession,
  type LiveKitAvatarSnapshot,
  type LiveKitAvatarStatus,
} from '@/lib/livekit-avatar-session';

export type { LiveKitAvatarStatus };

export interface UseLiveKitAvatarResult extends LiveKitAvatarSnapshot {
  attachVideo: (element: HTMLVideoElement | null) => void;
  publishRecoveryAudio: (audioUrl: string) => Promise<void>;
  disconnect: () => void;
}

export function useLiveKitAvatar(
  sessionId: string,
  enabled: boolean
): UseLiveKitAvatarResult {
  const [snapshot, setSnapshot] = useState<LiveKitAvatarSnapshot>({
    status: 'idle',
    error: null,
    videoAttached: false,
  });

  useEffect(() => {
    if (!enabled) return;

    const release = retainLiveKitAvatarSession(sessionId);
    const unsubscribe = subscribeLiveKitAvatarSession(sessionId, setSnapshot);

    return () => {
      unsubscribe();
      release();
    };
  }, [enabled, sessionId]);

  const attachVideo = useCallback(
    (element: HTMLVideoElement | null) => {
      if (enabled) setLiveKitAvatarVideoElement(sessionId, element);
    },
    [enabled, sessionId]
  );

  const publishRecoveryAudio = useCallback(
    async (audioUrl: string) => {
      if (!enabled) return;
      publishLiveKitAvatarAudio(sessionId, audioUrl);
    },
    [enabled, sessionId]
  );

  const disconnect = useCallback(() => {
    /* teardown is ref-counted via retain/release */
  }, []);

  return {
    ...snapshot,
    attachVideo,
    publishRecoveryAudio,
    disconnect,
  };
}
