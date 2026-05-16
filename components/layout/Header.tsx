import Link from 'next/link';
import { HeartPulse } from 'lucide-react';
import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-amity-border)]/60 bg-[var(--color-amity-bg)]/85 backdrop-blur-md">
      <div className="amity-container flex flex-col gap-3 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 text-[var(--color-amity-text)]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-amity-border)] bg-[var(--color-amity-surface)] text-[var(--color-amity-accent)] transition-colors group-hover:border-[var(--color-amity-accent)]/40">
              <HeartPulse className="h-4 w-4" aria-hidden />
            </span>
            <span className="truncate text-lg font-semibold tracking-tight">Amity</span>
          </Link>
          <span className="hidden rounded-full border border-[var(--color-amity-border)] px-2.5 py-1 text-xs text-[var(--color-amity-muted)] sm:inline">
            Buildathon demo
          </span>
        </div>
        <Navigation />
      </div>
    </header>
  );
}
