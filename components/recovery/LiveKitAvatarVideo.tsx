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
  /** Coaching line for the agent worker (ElevenLabs TTS + Bey lip-sync). */
  speakText?: string | null;
  status: AvatarStatus;
  coachLabel: string;
}

const LIVEKIT_STATUS: Record<string, string> = {
  idle: 'Preparing avatar…',
  connecting: 'Connecting to LiveKit…',
  connected: 'Waiting for agent worker…',
  waiting_agent: 'Start agent: npm run agent:dev',
  streaming: 'Speaking',
  error: 'Avatar error',
};

export function LiveKitAvatarVideo({
  sessionId,
  sessionActive,
  speakText,
  status,
  coachLabel,
}: LiveKitAvatarVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const livekit = useLiveKitAvatar(sessionId, sessionActive);

  useEffect(() => {
    livekit.attachVideo(videoRef.current);
  }, [livekit.attachVideo]);

  useEffect(() => {
    if (!speakText?.trim() || !sessionActive) return;
    void livekit.publishSpeakText(speakText);
  }, [speakText, sessionActive, livekit.publishSpeakText]);

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
      {/* Lip-synced audio plays from bey-avatar-agent track (not local ElevenLabs). */}

      {!showVideo ? (
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          {livekit.status === 'error' ? (
            <>
              <p className="text-sm text-[var(--amity-danger)]">{livekit.error}</p>
              <p className="text-xs text-[var(--amity-text-muted)]">
                Run <code className="rounded bg-black/20 px-1">npm run agent:dev</code> in a second
                terminal. Voice in chat still works via ElevenLabs.
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[var(--amity-primary)]" aria-hidden />
              <p className="text-sm font-medium text-[var(--amity-text)]">{coachLabel}</p>
              <p className="text-xs text-[var(--amity-text-muted)]">
                {LIVEKIT_STATUS[livekit.status] ?? 'Loading lip-synced avatar…'}
              </p>
            </>
          )}
        </motion.div>
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
            : LIVEKIT_STATUS[livekit.status] ?? livekit.status}
        </Badge>
      </div>
    </motion.div>
  );
}
