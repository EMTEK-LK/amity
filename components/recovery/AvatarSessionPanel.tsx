'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, ExternalLink, Mic, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { LiveKitAvatarVideo } from '@/components/recovery/LiveKitAvatarVideo';
import type { AgentAvatarDisplayMode } from '@/types/agent';
import type { AvatarStatus } from '@/types/recovery-room';

interface AvatarSessionPanelProps {
  sessionId: string;
  status: AvatarStatus;
  cameraEnabled: boolean;
  micEnabled: boolean;
  elapsedSeconds: number;
  sessionActive: boolean;
  displayMode?: AgentAvatarDisplayMode;
  embedUrl?: string | null;
  sessionUrl?: string | null;
  agentName?: string | null;
  avatarPlaceholder?: boolean;
  audioUrl?: string | null;
  speakText?: string | null;
  isSpeaking?: boolean;
}

const STATUS_LABEL: Record<AvatarStatus, string> = {
  ready: 'Ready to start',
  listening: 'Listening',
  responding: 'Responding',
  crisis: 'Crisis mode',
};

export function AvatarSessionPanel({
  sessionId,
  status,
  cameraEnabled,
  micEnabled,
  elapsedSeconds,
  sessionActive,
  displayMode = 'stage',
  embedUrl,
  sessionUrl,
  agentName,
  avatarPlaceholder = true,
  audioUrl,
  speakText,
  isSpeaking = false,
}: AvatarSessionPanelProps) {
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const showLiveKit = displayMode === 'livekit' && !avatarPlaceholder;
  const showIframe = displayMode === 'iframe' && Boolean(embedUrl) && !avatarPlaceholder;
  const coachLabel = agentName?.trim() || 'Amity Recovery Guide';
  const pulse = sessionActive && (status === 'listening' || status === 'responding' || playing || isSpeaking);

  useEffect(() => {
    if (showLiveKit || !audioUrl) return;
    const el = audioRef.current;
    if (!el) return;
    el.src = audioUrl;
    const onPlay = () => setPlaying(true);
    const onEnd = () => setPlaying(false);
    const onPause = () => setPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('ended', onEnd);
    el.addEventListener('pause', onPause);
    void el.play().catch(() => setPlaying(false));
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('ended', onEnd);
      el.removeEventListener('pause', onPause);
    };
  }, [audioUrl, showLiveKit]);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="border-b border-[var(--amity-border)] px-4 py-2">
        <p className="text-xs font-medium text-[var(--amity-text)]">{coachLabel}</p>
        <p className="text-[10px] text-[var(--amity-text-muted)]">
          {showLiveKit
            ? 'LiveKit + Beyond Presence lip-sync'
            : showIframe
              ? 'Beyond Presence live session'
              : 'Amity coach · voice-driven avatar'}
        </p>
      </div>
      <div
        className={cn(
          'relative flex aspect-[4/3] max-h-[min(52vh,420px)] flex-col overflow-hidden sm:aspect-video',
          status === 'crisis'
            ? 'bg-[var(--amity-danger-muted)]'
            : 'bg-gradient-to-b from-[var(--amity-bg-subtle)] to-[var(--amity-surface)]'
        )}
      >
        {showLiveKit ? (
          <LiveKitAvatarVideo
            sessionId={sessionId}
            sessionActive={sessionActive}
            speakText={speakText}
            status={status}
            coachLabel={coachLabel}
          />
        ) : showIframe ? (
          <iframe
            title="Beyond Presence recovery session"
            src={embedUrl!}
            className="absolute inset-0 h-full w-full border-0"
            allow="camera; microphone; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <AmityCoachStage status={status} pulse={pulse} playing={playing} coachLabel={coachLabel} />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3">
          <Badge variant={status === 'crisis' ? 'danger' : playing ? 'primary' : 'neutral'}>
            {playing ? 'Speaking' : STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="absolute left-3 top-3 z-20 flex gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--amity-border)] bg-[var(--amity-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--amity-text-muted)]">
            {cameraEnabled ? <Camera className="h-3 w-3" aria-hidden /> : <CameraOff className="h-3 w-3" aria-hidden />}
            {cameraEnabled ? 'Camera on' : 'Camera off'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--amity-border)] bg-[var(--amity-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--amity-text-muted)]">
            {micEnabled ? <Mic className="h-3 w-3" aria-hidden /> : <MicOff className="h-3 w-3" aria-hidden />}
            {micEnabled ? 'Mic on' : 'Mic off'}
          </span>
        </div>

        <motion.div className="absolute bottom-3 right-3 z-20 rounded-lg bg-[var(--amity-overlay)] px-2.5 py-1 text-xs font-medium tabular-nums text-white">
          {mm}:{ss}
        </motion.div>

        {audioUrl && !showLiveKit ? <audio ref={audioRef} className="hidden" preload="auto" /> : null}
      </div>
      <CardContent className="space-y-2 py-3 text-center text-xs text-[var(--amity-text-muted)]">
        {showLiveKit ? (
          <p>
            Run npm run agent:dev in a second terminal. The agent worker uses ElevenLabs + Beyond Presence for lip-sync video.
            Amity LLM powers the words — not the BP iframe agent.
          </p>
        ) : showIframe ? (
          <p>
            Full Beyond Presence call UI. Chat in Amity uses our LLM + ElevenLabs; this window is a
            separate BP agent session.
          </p>
        ) : (
          <>
            <p>
              Avatar reacts to <strong className="font-medium text-[var(--amity-text)]">ElevenLabs</strong>{' '}
              voice from Amity replies. Add LiveKit keys for lip-synced Beyond Presence video.
            </p>
            {sessionUrl && !avatarPlaceholder ? (
              <a
                href={sessionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 text-[var(--amity-primary)] hover:underline"
              >
                Open full Beyond Presence session
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function AmityCoachStage({
  status,
  pulse,
  playing,
  coachLabel,
}: {
  status: AvatarStatus;
  pulse: boolean;
  playing: boolean;
  coachLabel: string;
}) {
  return (
    <>
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center"
        animate={pulse ? { opacity: [0.35, 0.75, 0.35] } : { opacity: 0.25 }}
        transition={{ duration: playing ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.div
          className={cn(
            'rounded-full bg-[var(--amity-glow)] blur-3xl',
            playing ? 'h-48 w-48 sm:h-56 sm:w-56' : 'h-40 w-40 sm:h-52 sm:w-52'
          )}
          animate={playing ? { scale: [1, 1.08, 1] } : {}}
          transition={{ duration: 0.8, repeat: playing ? Infinity : 0 }}
        />
      </motion.div>

      {playing ? (
        <motion.div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute h-28 w-28 rounded-full border border-[var(--amity-primary)]/30 sm:h-36 sm:w-36"
              animate={{ scale: [1, 1.35 + i * 0.12], opacity: [0.45, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </motion.div>
      ) : null}

      <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
        <motion.div
          className={cn(
            'flex h-24 w-24 items-center justify-center rounded-full border-2 sm:h-32 sm:w-32',
            status === 'crisis'
              ? 'border-[var(--amity-danger)] bg-[var(--amity-surface)] text-[var(--amity-danger)]'
              : 'border-[var(--amity-primary)]/50 bg-[var(--amity-surface)] text-[var(--amity-primary)] shadow-lg shadow-[var(--amity-primary)]/10'
          )}
          animate={pulse ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: playing ? 0.9 : 2, repeat: Infinity }}
        >
          <span className="text-3xl font-semibold tracking-tight">AR</span>
        </motion.div>
        <motion.div>
          <p className="text-sm font-semibold text-[var(--amity-text)]">{coachLabel}</p>
          <p className="mt-1 text-xs text-[var(--amity-text-muted)]">
            {playing ? 'Delivering your recovery line…' : 'Use chat below — voice plays here'}
          </p>
        </motion.div>
      </div>
    </>
  );
}
