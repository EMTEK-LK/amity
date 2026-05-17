'use client';

import { useEffect } from 'react';
import { PhoneOff, ShieldAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';
import { cn } from '@/lib/utils';
import { IncomingCallPulse } from './IncomingCallPulse';
import type { TriggerScenario } from '@/types/trigger';

interface IncomingRecoveryCallProps {
  open: boolean;
  scenario: TriggerScenario | null;
  employeeName?: string;
  onAnswer: () => void;
  onDecline: () => void;
  onOpenCrisis: () => void;
}

export function IncomingRecoveryCall({
  open,
  scenario,
  employeeName = 'there',
  onAnswer,
  onDecline,
  onOpenCrisis,
}: IncomingRecoveryCallProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDecline();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onDecline]);

  if (!open || !scenario) return null;

  const crisis = scenario.isCrisis;
  const riskLabel = crisis
    ? 'Crisis support signal'
    : scenario.riskLevel === 'high'
      ? 'High support signal'
      : 'Support signal';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="incoming-call-title"
    >
      <div className="absolute inset-0 bg-[var(--amity-overlay)]" aria-hidden />

      <div
        className={cn(
          'relative flex max-h-[94vh] w-full flex-col overflow-y-auto rounded-t-3xl border bg-[var(--amity-surface)] p-6 text-center shadow-[var(--amity-shadow-elevated)] sm:m-4 sm:max-w-[520px] sm:rounded-3xl',
          crisis ? 'border-[var(--amity-danger)]/30' : 'border-[var(--amity-border)]'
        )}
      >
        <div className="flex justify-center">
          <Logo showTagline={false} />
        </div>

        <div className="mt-6 flex justify-center">
          <IncomingCallPulse crisis={crisis}>
            <span className="text-xl font-semibold tracking-tight">AR</span>
          </IncomingCallPulse>
        </div>

        <h2
          id="incoming-call-title"
          className="mt-6 text-xl font-semibold tracking-tight text-[var(--amity-text)]"
        >
          Amity Recovery Guide
        </h2>
        <p className="mt-1 text-sm text-[var(--amity-text-muted)]">
          {crisis ? 'Incoming crisis support call' : 'Incoming recovery call'}
        </p>

        <div className="mt-5 rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-4 py-3 text-sm leading-relaxed text-[var(--amity-text)]">
          {employeeName}, Amity noticed a high-pressure signal after:{' '}
          <span className="font-medium">{scenario.label || scenario.name}</span>
        </div>

        <div className="mt-3">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
              crisis
                ? 'border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] text-[var(--amity-danger)]'
                : 'border-[var(--amity-primary)]/30 bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
            )}
          >
            {riskLabel}
          </span>
        </div>

        <div className="mt-7 flex flex-col gap-3">
          {crisis ? (
            <ButtonLink
              href="/user/crisis"
              variant="danger"
              size="lg"
              fullWidth
              onClick={onOpenCrisis}
            >
              <ShieldAlert className="h-4 w-4" aria-hidden />
              Open Crisis Safety Flow
            </ButtonLink>
          ) : (
            <Button variant="primary" size="lg" fullWidth onClick={onAnswer}>
              Answer
            </Button>
          )}

          <Button variant="secondary" size="lg" fullWidth onClick={onDecline}>
            <PhoneOff className="h-4 w-4" aria-hidden />
            Not now
          </Button>

          {crisis ? (
            <Button variant="ghost" size="md" fullWidth onClick={onAnswer}>
              Start supported recovery session
            </Button>
          ) : null}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-[var(--amity-text-muted)]">
          This is a private in-app recovery call — not a phone call. Amity is not an emergency
          service.
        </p>
      </div>
    </div>
  );
}
