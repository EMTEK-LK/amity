import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  onClick?: () => void;
}

export function Logo({ className, showTagline = true, onClick }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className={cn(
        'group flex min-w-0 items-center gap-2.5 text-[var(--amity-text)]',
        className
      )}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-sm font-bold text-[var(--amity-primary)] shadow-sm transition-colors group-hover:border-[var(--amity-primary)]/40">
        A
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold tracking-tight sm:text-lg">
          Amity
        </span>
        {showTagline && (
          <span className="hidden text-[10px] font-medium uppercase tracking-wider text-[var(--amity-text-muted)] sm:block">
            AI Recovery
          </span>
        )}
      </span>
    </Link>
  );
}
