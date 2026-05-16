import {
  Activity,
  ArrowRight,
  HeartPulse,
  ShieldAlert,
  User,
  Video,
} from 'lucide-react';
import {
  Badge,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  MetricCard,
  PageContainer,
  ProgressBar,
  SectionHeader,
  StatusChip,
} from '@/components/ui';
import { DEMO_EMPLOYEE } from '@/lib/demo-identities';

export default function UserDashboardPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow={`Welcome back, ${DEMO_EMPLOYEE.name.split(' ')[0]}`}
        title="My Wellbeing"
        description="Your personal space. Everything here is private to you — the company only sees anonymized aggregates."
        action={<StatusChip status="stable" />}
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Current stress"
          value="22"
          helper="Stable range"
          icon={Activity}
          tone="success"
        />
        <MetricCard
          label="Heart rate"
          value="68 bpm"
          helper="Resting"
          icon={HeartPulse}
          tone="primary"
        />
        <MetricCard
          label="Recovery streak"
          value="3"
          helper="Sessions completed"
          icon={Video}
          tone="info"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Need a reset?</CardTitle>
            <CardDescription>
              Start a private recovery session, or simulate a workplace trigger to see the
              full flow.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 pt-2 sm:flex-row">
            <ButtonLink href="/user/recovery" variant="primary" size="lg" fullWidth>
              <Video className="h-4 w-4" aria-hidden />
              Start recovery
            </ButtonLink>
            <ButtonLink href="/user/trigger-demo" variant="secondary" size="lg" fullWidth>
              <HeartPulse className="h-4 w-4" aria-hidden />
              Trigger demo
            </ButtonLink>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-primary)]">
                <User className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardTitle>{DEMO_EMPLOYEE.name}</CardTitle>
                <CardDescription>
                  {DEMO_EMPLOYEE.role} · {DEMO_EMPLOYEE.department}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/user/profile" variant="ghost" size="md" fullWidth>
              View profile
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </CardContent>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card variant="soft" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>This week</CardTitle>
            <CardDescription>How your recovery readiness is trending.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <ProgressBar label="Recovery readiness" value={78} tone="success" />
            <ProgressBar label="Calm baseline" value={64} tone="primary" />
          </CardContent>
        </Card>

        <Card variant="danger">
          <CardContent className="flex h-full flex-col gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
              <ShieldAlert className="h-5 w-5" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-[var(--amity-text)]">Need urgent support?</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--amity-text-muted)]">
                Crisis support is always one tap away.
              </p>
            </div>
            <ButtonLink href="/user/crisis" variant="danger" size="md" fullWidth>
              Crisis support
            </ButtonLink>
          </CardContent>
        </Card>
      </section>

      <p className="mt-6 text-center text-xs text-[var(--amity-text-muted)]">
        <Badge variant="success" className="mr-1.5 align-middle">
          Private
        </Badge>
        This dashboard is visible only to you.
      </p>
    </PageContainer>
  );
}
