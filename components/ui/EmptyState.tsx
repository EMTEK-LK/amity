import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './Card';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card variant="soft" className={cn('text-center', className)}>
      <CardContent className="flex flex-col items-center gap-4 py-10 sm:py-12">
        {Icon && (
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--amity-text)]">{title}</h3>
          {description && (
            <p className="mx-auto max-w-sm text-sm text-[var(--amity-text-muted)]">
              {description}
            </p>
          )}
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
