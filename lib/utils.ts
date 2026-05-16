import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatIso(date: Date = new Date()): string {
  return date.toISOString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function percentage(value: number, max = 100): number {
  if (max <= 0) return 0;
  return clamp(Math.round((value / max) * 100), 0, 100);
}

export type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

const toneClasses: Record<Tone, { bg: string; text: string; border: string }> = {
  neutral: {
    bg: 'bg-[var(--amity-bg-subtle)]',
    text: 'text-[var(--amity-text-muted)]',
    border: 'border-[var(--amity-border)]',
  },
  success: {
    bg: 'bg-[var(--amity-success-muted)]',
    text: 'text-[var(--amity-success)]',
    border: 'border-[var(--amity-success)]/30',
  },
  warning: {
    bg: 'bg-[var(--amity-warning-muted)]',
    text: 'text-[var(--amity-warning)]',
    border: 'border-[var(--amity-warning)]/30',
  },
  danger: {
    bg: 'bg-[var(--amity-danger-muted)]',
    text: 'text-[var(--amity-danger)]',
    border: 'border-[var(--amity-danger)]/30',
  },
  info: {
    bg: 'bg-[var(--amity-info-muted)]',
    text: 'text-[var(--amity-info)]',
    border: 'border-[var(--amity-info)]/30',
  },
  primary: {
    bg: 'bg-[var(--amity-primary-muted)]',
    text: 'text-[var(--amity-primary)]',
    border: 'border-[var(--amity-primary)]/30',
  },
};

export function getToneClasses(tone: Tone) {
  return toneClasses[tone];
}
