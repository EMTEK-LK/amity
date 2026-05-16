'use client';

import { Activity, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusChip } from '@/components/ui/StatusChip';
import type { EmotionalTwinState } from '@/types/trigger';
import type { StatusType } from '@/components/ui/StatusChip';
import { WellnessRing } from './WellnessRing';

interface EmotionalTwinPanelProps {
  twin: EmotionalTwinState;
  hasSelection: boolean;
}

function ringTone(
  twin: EmotionalTwinState
): 'primary' | 'success' | 'warning' | 'danger' {
  if (twin.riskLevel === 'crisis') return 'danger';
  if (twin.riskLevel === 'high') return 'warning';
  if (twin.riskLevel === 'support_recommended') return 'primary';
  return 'success';
}

export function EmotionalTwinPanel({ twin, hasSelection }: EmotionalTwinPanelProps) {
  const status = twin.statusType as StatusType;

  return (
    <Card variant="elevated" className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Emotional digital twin</CardTitle>
          <StatusChip status={status} />
        </div>
        <p className="text-sm text-[var(--amity-text-muted)]">
          {hasSelection ? 'Live simulation' : 'Stable baseline'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center py-2">
          <WellnessRing
            value={twin.stressScore}
            label="Stress score"
            sublabel="/ 100"
            tone={ringTone(twin)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-3">
            <div className="flex items-center gap-2 text-[var(--amity-text-muted)]">
              <Heart className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wide">Heart rate</span>
            </div>
            <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--amity-text)]">
              {twin.heartRate}
              <span className="ml-1 text-sm font-normal text-[var(--amity-text-muted)]">bpm</span>
            </p>
          </div>
          <div className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-3">
            <div className="flex items-center gap-2 text-[var(--amity-text-muted)]">
              <Activity className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wide">Emotion</span>
            </div>
            <p className="mt-1 text-sm font-semibold leading-snug text-[var(--amity-text)]">
              {twin.emotion}
            </p>
          </div>
        </div>

        <ProgressBar
          label="Risk score"
          value={twin.riskScore}
          tone={
            twin.riskLevel === 'crisis'
              ? 'danger'
              : twin.riskLevel === 'high'
                ? 'warning'
                : 'primary'
          }
        />

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-xs text-[var(--amity-text-muted)]">Risk level</p>
            <p className="font-medium capitalize text-[var(--amity-text)]">
              {twin.riskLevel.replace('_', ' ')}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--amity-text-muted)]">Recovery mode</p>
            <p className="font-medium text-[var(--amity-text)]">{twin.recoveryMode}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
