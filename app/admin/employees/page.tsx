import { ShieldCheck } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  SectionHeader,
  StatusChip,
} from '@/components/ui';
import type { StatusType } from '@/components/ui';
import { DEMO_EMPLOYEE } from '@/lib/demo-identities';

interface Row {
  name: string;
  department: string;
  status: StatusType;
  sessions: number;
}

const employees: Row[] = [
  {
    name: DEMO_EMPLOYEE.name,
    department: DEMO_EMPLOYEE.department,
    status: 'stable',
    sessions: 3,
  },
  { name: 'Daniel Mendis', department: 'Sales', status: 'watch', sessions: 5 },
  { name: 'Priya Nair', department: 'Engineering', status: 'stable', sessions: 1 },
  {
    name: 'Marcus Lee',
    department: 'Customer Care',
    status: 'support_recommended',
    sessions: 4,
  },
  { name: 'Aisha Khan', department: 'Operations', status: 'stable', sessions: 2 },
];

export default function AdminEmployeesPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Company admin"
        title="Employees"
        description="High-level wellbeing status only. Admins never see private sessions, transcripts, or personal detail."
        action={
          <Badge variant="success">
            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
            Privacy-safe
          </Badge>
        }
      />

      <Card variant="default" className="mt-8">
        <CardHeader>
          <CardTitle>Team status</CardTitle>
          <CardDescription>
            Status and session counts are aggregated signals — not emotional content.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ul className="divide-y divide-[var(--amity-border)]">
            {employees.map((e) => (
              <li
                key={e.name}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-sm font-semibold text-[var(--amity-primary)]">
                    {e.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--amity-text)]">{e.name}</p>
                    <p className="text-xs text-[var(--amity-text-muted)]">{e.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[var(--amity-text-muted)]">
                    {e.sessions} sessions
                  </span>
                  <StatusChip status={e.status} />
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card variant="soft" className="mt-6">
        <CardContent className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
          <span className="font-medium text-[var(--amity-text)]">Privacy boundary:</span>{' '}
          opening an employee never reveals their recovery conversation. Crisis events route to
          a wellbeing officer, not to this list.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
