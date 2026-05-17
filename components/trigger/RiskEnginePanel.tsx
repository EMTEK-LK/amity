'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusChip } from '@/components/ui/StatusChip';
import { riskLevelLabel } from '@/lib/demo-trigger-scenarios';
import type { TriggerScenario } from '@/types/trigger';
import type { StatusType } from '@/components/ui/StatusChip';

interface RiskEnginePanelProps {
  scenario: TriggerScenario | null;
  riskScore: number;
  statusType: import('@/types/trigger').TwinStatusType;
}

export function RiskEnginePanel({ scenario, riskScore, statusType }: RiskEnginePanelProps) {
  const status = statusType as StatusType;

  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">Risk decision</CardTitle>
          <StatusChip status={status} />
        </div>
        <CardDescription>
          {scenario ? 'Risk recalculated' : 'Awaiting signal'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar
          label="Risk score"
          value={riskScore}
          tone={
            scenario?.isCrisis
              ? 'danger'
              : scenario?.riskLevel === 'high'
                ? 'warning'
                : scenario
                  ? 'primary'
                  : 'success'
          }
        />

        {scenario ? (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                Risk level
              </dt>
              <dd className="mt-0.5 font-semibold text-[var(--amity-text)]">
                {riskLevelLabel(scenario.riskLevel)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                Why Amity responded
              </dt>
              <dd className="mt-0.5 leading-relaxed text-[var(--amity-text-muted)]">
                {scenario.riskReason}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                Recommended action
              </dt>
              <dd className="mt-0.5 font-medium text-[var(--amity-primary)]">
                {scenario.riskAction}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-[var(--amity-text-muted)]">
            Select a workplace scenario to simulate incoming signals and recalculate risk.
          </p>
        )}

        {scenario?.crisisNotice && (
          <p className="rounded-xl border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] p-3 text-sm leading-relaxed text-[var(--amity-danger)]">
            {scenario.crisisNotice}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
