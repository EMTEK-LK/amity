'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FacialAwarenessPanel } from '@/components/recovery/FacialAwarenessPanel';
import { cn } from '@/lib/utils';
import type { FacialAwarenessSignal, FacialAwarenessStatus } from '@/types/facial-awareness';
import type { GeminiProviderStatus } from '@/types/agent';
import type { SharedSessionContext } from '@/types/session-context';
import { riskLevelLabel } from '@/lib/demo-trigger-scenarios';

interface SharedContextPanelProps {
  context: SharedSessionContext;
  facialEnabled?: boolean;
  onFacialEnabledChange?: (enabled: boolean) => void;
  facialVideoRef?: React.RefObject<HTMLVideoElement | null>;
  facialStatus?: FacialAwarenessStatus;
  facialSignal?: FacialAwarenessSignal | null;
  facialError?: string | null;
  geminiProvider?: GeminiProviderStatus | null;
}

export function SharedContextPanel({
  context,
  facialEnabled = false,
  onFacialEnabledChange,
  facialVideoRef,
  facialStatus = 'idle',
  facialSignal = null,
  facialError,
  geminiProvider,
}: SharedContextPanelProps) {
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
    {
      label: 'Facial confidence',
      value:
        context.facialConfidence != null
          ? `${Math.round(context.facialConfidence * 100)}% (indicative)`
          : '—',
    },
    { label: 'Engagement', value: context.engagement },
    {
      label: 'Facial quality',
      value: context.facialSignalQuality ?? '—',
    },
    { label: 'Risk', value: riskLevelLabel(context.riskLevel) },
    { label: 'Action', value: context.recommendedAction.replace(/_/g, ' ') },
    {
      label: 'Gemini',
      value: geminiProvider
        ? geminiProvider === 'real'
          ? 'Connected (real)'
          : geminiProvider === 'safety'
            ? 'Safety mode'
            : geminiProvider === 'not_configured'
              ? 'API key missing'
              : 'Request failed'
        : 'Awaiting message',
    },
  ];

  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Session context</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">Merged signal state</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {facialVideoRef && (
          <FacialAwarenessPanel
            enabled={facialEnabled}
            onEnabledChange={onFacialEnabledChange}
            canToggle={Boolean(onFacialEnabledChange)}
            videoRef={facialVideoRef}
            status={facialStatus}
            signal={facialSignal ?? context.facialSignal}
            error={facialError}
          />
        )}

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
