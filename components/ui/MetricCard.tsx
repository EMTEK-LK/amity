import { type LucideIcon } from 'lucide-react';
import { cn, getToneClasses, type Tone } from '@/lib/utils';
import { Card, CardContent } from './Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive?: boolean };
  tone?: Tone;
  className?: string;
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  trend,
  tone = 'neutral',
  className,
}: MetricCardProps) {
  const toneStyle = getToneClasses(tone);

  return (
    <Card variant="default" className={cn('overflow-hidden', className)}>
      <CardContent className="flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--amity-text-muted)]">
            {label}
          </p>
          {Icon && (
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                toneStyle.bg,
                toneStyle.border,
                toneStyle.text
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
          )}
        </div>
        <p className="text-2xl font-semibold tracking-tight text-[var(--amity-text)] sm:text-3xl">
          {value}
        </p>
        {(helper || trend) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {trend && (
              <span
                className={cn(
                  'font-medium',
                  trend.positive ? 'text-[var(--amity-success)]' : 'text-[var(--amity-danger)]'
                )}
              >
                {trend.value}
              </span>
            )}
            {helper && (
              <span className="text-[var(--amity-text-muted)]">{helper}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
