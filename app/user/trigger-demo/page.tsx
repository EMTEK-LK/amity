'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Briefcase,
  Heart,
  MessageSquareWarning,
  RotateCcw,
  Users,
  Zap,
} from 'lucide-react';
import {
  Badge,
  Button,
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
import type { StatusType } from '@/components/ui';

interface Scenario {
  id: string;
  label: string;
  detail: string;
  icon: typeof Users;
  stress: number;
  heartRate: number;
  risk: number;
}

const BASELINE = { stress: 22, heartRate: 68, risk: 12 };

const scenarios: Scenario[] = [
  {
    id: 'manager',
    label: 'Manager conflict',
    detail: 'Blamed during a team review',
    icon: Users,
    stress: 78,
    heartRate: 104,
    risk: 82,
  },
  {
    id: 'customer',
    label: 'Customer escalation',
    detail: 'Aggressive support call',
    icon: MessageSquareWarning,
    stress: 71,
    heartRate: 98,
    risk: 74,
  },
  {
    id: 'workload',
    label: 'Workload spike',
    detail: 'Three overlapping deadlines',
    icon: Briefcase,
    stress: 63,
    heartRate: 91,
    risk: 58,
  },
];

function riskBand(risk: number): { status: StatusType; label: string } {
  if (risk >= 75) return { status: 'recovery_needed', label: 'Recovery recommended' };
  if (risk >= 45) return { status: 'support_recommended', label: 'Support recommended' };
  if (risk >= 25) return { status: 'watch', label: 'Watch' };
  return { status: 'stable', label: 'Stable' };
}

export default function TriggerDemoPage() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const active = scenarios.find((s) => s.id === activeId) ?? null;
  const vitals = active
    ? { stress: active.stress, heartRate: active.heartRate, risk: active.risk }
    : BASELINE;

  const band = useMemo(() => riskBand(vitals.risk), [vitals.risk]);
  const triggered = active !== null;

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Your demo"
        title="Trigger Simulation Portal"
        description="Select a workplace scenario. Amity recalculates your vitals, scores emotional risk, and opens a private recovery session."
        action={
          <Button
            variant="ghost"
            size="md"
            onClick={() => setActiveId(null)}
            disabled={!triggered}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Reset
          </Button>
        }
      />

      <Card variant="soft" className="mt-6">
        <CardContent className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
          <span className="font-medium text-[var(--amity-text)]">What this simulates:</span>{' '}
          in production these triggers would come from wearables (Apple Watch, WHOOP),
          workplace tools (Microsoft Teams, Slack, WhatsApp), call-center systems, and future
          in-call video/audio signal analysis. For the demo, you trigger them manually here.
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="space-y-4 lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--amity-text)] sm:text-lg">
              Choose a scenario
            </h3>
            <Badge variant="neutral">Simulated integrations</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {scenarios.map((s) => {
              const selected = s.id === activeId;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  aria-pressed={selected}
                  className={`rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)] ${
                    selected
                      ? 'border-[var(--amity-primary)] bg-[var(--amity-primary-muted)] shadow-[var(--amity-shadow)]'
                      : 'border-[var(--amity-border)] bg-[var(--amity-surface)] hover:border-[var(--amity-primary)]/40 hover:bg-[var(--amity-bg-subtle)]'
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 font-semibold text-[var(--amity-text)]">{s.label}</p>
                  <p className="mt-0.5 text-sm text-[var(--amity-text-muted)]">{s.detail}</p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Stress score"
              value={vitals.stress}
              helper={triggered ? 'After trigger' : 'Stable baseline'}
              icon={Activity}
              tone={triggered ? 'danger' : 'success'}
              trend={
                triggered
                  ? { value: `+${vitals.stress - BASELINE.stress}`, positive: false }
                  : undefined
              }
            />
            <MetricCard
              label="Heart rate"
              value={`${vitals.heartRate} bpm`}
              helper={triggered ? 'Elevated' : 'Resting range'}
              icon={Heart}
              tone={triggered ? 'warning' : 'success'}
              trend={
                triggered
                  ? { value: `+${vitals.heartRate - BASELINE.heartRate}`, positive: false }
                  : undefined
              }
            />
          </div>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Risk engine</CardTitle>
                <StatusChip status={band.status} />
              </div>
              <CardDescription>{band.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <ProgressBar
                label="Emotional risk"
                value={vitals.risk}
                tone={
                  vitals.risk >= 75 ? 'danger' : vitals.risk >= 45 ? 'warning' : 'success'
                }
              />
              <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
                {triggered
                  ? 'Risk has crossed the recovery threshold. A private session is recommended.'
                  : 'You are within a healthy range. Select a scenario to simulate a high-pressure moment.'}
              </p>
            </CardContent>
          </Card>

          <Card variant={triggered ? 'default' : 'soft'}>
            <CardContent className="space-y-3">
              <ButtonLink
                href="/user/recovery"
                variant="primary"
                size="lg"
                fullWidth
                aria-disabled={!triggered}
                className={!triggered ? 'pointer-events-none opacity-50' : undefined}
                tabIndex={triggered ? undefined : -1}
              >
                <Zap className="h-4 w-4" aria-hidden />
                Open Recovery Room
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
              <p className="text-center text-xs text-[var(--amity-text-muted)]">
                {triggered
                  ? 'Launches a private AI video recovery session.'
                  : 'Trigger a scenario to enable recovery.'}
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
