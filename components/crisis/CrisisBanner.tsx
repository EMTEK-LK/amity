'use client';

import { ShieldAlert } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';

interface CrisisBannerProps {
  onShowSupport: () => void;
  crisisHref?: string;
}

/** Persistent banner shown while Crisis Safety Mode is active. */
export function CrisisBanner({ onShowSupport, crisisHref = '/user/crisis' }: CrisisBannerProps) {
  return (
    <div
      role="status"
      className="flex flex-col gap-3 rounded-2xl border border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]">
          <ShieldAlert className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed text-[var(--amity-text)]">
          <span className="font-semibold">Crisis Safety Mode is active.</span>{' '}
          Normal coaching is paused while support options are available.
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        <Button variant="secondary" size="sm" onClick={onShowSupport}>
          Show support options
        </Button>
        <ButtonLink href={crisisHref} variant="danger" size="sm">
          Open Crisis Safety Flow
        </ButtonLink>
      </div>
    </div>
  );
}
