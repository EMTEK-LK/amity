'use client';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useTheme();

  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text-muted)] transition-colors',
        'hover:border-[var(--amity-primary)]/40 hover:bg-[var(--amity-primary-muted)] hover:text-[var(--amity-primary)]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
        !mounted && 'opacity-0',
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-[18px] w-[18px]" aria-hidden />
        ) : (
          <Moon className="h-[18px] w-[18px]" aria-hidden />
        )
      ) : (
        <span className="h-[18px] w-[18px]" aria-hidden />
      )}
    </button>
  );
}
