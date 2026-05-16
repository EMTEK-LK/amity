import { cn, getToneClasses, type Tone } from '@/lib/utils';

export type StatusType =
  | 'stable'
  | 'watch'
  | 'support_recommended'
  | 'recovery_needed'
  | 'in_recovery'
  | 'crisis';

const statusConfig: Record<
  StatusType,
  { label: string; tone: Tone; dot: string }
> = {
  stable: { label: 'Stable', tone: 'success', dot: 'bg-[var(--amity-success)]' },
  watch: { label: 'Watch', tone: 'warning', dot: 'bg-[var(--amity-warning)]' },
  support_recommended: {
    label: 'Support Recommended',
    tone: 'info',
    dot: 'bg-[var(--amity-info)]',
  },
  recovery_needed: {
    label: 'Recovery Needed',
    tone: 'primary',
    dot: 'bg-[var(--amity-primary)]',
  },
  in_recovery: {
    label: 'In Recovery',
    tone: 'primary',
    dot: 'bg-[var(--amity-primary)]',
  },
  crisis: { label: 'Crisis Mode', tone: 'danger', dot: 'bg-[var(--amity-danger)]' },
};

export interface StatusChipProps {
  status: StatusType;
  className?: string;
  showDot?: boolean;
}

export function StatusChip({ status, className, showDot = true }: StatusChipProps) {
  const config = statusConfig[status];
  const tone = getToneClasses(config.tone);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium',
        tone.bg,
        tone.text,
        tone.border,
        className
      )}
      role="status"
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', config.dot)}
          aria-hidden
        />
      )}
      {config.label}
    </span>
  );
}
