import { cn, clamp, percentage } from '@/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const toneFill = {
  primary: 'bg-[var(--amity-primary)]',
  success: 'bg-[var(--amity-success)]',
  warning: 'bg-[var(--amity-warning)]',
  danger: 'bg-[var(--amity-danger)]',
} as const;

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  tone = 'primary',
  className,
}: ProgressBarProps) {
  const pct = percentage(clamp(value, 0, max), max);

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-sm">
          {label && (
            <span className="font-medium text-[var(--amity-text)]">{label}</span>
          )}
          {showValue && (
            <span className="tabular-nums text-[var(--amity-text-muted)]">{pct}%</span>
          )}
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--amity-bg-subtle)]"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', toneFill[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
