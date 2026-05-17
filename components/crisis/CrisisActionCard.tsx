'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'danger' | 'primary' | 'neutral';

interface CrisisActionCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Phone number → renders a tel: link */
  tel?: string;
  /** Click handler → renders a button */
  onClick?: () => void;
  tone?: Tone;
  disabled?: boolean;
}

const toneStyles: Record<Tone, string> = {
  danger:
    'border-[var(--amity-danger)]/30 bg-[var(--amity-danger-muted)] hover:border-[var(--amity-danger)]/50',
  primary:
    'border-[var(--amity-border)] bg-[var(--amity-surface)] hover:bg-[var(--amity-bg-subtle)]',
  neutral: 'border-[var(--amity-border)] bg-[var(--amity-surface)]',
};

const iconTone: Record<Tone, string> = {
  danger: 'bg-[var(--amity-danger)]/15 text-[var(--amity-danger)]',
  primary: 'bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]',
  neutral: 'bg-[var(--amity-bg-subtle)] text-[var(--amity-text-muted)]',
};

export function CrisisActionCard({
  icon: Icon,
  title,
  subtitle,
  tel,
  onClick,
  tone = 'neutral',
  disabled = false,
}: CrisisActionCardProps) {
  const base = cn(
    'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
    toneStyles[tone],
    disabled && 'opacity-60'
  );

  const inner = (
    <>
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          iconTone[tone]
        )}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-[var(--amity-text)]">{title}</span>
        <span className="block text-sm text-[var(--amity-text-muted)]">{subtitle}</span>
      </span>
    </>
  );

  if (tel && !disabled) {
    return (
      <a href={`tel:${tel}`} className={base}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={base}>
      {inner}
    </button>
  );
}
