import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const cardVariants = {
  default: 'amity-card-surface',
  elevated: 'amity-card-surface shadow-[var(--amity-shadow-elevated)]',
  soft: 'bg-[var(--amity-bg-subtle)] border border-[var(--amity-border)]',
  glass:
    'bg-[var(--amity-surface)]/80 border border-[var(--amity-border)] backdrop-blur-md',
  danger:
    'bg-[var(--amity-danger-muted)] border border-[var(--amity-danger)]/25',
} as const;

export type CardVariant = keyof typeof cardVariants;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-2xl', cardVariants[variant], className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5 pb-0 sm:p-6 sm:pb-0', className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold leading-tight text-[var(--amity-text)] sm:text-lg', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm leading-relaxed text-[var(--amity-text-muted)]', className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 sm:p-6', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-[var(--amity-border)] p-5 pt-4 sm:p-6 sm:pt-4',
        className
      )}
      {...props}
    />
  );
}
