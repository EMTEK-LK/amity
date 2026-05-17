'use client';

import { cn } from '@/lib/utils';
import { SIGNAL_TYPE_LABELS } from '@/lib/demo-trigger-scenarios';
import { riskLevelLabel } from '@/lib/demo-trigger-scenarios';
import type { TriggerScenario } from '@/types/trigger';
import { Badge } from '@/components/ui/Badge';
import { TriggerIcon } from './TriggerIcon';

interface ScenarioCardProps {
  scenario: TriggerScenario;
  selected: boolean;
  onSelect: () => void;
}

function riskBadgeVariant(
  level: TriggerScenario['riskLevel']
): 'danger' | 'warning' | 'info' | 'neutral' {
  if (level === 'crisis') return 'danger';
  if (level === 'high') return 'warning';
  if (level === 'support_recommended') return 'info';
  return 'neutral';
}

export function ScenarioCard({ scenario, selected, onSelect }: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
        'min-h-[120px]',
        selected
          ? 'border-[var(--amity-primary)] bg-[var(--amity-primary-muted)] shadow-[var(--amity-shadow)] ring-1 ring-[var(--amity-primary)]/30'
          : 'border-[var(--amity-border)] bg-[var(--amity-surface)] hover:border-[var(--amity-primary)]/35 hover:bg-[var(--amity-bg-subtle)]'
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border',
            selected
              ? 'border-[var(--amity-primary)]/40 bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
              : 'border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-text-muted)]'
          )}
        >
          <TriggerIcon iconKey={scenario.iconKey} className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--amity-text)]">{scenario.name}</p>
            <Badge variant={riskBadgeVariant(scenario.riskLevel)}>
              {riskLevelLabel(scenario.riskLevel)}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-[var(--amity-primary)]">{scenario.sourceLabel}</p>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--amity-text-muted)]">
            {scenario.context}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {scenario.signalTypes.map((t) => (
              <span
                key={t}
                className="rounded-md border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--amity-text-muted)]"
              >
                {SIGNAL_TYPE_LABELS[t]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
