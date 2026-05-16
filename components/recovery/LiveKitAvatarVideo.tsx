'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useLiveKitAvatar } from '@/hooks/useLiveKitAvatar';
import { cn } from '@/lib/utils';
import type { AvatarStatus } from '@/types/recovery-room';

interface LiveKitAvatarVideoProps {
  sessionId: string;
  sessionActive: boolean;
  audioUrl?: string | null;
  status: AvatarStatus;
  coachLabel: string;
}

const LIVEKIT_STATUS: Record<string, string> = {
  idle: 'Preparing avatar…',
  connecting: 'Connecting to LiveKit…',
  connected: 'Avatar channel ready',
  activating: 'Starting Beyond Presence…',
  streaming: 'Speaking',
  error: 'Avatar error',
};

export function LiveKitAvatarVideo({
  sessionId,
  sessionActive,
  audioUrl,
  status,
  coachLabel,
}: LiveKitAvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const livekit = useLiveKitAvatar(sessionId, sessionActive);

  useEffect(() => {
    livekit.attachVideo(videoRef.current);
  }, [livekit.attachVideo]);

  useEffect(() => {
    if (!audioUrl || !sessionActive) return;
    void livekit.publishRecoveryAudio(audioUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- publish when audio URL changes only
  }, [audioUrl, sessionActive]);

  const showVideo = livekit.videoAttached;
  const pulse = livekit.status === 'streaming' || status === 'responding';

  return (
    <motion.div className="relative h-full w-full">
      <video
        ref={videoRef}
        className={cn(
          'absolute inset-0 h-full w-full object-cover',
          showVideo ? 'opacity-100' : 'opacity-0'
        )}
        playsInline
        autoPlay
        muted={false}
      />

      {!showVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {livekit.status === 'error' ? (
            <>
              <p className="text-sm text-[var(--amity-danger)]">{livekit.error}</p>
              <p className="text-xs text-[var(--amity-text-muted)]">
                Check LiveKit Cloud keys and Beyond Presence avatar ID. Falling back to voice-only
                still works in chat.
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[var(--amity-primary)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--amity-text)]">{coachLabel}</p>
              <p className="text-xs text-[var(--amity-text-muted)]">
                {LIVEKIT_STATUS[livekit.status] ?? 'Loading lip-synced avatar…'} Voice plays from
                ElevenLabs while the avatar connects.
              </p>
            </>
          )}
        </div>
      ) : null}

      {pulse && showVideo ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-none ring-2 ring-[var(--amity-primary)]/40"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      ) : null}

      <div className="absolute bottom-3 left-3 z-10">
        <Badge variant={livekit.status === 'error' ? 'danger' : 'primary'}>
          {livekit.videoAttached
            ? 'Lip-sync live'
            : livekit.status === 'activating'
              ? 'Starting avatar…'
              : LIVEKIT_STATUS[livekit.status]}
        </Badge>
      </div>
    </motion.div>
  );
}
