import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const buttonVariantStyles = {
  primary:
    'bg-[var(--amity-primary)] text-[var(--amity-primary-foreground)] hover:opacity-90 shadow-sm',
  secondary:
    'border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text)] hover:bg-[var(--amity-bg-subtle)]',
  ghost:
    'bg-transparent text-[var(--amity-text-muted)] hover:bg-[var(--amity-primary-muted)] hover:text-[var(--amity-primary)]',
  danger: 'bg-[var(--amity-danger)] text-white hover:opacity-90',
  soft: 'bg-[var(--amity-primary-muted)] text-[var(--amity-primary)] hover:opacity-90',
} as const;

export const buttonSizeStyles = {
  sm: 'min-h-9 px-3 text-xs gap-1.5 rounded-lg',
  md: 'min-h-11 px-4 text-sm gap-2 rounded-xl',
  lg: 'min-h-12 px-6 text-base gap-2.5 rounded-xl',
} as const;

export type ButtonVariant = keyof typeof buttonVariantStyles;
export type ButtonSize = keyof typeof buttonSizeStyles;

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

export type ButtonLinkProps = BaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    href: string;
  };

function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth,
  className,
}: BaseProps) {
  return cn(
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
    'disabled:pointer-events-none disabled:opacity-50',
    buttonVariantStyles[variant],
    buttonSizeStyles[size],
    fullWidth && 'w-full',
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      type = 'button',
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={buttonClasses({ variant, size, fullWidth, className })}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export function ButtonLink({
  href,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </Link>
  );
}
