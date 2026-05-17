import { cn } from '@/lib/utils';

export interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
} as const;

export function Surface({
  children,
  className,
  elevated = false,
  padding = 'md',
}: SurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--amity-border)]',
        elevated
          ? 'bg-[var(--amity-surface-elevated)] shadow-[var(--amity-shadow-elevated)]'
          : 'bg-[var(--amity-surface)] shadow-[var(--amity-shadow)]',
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
