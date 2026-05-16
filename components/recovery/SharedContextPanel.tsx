'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { SharedSessionContext } from '@/types/session-context';
import { riskLevelLabel } from '@/lib/demo-trigger-scenarios';

interface SharedContextPanelProps {
  context: SharedSessionContext;
}

export function SharedContextPanel({ context }: SharedContextPanelProps) {
  const [showDev, setShowDev] = useState(false);

  const rows: { label: string; value: string }[] = [
    { label: 'Employee', value: context.employeeId },
    { label: 'Emotion', value: context.currentEmotion },
    { label: 'Stress', value: `${context.stressLevel}` },
    { label: 'Heart rate', value: `${context.heartRate} bpm` },
    { label: 'Voice', value: context.voiceState },
    {
      label: 'Visible cue',
      value: context.facialSignal?.expression ?? 'Not active',
    },
    { label: 'Engagement', value: context.engagement },
    { label: 'Risk', value: riskLevelLabel(context.riskLevel) },
    { label: 'Action', value: context.recommendedAction.replace(/_/g, ' ') },
  ];

  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Session context</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">Merged signal state</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
          {rows.map((r) => (
            <div key={r.label} className="contents">
              <dt className="text-[var(--amity-text-muted)]">{r.label}</dt>
              <dd className="font-medium capitalize text-[var(--amity-text)]">{r.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          onClick={() => setShowDev((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg py-1 text-xs text-[var(--amity-text-muted)] hover:text-[var(--amity-text)]"
        >
          Developer preview
          <ChevronDown className={cn('h-4 w-4 transition-transform', showDev && 'rotate-180')} />
        </button>
        {showDev && (
          <pre className="max-h-32 overflow-auto rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg)] p-2 font-mono text-[10px] text-[var(--amity-text-muted)]">
            {JSON.stringify(context, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
