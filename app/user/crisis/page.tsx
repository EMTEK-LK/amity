'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  LifeBuoy,
  Loader2,
  PhoneCall,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  SectionHeader,
} from '@/components/ui';

type Danger = 'unknown' | 'yes' | 'no';
type Handoff = 'idle' | 'connecting' | 'connected';

const escalationSteps = [
  { label: 'Pause normal coaching', detail: 'Amity stops the standard recovery flow immediately.' },
  { label: 'Check immediate danger', detail: 'Calmly confirm whether the person is safe right now.' },
  { label: 'Surface emergency options', detail: 'Show direct routes to real human help.' },
  { label: 'Bridge to a person', detail: 'Connect to a wellbeing officer or trusted contact.' },
];

export default function CrisisSupportPage() {
  const [danger, setDanger] = useState<Danger>('unknown');
  const [handoff, setHandoff] = useState<Handoff>('idle');

  useEffect(() => {
    if (handoff !== 'connecting') return;
    const t = setTimeout(() => setHandoff('connected'), 2600);
    return () => clearTimeout(t);
  }, [handoff]);

  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Safety layer"
        title="Crisis Safety Mode"
        description="If you signal immediate danger, Amity stops coaching and moves toward real human support. The AI is never presented as enough on its own."
        action={<Badge variant="danger">Crisis Mode</Badge>}
      />

      <Card variant="danger" className="mt-8">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
              <ShieldAlert className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex-1">
              <p className="text-lg font-semibold text-[var(--amity-text)]">
                Are you in immediate danger right now?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--amity-text-muted)]">
                You are not alone. Amity will stay with you and help bring in a real person.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="danger"
              size="lg"
              fullWidth
              onClick={() => setDanger('yes')}
              aria-pressed={danger === 'yes'}
            >
              Yes, I need help now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => setDanger('no')}
              aria-pressed={danger === 'no'}
            >
              No, but I&apos;m struggling
            </Button>
          </div>
          {danger === 'yes' && (
            <p className="rounded-xl border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] px-4 py-3 text-sm font-medium leading-relaxed text-[var(--amity-text)]">
              Please reach a real person now. Use an emergency option below — Amity is bridging
              you to support and will not leave this screen.
            </p>
          )}
          {danger === 'no' && (
            <p className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--amity-text-muted)]">
              Thank you for telling Amity. Staying with a person can still help — the options
              below connect you to real support.
            </p>
          )}
        </CardContent>
      </Card>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <Button variant="danger" size="lg" fullWidth>
          <PhoneCall className="h-4 w-4" aria-hidden />
          Emergency line
        </Button>
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setHandoff('connecting')}
          disabled={handoff !== 'idle'}
        >
          <UserCheck className="h-4 w-4" aria-hidden />
          Wellbeing officer
        </Button>
        <Button variant="secondary" size="lg" fullWidth>
          <LifeBuoy className="h-4 w-4" aria-hidden />
          Trusted contact
        </Button>
      </section>

      {handoff !== 'idle' && (
        <Card variant="elevated" className="mt-6">
          <CardContent className="flex items-center gap-4">
            {handoff === 'connecting' ? (
              <Loader2
                className="h-6 w-6 shrink-0 animate-spin text-[var(--amity-primary)]"
                aria-hidden
              />
            ) : (
              <CheckCircle2
                className="h-6 w-6 shrink-0 text-[var(--amity-success)]"
                aria-hidden
              />
            )}
            <div>
              <p className="font-semibold text-[var(--amity-text)]">
                {handoff === 'connecting'
                  ? 'Connecting you to a wellbeing officer…'
                  : 'A wellbeing officer is on the line'}
              </p>
              <p className="mt-0.5 text-sm text-[var(--amity-text-muted)]">
                {handoff === 'connecting'
                  ? 'Stay here — Amity is keeping the bridge open.'
                  : 'Simulated human handoff complete. You are no longer alone.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="default" className="mt-6">
        <CardHeader>
          <CardTitle>How the safety bridge works</CardTitle>
          <CardDescription>
            What Amity does the moment a crisis signal is detected.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ol className="space-y-4">
            {escalationSteps.map((step, i) => (
              <li key={step.label} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-xs font-semibold text-[var(--amity-primary)]">
                  {i + 1}
                </span>
                <div>
                  <p className="font-medium text-[var(--amity-text)]">{step.label}</p>
                  <p className="mt-0.5 text-sm text-[var(--amity-text-muted)]">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-4 py-3 text-sm leading-relaxed text-[var(--amity-text-muted)]">
            Amity never presents AI as a substitute for real help. In a real crisis, human
            support always comes first. Future in-call video/audio analysis can trigger this
            mode automatically.
          </p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
