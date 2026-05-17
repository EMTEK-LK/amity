import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusChip } from '@/components/ui/StatusChip';
import { DEMO_EMPLOYEE } from '@/lib/demo-trigger-scenarios';
import type { TwinStatusType } from '@/types/trigger';

interface EmployeeContextCardProps {
  statusType: TwinStatusType;
}

export function EmployeeContextCard({ statusType }: EmployeeContextCardProps) {
  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <CardTitle className="text-lg">{DEMO_EMPLOYEE.name}</CardTitle>
          <StatusChip status={statusType} />
        </div>
        <p className="text-sm text-[var(--amity-text-muted)]">
          {DEMO_EMPLOYEE.role} · {DEMO_EMPLOYEE.department}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
              Preferred mode
            </p>
            <p className="mt-0.5 font-medium text-[var(--amity-text)]">
              {DEMO_EMPLOYEE.preferredMode}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
              Employee ID
            </p>
            <p className="mt-0.5 font-mono text-xs text-[var(--amity-text)]">
              {DEMO_EMPLOYEE.id}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
            Connected signals
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_EMPLOYEE.connectedSignals.map((s) => (
              <Badge key={s} variant="neutral">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
