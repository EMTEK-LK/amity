import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1 space-y-2">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--amity-primary)]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-tight text-[var(--amity-text)] sm:text-2xl">
          {title}
        </h2>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--amity-text-muted)] sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
