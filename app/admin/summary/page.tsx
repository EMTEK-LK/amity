import { FileText, Lock, ShieldCheck } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
  PageContainer,
  SectionHeader,
} from '@/components/ui';

const highlights = [
  'Most common trigger this period: manager conflict.',
  'Average stress reduction held steady at roughly one third per session.',
  'No crisis escalations required a company-level action this period.',
];

export default function AdminSummaryPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Company admin"
        title="Wellbeing Summary"
        description="A privacy-safe, organization-level recap. This is the company view — individual recovery summaries stay with each employee."
        action={
          <Badge variant="success">
            <ShieldCheck className="mr-1 h-3 w-3" aria-hidden />
            Aggregated only
          </Badge>
        }
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard label="Sessions" value="142" helper="Last 30 days" tone="primary" />
        <MetricCard label="Avg stress drop" value="34%" helper="Per session" tone="success" />
        <MetricCard label="Departments" value="9" helper="Active" tone="info" />
      </section>

      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle>Period highlights</CardTitle>
          <CardDescription>Patterns only — no personal or emotional content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {highlights.map((h) => (
            <div key={h} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-primary)]">
                <FileText className="h-3 w-3" aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">{h}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="soft" className="mt-6">
        <CardContent className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-success)]">
            <Lock className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
            The personal before/after recovery summary belongs to the employee and is never
            surfaced here.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
