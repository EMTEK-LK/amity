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
  ButtonLink,
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
  const [safeNow, setSafeNow] = useState(false);

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

      <section className="mt-6 space-y-3">
        <h2 className="text-base font-semibold text-[var(--amity-text)]">
          Immediate support options
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="tel:119"
            className="flex items-center gap-3 rounded-2xl border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] p-4 transition-colors hover:border-[var(--amity-danger)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
              <PhoneCall className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-[var(--amity-text)]">
                Police emergency
              </span>
              <span className="block text-sm text-[var(--amity-text-muted)]">Call 119</span>
            </span>
          </a>
          <a
            href="tel:1990"
            className="flex items-center gap-3 rounded-2xl border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] p-4 transition-colors hover:border-[var(--amity-danger)]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
              <PhoneCall className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-[var(--amity-text)]">
                Emergency medical support
              </span>
              <span className="block text-sm text-[var(--amity-text-muted)]">Call 1990</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setHandoff('connecting')}
            disabled={handoff !== 'idle'}
            className="flex items-center gap-3 rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-surface)] p-4 text-left transition-colors hover:bg-[var(--amity-bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)] disabled:opacity-60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
              <UserCheck className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-[var(--amity-text)]">
                Company wellbeing officer
              </span>
              <span className="block text-sm text-[var(--amity-text-muted)]">
                Connect now (demo contact)
              </span>
            </span>
          </button>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-surface)] p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amity-bg-subtle)] text-[var(--amity-text-muted)]">
              <LifeBuoy className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-semibold text-[var(--amity-text)]">
                Trusted contact
              </span>
              <span className="block text-sm text-[var(--amity-text-muted)]">Not configured</span>
            </span>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-[var(--amity-text-muted)]">
          Emergency numbers are configurable by company and country. Amity does not call
          emergency services for you and is not a replacement for emergency support — please
          reach a real person now if you are in danger.
        </p>
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
            support always comes first.
          </p>
        </CardContent>
      </Card>

      <section className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/user/recovery" variant="secondary" size="lg" fullWidth>
          Return to recovery session
        </ButtonLink>
        <Button
          variant="ghost"
          size="lg"
          fullWidth
          onClick={() => setSafeNow(true)}
          aria-pressed={safeNow}
        >
          I am safe now
        </Button>
      </section>
      {safeNow && (
        <p className="mt-3 rounded-xl border border-[var(--amity-success)]/30 bg-[var(--amity-success-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--amity-text)]">
          Glad you are safe. Stay with someone you trust if you can. You can return to a
          private recovery session whenever you are ready.
        </p>
      )}
    </PageContainer>
  );
}
