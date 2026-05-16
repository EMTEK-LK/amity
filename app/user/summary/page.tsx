import {
  ArrowRight,
  Heart,
  Lock,
  Smile,
  Sparkles,
  TrendingDown,
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
} from '@/components/ui';

const insights = [
  'You moved from an overwhelmed state to a steadier baseline.',
  'Breathing pace settled noticeably in the second half of the session.',
  'A short reset was enough today — no escalation needed.',
];

export default function UserSummaryPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Private to you"
        title="Recovery Summary"
        description="A gentle before-and-after recap of your session. This is a snapshot of how you felt — not a diagnosis, and never shared with the company."
        action={
          <Badge variant="success">
            <Lock className="mr-1 h-3 w-3" aria-hidden />
            Private to you
          </Badge>
        }
      />

      <section className="mt-8">
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Card variant="soft">
            <CardContent className="space-y-1 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                Before
              </p>
              <p className="text-4xl font-semibold text-[var(--amity-danger)]">78</p>
              <p className="text-sm text-[var(--amity-text-muted)]">Stress score</p>
            </CardContent>
          </Card>
          <span className="mx-auto flex h-10 w-10 rotate-90 items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)] sm:rotate-0">
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
          <Card variant="elevated">
            <CardContent className="space-y-1 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                After
              </p>
              <p className="text-4xl font-semibold text-[var(--amity-success)]">41</p>
              <p className="text-sm text-[var(--amity-text-muted)]">Stress score</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Stress reduction"
          value="47%"
          helper="This session"
          icon={TrendingDown}
          tone="success"
        />
        <MetricCard
          label="Heart rate"
          value="72 bpm"
          helper="Back in range"
          icon={Heart}
          tone="primary"
        />
        <MetricCard
          label="Mood shift"
          value="Calmer"
          helper="Self-reported"
          icon={Smile}
          tone="success"
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-5">
        <Card variant="default" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recovery readiness</CardTitle>
            <CardDescription>Where you ended the session.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ProgressBar
              label="Readiness to continue your day"
              value={76}
              tone="success"
            />
          </CardContent>
        </Card>

        <Card variant="soft" className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Session insights</CardTitle>
            <CardDescription>
              Visible only to you — never shared with the company.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {insights.map((line) => (
              <div key={line} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
                  <Sparkles className="h-3 w-3" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
                  {line}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <ButtonLink
          href="/user/dashboard"
          variant="primary"
          size="lg"
          fullWidth
          className="sm:w-auto"
        >
          Back to my dashboard
        </ButtonLink>
        <ButtonLink
          href="/user/trigger-demo"
          variant="secondary"
          size="lg"
          fullWidth
          className="sm:w-auto"
        >
          Run another demo
        </ButtonLink>
      </section>
    </PageContainer>
  );
}
