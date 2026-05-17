'use client';

import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { BadgeVariant } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import type { FacialAwarenessSignal, FacialAwarenessStatus } from '@/types/facial-awareness';

interface FacialAwarenessPanelProps {
  enabled: boolean;
  onEnabledChange?: (enabled: boolean) => void;
  canToggle?: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: FacialAwarenessStatus;
  signal: FacialAwarenessSignal | null;
  error?: string | null;
}

function statusLabel(status: FacialAwarenessStatus): string {
  const labels: Record<FacialAwarenessStatus, string> = {
    idle: 'Idle',
    loading_models: 'Loading models…',
    waiting_for_camera: 'Waiting for camera…',
    running: 'Running',
    no_face: 'No face detected',
    models_missing: 'Model files missing',
    permission_denied: 'Permission denied',
    camera_off: 'Camera off',
    paused: 'Paused',
    error: 'Error',
  };
  return labels[status];
}

function statusBadgeVariant(status: FacialAwarenessStatus): BadgeVariant {
  if (status === 'running') return 'success';
  if (
    status === 'no_face' ||
    status === 'loading_models' ||
    status === 'waiting_for_camera'
  ) {
    return 'warning';
  }
  if (status === 'error' || status === 'models_missing' || status === 'permission_denied') {
    return 'danger';
  }
  return 'neutral';
}

export function FacialAwarenessPanel({
  enabled,
  onEnabledChange,
  canToggle = false,
  videoRef,
  status,
  signal,
  error,
}: FacialAwarenessPanelProps) {
  const showPreview =
    enabled &&
    status !== 'models_missing' &&
    status !== 'camera_off' &&
    status !== 'idle' &&
    status !== 'permission_denied';

  return (
    <Card variant="soft" className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Local facial awareness signal</CardTitle>
            <p className="text-xs text-[var(--amity-text-muted)]">
              Optional browser-side cue. Not a diagnosis.
            </p>
          </div>
          <Badge variant={statusBadgeVariant(status)}>{statusLabel(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-[var(--amity-text-muted)]">
          Camera analysis runs locally. Only summarized cues are used as session context.
        </p>

        {canToggle && onEnabledChange && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={enabled ? 'primary' : 'secondary'}
              onClick={() => onEnabledChange(true)}
              className="min-h-10 flex-1 sm:flex-none"
            >
              <Camera className="mr-1.5 h-4 w-4" />
              Enable
            </Button>
            <Button
              type="button"
              size="sm"
              variant={!enabled ? 'primary' : 'secondary'}
              onClick={() => onEnabledChange(false)}
              className="min-h-10 flex-1 sm:flex-none"
            >
              <CameraOff className="mr-1.5 h-4 w-4" />
              Disable
            </Button>
          </div>
        )}

        {showPreview && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg)]">
            <video
              ref={videoRef}
              className="h-full w-full scale-x-[-1] object-cover"
              playsInline
              muted
              aria-label="Local camera preview for optional facial awareness"
            />
          </div>
        )}

        {!enabled && (
          <p className="text-sm text-[var(--amity-text-muted)]">
            Camera off. Enable only if you consent to optional local expression cues.
          </p>
        )}

        {status === 'models_missing' && (
          <div className="flex gap-2 rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg)] p-3 text-sm text-[var(--amity-text-muted)]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amity-warning)]" />
            <span>
              Model files missing. Add weights to{' '}
              <code className="text-xs">public/models</code> (see docs/FACIAL_AWARENESS.md).
            </span>
          </div>
        )}

        {status === 'no_face' && enabled && (
          <p className="text-sm text-[var(--amity-text-muted)]">
            No face detected — session continues. This is not a crisis signal.
          </p>
        )}

        {error && status !== 'models_missing' && (
          <p className="text-sm text-[var(--amity-danger)]">{error}</p>
        )}

        {signal && enabled && status !== 'models_missing' && status !== 'no_face' && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-[var(--amity-text-muted)]">Expression cue</dt>
            <dd className="font-medium capitalize">{signal.expression}</dd>
            <dt className="text-[var(--amity-text-muted)]">Confidence</dt>
            <dd className="font-medium">
              {(signal.confidence * 100).toFixed(0)}%
              <span className="ml-1 text-xs font-normal text-[var(--amity-text-muted)]">
                (indicative)
              </span>
            </dd>
            <dt className="text-[var(--amity-text-muted)]">Engagement</dt>
            <dd className="font-medium capitalize">{signal.engagement}</dd>
            <dt className="text-[var(--amity-text-muted)]">Signal quality</dt>
            <dd>
              <Badge variant="neutral">{signal.signalQuality}</Badge>
            </dd>
          </dl>
        )}

        <p className={cn('text-xs text-[var(--amity-text-muted)]')}>
          Raw video is never sent to Gemini or Amity servers.
        </p>
      </CardContent>
    </Card>
  );
}
