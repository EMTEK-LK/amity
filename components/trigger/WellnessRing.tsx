'use client';

import { cn } from '@/lib/utils';

interface WellnessRingProps {
  value: number;
  max?: number;
  label: string;
  sublabel?: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'md' | 'lg';
}

const toneStroke = {
  primary: 'stroke-[var(--amity-primary)]',
  success: 'stroke-[var(--amity-success)]',
  warning: 'stroke-[var(--amity-warning)]',
  danger: 'stroke-[var(--amity-danger)]',
} as const;

export function WellnessRing({
  value,
  max = 100,
  label,
  sublabel,
  tone = 'primary',
  size = 'lg',
}: WellnessRingProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = size === 'lg' ? 54 : 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const dim = size === 'lg' ? 128 : 96;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg
          className="-rotate-90"
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          aria-hidden
        >
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth="8"
            className="stroke-[var(--amity-border)]"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className={cn('transition-all duration-700 ease-out', toneStroke[tone])}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-[var(--amity-text)] sm:text-3xl">
            {value}
          </span>
          {sublabel && (
            <span className="text-[10px] uppercase tracking-wide text-[var(--amity-text-muted)]">
              {sublabel}
            </span>
          )}
        </div>
      </div>
      <p className="text-xs font-medium text-[var(--amity-text-muted)]">{label}</p>
    </div>
  );
}
