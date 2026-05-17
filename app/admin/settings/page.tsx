import {
  Building2,
  LifeBuoy,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
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
import { DEMO_ADMIN } from '@/lib/demo-identities';

const sections = [
  {
    icon: Building2,
    title: 'Company profile',
    items: ['Company name', 'Departments', 'Branding', 'Time zone'],
  },
  {
    icon: Users,
    title: 'People & roles',
    items: ['Employee list', 'Wellbeing officer setup', 'Admin access'],
  },
  {
    icon: ShieldCheck,
    title: 'Privacy policy',
    items: [
      'Aggregation rules',
      'Data retention',
      'Analytics preferences',
      'Audit log',
    ],
  },
  {
    icon: LifeBuoy,
    title: 'Crisis escalation',
    items: ['Escalation contacts', 'Wellbeing officer routing', 'Emergency lines'],
  },
  {
    icon: Plug,
    title: 'Integrations',
    items: [
      'Apple Watch / WHOOP',
      'Microsoft Teams · Slack',
      'HR & call center systems',
      'Calendar tools',
    ],
  },
  {
    icon: SlidersHorizontal,
    title: 'Demo configuration',
    items: ['Demo identities', 'Trigger scenarios', 'Reset demo state'],
  },
];

export default function AdminSettingsPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Company admin"
        title="Settings"
        description={`Configuration for ${DEMO_ADMIN.company}. These are planned controls — wiring arrives with the service layer.`}
        action={<Badge variant="info">Planned</Badge>}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title} variant="default" className="h-full">
            <CardHeader>
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <CardTitle>{s.title}</CardTitle>
              <CardDescription>Configuration group</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <ul className="space-y-2">
                {s.items.map((it) => (
                  <li
                    key={it}
                    className="flex items-center justify-between rounded-lg border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-3 py-2 text-sm text-[var(--amity-text-muted)]"
                  >
                    {it}
                    <span className="text-xs text-[var(--amity-text-muted)]">Planned</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
