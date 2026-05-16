import { Bell, LifeBuoy, Lock, ShieldCheck, Sliders } from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  SectionHeader,
} from '@/components/ui';

const groups = [
  {
    icon: Lock,
    title: 'Privacy',
    items: ['Session privacy (always on)', 'Data retention', 'Download my data'],
  },
  {
    icon: Bell,
    title: 'Notifications',
    items: ['In-app reminders', 'Email (planned)', 'Quiet hours'],
  },
  {
    icon: LifeBuoy,
    title: 'Crisis safety',
    items: ['Emergency contact', 'Trusted contact', 'Escalation preference'],
  },
  {
    icon: Sliders,
    title: 'Recovery',
    items: ['Preferred recovery mode', 'Voice preference', 'Session length'],
  },
];

export default function UserSettingsPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Private to you"
        title="Settings"
        description="Your personal preferences. These are planned controls — wiring arrives with the service layer."
        action={<Badge variant="info">Planned</Badge>}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.title} variant="default" className="h-full">
            <CardHeader>
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
                <g.icon className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle>{g.title}</CardTitle>
              <CardDescription>Preference group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              {g.items.map((it) => (
                <div
                  key={it}
                  className="flex items-center justify-between rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-3 py-2 text-sm text-[var(--amity-text-muted)]"
                >
                  {it}
                  <span className="text-xs">Planned</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="soft" className="mt-6">
        <CardContent className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-success)]">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
            Privacy is the default. Recovery sessions are never shared with your employer.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
