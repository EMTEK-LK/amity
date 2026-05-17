'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  publishLiveKitAvatarSpeak,
  setLiveKitAvatarVideoElement,
  subscribeLiveKitAvatarSession,
  type LiveKitAvatarSnapshot,
  type LiveKitAvatarStatus,
} from '@/lib/livekit-avatar-session';

export type { LiveKitAvatarStatus };

export interface UseLiveKitAvatarResult extends LiveKitAvatarSnapshot {
  attachVideo: (element: HTMLVideoElement | null) => void;
  publishSpeakText: (text: string, requestId: number) => Promise<boolean>;
}

/** Subscribe to LiveKit avatar state. Call retainLiveKitAvatarSession at page level — not here. */
export function useLiveKitAvatar(sessionId: string, enabled: boolean): UseLiveKitAvatarResult {
  const [snapshot, setSnapshot] = useState<LiveKitAvatarSnapshot>({
    status: 'idle',
    error: null,
    videoAttached: false,
    agentReady: false,
  });

  useEffect(() => {
    if (!enabled) return;
    return subscribeLiveKitAvatarSession(sessionId, setSnapshot);
  }, [enabled, sessionId]);

  const attachVideo = useCallback(
    (element: HTMLVideoElement | null) => {
      if (enabled) setLiveKitAvatarVideoElement(sessionId, element);
    },
    [enabled, sessionId]
  );

  const publishSpeakText = useCallback(
    async (text: string, requestId: number) => {
      if (!enabled) return false;
      return publishLiveKitAvatarSpeak(sessionId, text, requestId);
    },
    [enabled, sessionId]
  );

  return {
    ...snapshot,
    attachVideo,
    publishSpeakText,
  };
}
