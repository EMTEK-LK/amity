'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { AvatarStatus } from '@/types/recovery-room';

interface AvatarSessionPanelProps {
  status: AvatarStatus;
  cameraEnabled: boolean;
  micEnabled: boolean;
  elapsedSeconds: number;
  sessionActive: boolean;
}

const STATUS_LABEL: Record<AvatarStatus, string> = {
  ready: 'Ready to start',
  listening: 'Listening',
  responding: 'Responding',
  crisis: 'Crisis mode',
};

export function AvatarSessionPanel({
  status,
  cameraEnabled,
  micEnabled,
  elapsedSeconds,
  sessionActive,
}: AvatarSessionPanelProps) {
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (!sessionActive || status === 'crisis') {
      setPulse(false);
      return;
    }
    setPulse(status === 'listening' || status === 'responding');
  }, [sessionActive, status]);

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="border-b border-[var(--amity-border)] px-4 py-2">
        <p className="text-xs font-medium text-[var(--amity-text)]">
          Amity Recovery Guide
        </p>
        <p className="text-[10px] text-[var(--amity-text-muted)]">Avatar output</p>
      </div>
      <div
        className={cn(
          'relative flex aspect-[4/3] max-h-[min(52vh,420px)] flex-col items-center justify-center sm:aspect-video',
          status === 'crisis'
            ? 'bg-[var(--amity-danger-muted)]'
            : 'bg-[var(--amity-bg-subtle)]'
        )}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          animate={pulse ? { opacity: [0.4, 0.7, 0.4] } : { opacity: 0.3 }}
          transition={{ duration: 2.5, repeat: pulse ? Infinity : 0, ease: 'easeInOut' }}
        >
          <div className="h-40 w-40 rounded-full bg-[var(--amity-glow)] blur-3xl sm:h-52 sm:w-52" />
        </motion.div>

        <div className="relative z-10 flex flex-col items-center gap-4 px-4 text-center">
          <motion.div
            className={cn(
              'flex h-24 w-24 items-center justify-center rounded-full border-2 sm:h-28 sm:w-28',
              status === 'crisis'
                ? 'border-[var(--amity-danger)] bg-[var(--amity-surface)] text-[var(--amity-danger)]'
                : 'border-[var(--amity-primary)]/40 bg-[var(--amity-surface)] text-[var(--amity-primary)]'
            )}
            animate={pulse ? { scale: [1, 1.03, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl font-semibold tracking-tight">AR</span>
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-[var(--amity-text)]">Amity Recovery Guide</p>
            <p className="mt-1 text-xs text-[var(--amity-text-muted)]">
              Avatar lip-sync connects here in production
            </p>
          </div>
          <Badge variant={status === 'crisis' ? 'danger' : 'primary'}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--amity-border)] bg-[var(--amity-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--amity-text-muted)]">
            {cameraEnabled ? (
              <Camera className="h-3 w-3" aria-hidden />
            ) : (
              <CameraOff className="h-3 w-3" aria-hidden />
            )}
            {cameraEnabled ? 'Camera on' : 'Camera off'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--amity-border)] bg-[var(--amity-surface)]/90 px-2 py-1 text-[10px] font-medium text-[var(--amity-text-muted)]">
            {micEnabled ? (
              <Mic className="h-3 w-3" aria-hidden />
            ) : (
              <MicOff className="h-3 w-3" aria-hidden />
            )}
            {micEnabled ? 'Mic on' : 'Mic off'}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-lg bg-[var(--amity-overlay)] px-2.5 py-1 text-xs font-medium tabular-nums text-white">
          {mm}:{ss}
        </div>
      </div>
      <CardContent className="py-3 text-center text-xs text-[var(--amity-text-muted)]">
        This is the avatar output area. Your local camera signal appears in the session context
        panel.
      </CardContent>
    </Card>
  );
}
