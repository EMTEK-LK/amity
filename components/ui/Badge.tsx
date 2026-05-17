import { cn, getToneClasses, type Tone } from '@/lib/utils';

const badgeVariants = {
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  primary: 'primary',
} as const satisfies Record<string, Tone>;

export type BadgeVariant = keyof typeof badgeVariants;

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  const tone = getToneClasses(badgeVariants[variant]);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        tone.bg,
        tone.text,
        tone.border,
        className
      )}
    >
      {children}
    </span>
  );
}
