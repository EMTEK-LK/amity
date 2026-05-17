import { Briefcase, HeartPulse, Plug, ShieldCheck, User } from 'lucide-react';
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
import { DEMO_EMPLOYEE } from '@/lib/demo-identities';

const details = [
  { label: 'Name', value: DEMO_EMPLOYEE.name },
  { label: 'Role', value: DEMO_EMPLOYEE.role },
  { label: 'Department', value: DEMO_EMPLOYEE.department },
  { label: 'Company', value: DEMO_EMPLOYEE.company },
  { label: 'Work mode', value: 'Hybrid' },
  { label: 'Email', value: DEMO_EMPLOYEE.email },
];

const preferences = [
  'Preferred recovery mode: short guided reset',
  'Notification channels: in-app (email planned)',
  'Privacy: sessions private by default',
  'Emergency contact: not set',
];

const futureTools = [
  'Connected wearables (Apple Watch, WHOOP)',
  'Connected work tools (Teams, Slack)',
  'Preferred recovery avatar',
  'Preferred voice mode',
  'Escalation contact & crisis preferences',
  'Personal recovery history',
];

export default function UserProfilePage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Private to you"
        title="My Profile"
        description="Your personal details and recovery preferences. Only you can see this."
        action={<StatusChip status="stable" />}
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-primary)]">
                <User className="h-6 w-6" aria-hidden />
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
            <dl className="grid gap-3 sm:grid-cols-2">
              {details.map((d) => (
                <div
                  key={d.label}
                  className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-3 py-2.5"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
                    {d.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[var(--amity-text)]">
                    {d.value}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
              <HeartPulse className="h-5 w-5" aria-hidden />
            </span>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Recovery and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-2">
            {preferences.map((p) => (
              <p
                key={p}
                className="rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-3 py-2 text-sm text-[var(--amity-text-muted)]"
              >
                {p}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card variant="soft" className="mt-6">
        <CardHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
            <Plug className="h-5 w-5" aria-hidden />
          </span>
          <CardTitle>Planned for later</CardTitle>
          <CardDescription>Connected tools and personalization arrive in future steps.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            {futureTools.map((t) => (
              <Badge key={t} variant="neutral">
                {t}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="default" className="mt-6">
        <CardContent className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-success)]">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
            <Briefcase className="mr-1 inline h-3.5 w-3.5 align-text-bottom" aria-hidden />
            Your employer never sees this profile or your recovery content — only anonymized,
            aggregated wellbeing signals.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
