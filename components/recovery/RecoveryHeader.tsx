'use client';

import { Badge } from '@/components/ui/Badge';
import { StatusChip } from '@/components/ui/StatusChip';
import type { StatusType } from '@/components/ui/StatusChip';
import type { RecoverySessionStatus, RecoverySafetyState } from '@/types/recovery-room';
import { DEMO_EMPLOYEE } from '@/lib/demo-identities';

interface RecoveryHeaderProps {
  sessionMode: string;
  sessionStatus: RecoverySessionStatus;
  safetyState: RecoverySafetyState;
}

function statusChip(safety: RecoverySafetyState): StatusType {
  if (safety === 'crisis') return 'crisis';
  if (safety === 'recovery_needed') return 'recovery_needed';
  if (safety === 'elevated') return 'support_recommended';
  return 'stable';
}

export function RecoveryHeader({
  sessionMode,
  sessionStatus,
  safetyState,
}: RecoveryHeaderProps) {
  return (
    <header className="space-y-3 border-b border-[var(--amity-border)] pb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--amity-primary)]">
            Private recovery
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--amity-text)] sm:text-2xl">
            Recovery Room
          </h1>
          <p className="mt-0.5 text-sm text-[var(--amity-text-muted)]">
            {DEMO_EMPLOYEE.name} · {sessionMode}
          </p>
        </div>
        <StatusChip status={statusChip(safetyState)} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success">Employee-private</Badge>
        <Badge variant="neutral">
          {sessionStatus === 'consent'
            ? 'Awaiting consent'
            : sessionStatus === 'crisis'
              ? 'Crisis mode'
              : sessionStatus === 'paused'
                ? 'Paused'
                : 'In session'}
        </Badge>
      </div>
      <p className="text-xs text-[var(--amity-text-muted)]">
        Video-first support with Amity Recovery Guide. Demo session — integrations simulated.
      </p>
    </header>
  );
}
