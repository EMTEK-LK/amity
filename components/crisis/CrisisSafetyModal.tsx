'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  LifeBuoy,
  PhoneCall,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { CrisisActionCard } from './CrisisActionCard';

interface CrisisSafetyModalProps {
  open: boolean;
  onClose: () => void;
  onOpenCrisisPage: () => void;
  onNotifyWellbeingOfficer?: () => void;
  detectedPhrase?: string;
  employeeName?: string;
}

export function CrisisSafetyModal({
  open,
  onClose,
  onOpenCrisisPage,
  onNotifyWellbeingOfficer,
  detectedPhrase,
  employeeName,
}: CrisisSafetyModalProps) {
  const [officerNotified, setOfficerNotified] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setOfficerNotified(false);
  }, [open]);

  if (!open) return null;

  const greeting = employeeName ? `${employeeName}, you` : 'You';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-modal-title"
    >
      <div
        className="absolute inset-0 bg-[var(--amity-overlay)]"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl border border-[var(--amity-border)] bg-[var(--amity-surface)] shadow-[var(--amity-shadow-elevated)] sm:m-4 sm:max-w-[640px] sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[var(--amity-border)] p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="crisis-modal-title"
              className="text-lg font-semibold text-[var(--amity-text)]"
            >
              Crisis Safety Mode
            </h2>
            <p className="mt-0.5 text-sm text-[var(--amity-text-muted)]">
              {greeting} do not have to handle this alone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close and stay in session"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] text-[var(--amity-text-muted)] hover:bg-[var(--amity-bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-5 sm:p-6">
          <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
            Amity has paused normal recovery coaching and is showing immediate support
            options. If you are in immediate danger, contact local emergency support now or
            reach out to a trusted person near you.
          </p>

          {detectedPhrase ? (
            <p className="rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] px-3 py-2 text-xs text-[var(--amity-text-muted)]">
              Detected: “{detectedPhrase}”
            </p>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <CrisisActionCard
              icon={PhoneCall}
              title="Police emergency"
              subtitle="Call 119"
              tel="119"
              tone="danger"
            />
            <CrisisActionCard
              icon={PhoneCall}
              title="Emergency medical support"
              subtitle="Call 1990"
              tel="1990"
              tone="danger"
            />
            <CrisisActionCard
              icon={officerNotified ? CheckCircle2 : UserCheck}
              title="Company wellbeing officer"
              subtitle={
                officerNotified
                  ? 'Wellbeing officer handoff prepared'
                  : 'Notify wellbeing officer (demo contact)'
              }
              tone="primary"
              onClick={() => {
                setOfficerNotified(true);
                onNotifyWellbeingOfficer?.();
              }}
            />
            <CrisisActionCard
              icon={LifeBuoy}
              title="Trusted contact"
              subtitle="Not configured — add later"
              tone="neutral"
              disabled
            />
          </div>

          <p className="text-xs leading-relaxed text-[var(--amity-text-muted)]">
            Emergency contacts can be configured by company and country. Amity is not an
            emergency service and does not call anyone for you. If there is immediate danger,
            contact local emergency support or someone nearby now.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-[var(--amity-border)] p-5 sm:flex-row sm:p-6">
          <ButtonLink
            href="/user/crisis"
            variant="danger"
            size="lg"
            fullWidth
            onClick={onOpenCrisisPage}
          >
            Open Crisis Safety Flow
          </ButtonLink>
          <Button variant="secondary" size="lg" fullWidth onClick={onClose}>
            Stay with Amity
          </Button>
        </div>
      </div>
    </div>
  );
}
