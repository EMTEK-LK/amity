'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SharedSessionContext } from '@/types/session-context';

interface SignalStatusPanelProps {
  context: SharedSessionContext;
  cameraEnabled: boolean;
  micEnabled: boolean;
  sessionStarted: boolean;
}

interface SignalRow {
  title: string;
  status: string;
  source: string;
  detail: string;
  variant: 'primary' | 'neutral' | 'warning';
}

export function SignalStatusPanel({
  context,
  cameraEnabled,
  micEnabled,
  sessionStarted,
}: SignalStatusPanelProps) {
  const facial: SignalRow = cameraEnabled
    ? {
        title: 'Facial awareness',
        status: 'Simulated',
        source: 'Optional · consent-based',
        detail: context.facialSignal
          ? `Cue: ${context.facialSignal.expression} · demo only`
          : 'Low engagement · demo only',
        variant: 'primary',
      }
    : {
        title: 'Facial awareness',
        status: 'Paused',
        source: 'Optional',
        detail: 'Camera not enabled',
        variant: 'neutral',
      };

  const voice: SignalRow = micEnabled
    ? {
        title: 'Voice signal',
        status: sessionStarted ? 'Active' : 'Ready',
        source: 'Microphone',
        detail: `State: ${context.voiceState}`,
        variant: 'primary',
      }
    : {
        title: 'Voice signal',
        status: 'Off',
        source: 'Microphone',
        detail: 'Enable mic for voice adaptation',
        variant: 'neutral',
      };

  const trigger: SignalRow = {
    title: 'Trigger signal',
    status: context.triggerType ? 'Loaded' : 'Baseline',
    source: context.source === 'session_init' ? 'Session start' : String(context.source),
    detail: context.triggerType ?? 'No trigger from demo',
    variant: context.triggerType ? 'warning' : 'neutral',
  };

  const rows = [trigger, voice, facial];

  return (
    <Card variant="soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Signal pipelines</CardTitle>
        <p className="text-xs text-[var(--amity-text-muted)]">Parallel inputs · MVP simulated</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.title}
            className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-[var(--amity-text)]">{row.title}</p>
              <Badge variant={row.variant}>{row.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--amity-primary)]">{row.source}</p>
            <p className="mt-0.5 text-xs text-[var(--amity-text-muted)]">{row.detail}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
