import {
  Activity,
  Building2,
  ShieldCheck,
  TrendingDown,
  Users,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
  PageContainer,
  ProgressBar,
  SectionHeader,
} from '@/components/ui';
import { DEMO_ADMIN } from '@/lib/demo-identities';

const triggerCategories = [
  { label: 'Manager conflict', value: 38, tone: 'primary' as const },
  { label: 'Customer escalation', value: 27, tone: 'warning' as const },
  { label: 'Workload spike', value: 21, tone: 'primary' as const },
  { label: 'Difficult feedback', value: 14, tone: 'success' as const },
];

const departments = [
  { name: 'Customer Support', sessions: 48, drop: 36 },
  { name: 'Sales', sessions: 31, drop: 29 },
  { name: 'Engineering', sessions: 24, drop: 41 },
  { name: 'Operations', sessions: 19, drop: 33 },
];

export default function AdminDashboardPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow={`Company admin · ${DEMO_ADMIN.company}`}
        title="Wellbeing Dashboard"
        description="Privacy-safe, aggregated wellbeing analytics for leadership — never private transcripts or personal detail."
        action={
          <Badge variant="success">
            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
            Aggregated only
          </Badge>
        }
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Recovery sessions"
          value="142"
          helper="Last 30 days"
          icon={Activity}
          tone="primary"
          trend={{ value: '+18%', positive: true }}
        />
        <MetricCard
          label="Avg stress drop"
          value="34%"
          helper="Per completed session"
          icon={TrendingDown}
          tone="success"
          trend={{ value: '+6%', positive: true }}
        />
        <MetricCard
          label="Departments active"
          value="9"
          helper="Across the org"
          icon={Users}
          tone="info"
        />
        <MetricCard
          label="Privacy mode"
          value="On"
          helper="No transcripts stored"
          icon={ShieldCheck}
          tone="success"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card variant="elevated" className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Trigger categories</CardTitle>
            <CardDescription>
              Distribution of simulated workplace signals — category-level only, no individuals.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
            {triggerCategories.map((cat) => (
              <ProgressBar
                key={cat.label}
                label={cat.label}
                value={cat.value}
                tone={cat.tone}
              />
            ))}
          </CardContent>
        </Card>

        <Card variant="soft" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>What leadership sees</CardTitle>
            <CardDescription>Wellbeing signals without compromising privacy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-sm leading-relaxed text-[var(--amity-text-muted)]">
            <p>
              <span className="font-medium text-[var(--amity-text)]">Visible:</span> session
              counts, average stress reduction, trigger categories, department-level trends.
            </p>
            <p>
              <span className="font-medium text-[var(--amity-text)]">Never visible:</span>{' '}
              transcripts, personal confessions, medical labels, or private recovery notes.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Department trends</CardTitle>
            <CardDescription>
              Aggregated activity and average stress reduction by team.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ul className="divide-y divide-[var(--amity-border)]">
              {departments.map((d) => (
                <li
                  key={d.name}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-primary)]">
                      <Building2 className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <p className="font-medium text-[var(--amity-text)]">{d.name}</p>
                      <p className="text-xs text-[var(--amity-text-muted)]">
                        {d.sessions} sessions
                      </p>
                    </div>
                  </div>
                  <div className="sm:w-56">
                    <ProgressBar label="Avg stress drop" value={d.drop} tone="success" />
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
