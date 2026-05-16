import { cn } from '@/lib/utils';

export interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-[var(--amity-border)]/60',
        className
      )}
      aria-hidden
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn('amity-card-surface rounded-2xl p-5 sm:p-6', className)}>
      <Skeleton className="mb-3 h-4 w-1/3" />
      <Skeleton className="mb-2 h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
