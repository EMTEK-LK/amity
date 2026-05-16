'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  publishLiveKitAvatarSpeak,
  retainLiveKitAvatarSession,
  setLiveKitAvatarVideoElement,
  subscribeLiveKitAvatarSession,
  type LiveKitAvatarSnapshot,
  type LiveKitAvatarStatus,
} from '@/lib/livekit-avatar-session';

export type { LiveKitAvatarStatus };

export interface UseLiveKitAvatarResult extends LiveKitAvatarSnapshot {
  attachVideo: (element: HTMLVideoElement | null) => void;
  publishSpeakText: (text: string) => Promise<void>;
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

  const publishSpeakText = useCallback(
    async (text: string) => {
      if (!enabled) return;
      publishLiveKitAvatarSpeak(sessionId, text);
    },
    [enabled, sessionId]
  );

  return {
    ...snapshot,
    attachVideo,
    publishSpeakText,
    disconnect: () => undefined,
  };
}
