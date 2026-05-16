import { Activity, Clock, ShieldCheck, TrendingDown } from 'lucide-react';
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

const weekly = [
  { label: 'Week 1', value: 28 },
  { label: 'Week 2', value: 41 },
  { label: 'Week 3', value: 33 },
  { label: 'Week 4', value: 52 },
];

export default function AdminAnalyticsPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Company admin"
        title="Analytics"
        description="Aggregated wellbeing trends across the organization. Numbers only — never the content of a session."
        action={
          <Badge variant="success">
            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
            Anonymized
          </Badge>
        }
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Avg stress drop"
          value="34%"
          helper="Per session"
          icon={TrendingDown}
          tone="success"
        />
        <MetricCard
          label="Sessions / week"
          value="38"
          helper="Trailing 4 weeks"
          icon={Activity}
          tone="primary"
        />
        <MetricCard
          label="Avg session length"
          value="4.6 min"
          helper="Short resets"
          icon={Clock}
          tone="info"
        />
      </section>

      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle>Recovery sessions by week</CardTitle>
          <CardDescription>Volume of completed private resets — no identities.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-end gap-4 pt-6">
          {weekly.map((w) => (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-40 w-full items-end">
                <div
                  className="w-full rounded-t-lg bg-[var(--amity-primary)] transition-all"
                  style={{ height: `${w.value * 1.6}%` }}
                  aria-hidden
                />
              </div>
              <span className="text-xs font-medium text-[var(--amity-text)]">{w.value}</span>
              <span className="text-xs text-[var(--amity-text-muted)]">{w.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="soft" className="mt-6">
        <CardContent className="space-y-3 text-sm leading-relaxed text-[var(--amity-text-muted)]">
          <p>
            <span className="font-medium text-[var(--amity-text)]">Future scope:</span>{' '}
            department filters, trend forecasting, and integration signals (Teams, Slack,
            calendar) will feed these aggregates — still privacy-safe.
          </p>
          <ProgressBar label="Org wellbeing trend" value={68} tone="success" />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
