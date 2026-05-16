import Link from 'next/link';
import { ArrowRight, LayoutDashboard, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="amity-container py-10 sm:py-16">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-[var(--color-amity-accent)] uppercase">
          Workplace wellbeing
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-amity-text)] sm:text-5xl">
          Amity
        </h1>
        <p className="mt-4 text-lg text-[var(--color-amity-muted)] sm:text-xl">
          Real-time AI video recovery for high-pressure teams
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-amity-muted)]">
          Amity receives workplace stress signals, assesses emotional risk, and launches a
          private video recovery session — helping employees reset during high-pressure moments
          with privacy-safe company insights.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--color-amity-border)] bg-[var(--color-amity-surface)] px-6 py-3 text-sm font-medium text-[var(--color-amity-text)] transition-colors hover:border-[var(--color-amity-accent)]/50 hover:bg-[var(--color-amity-card)]"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Open Dashboard
            <ArrowRight className="h-4 w-4 opacity-60" aria-hidden />
          </Link>
          <Link
            href="/trigger-portal"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-amity-accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Zap className="h-4 w-4" aria-hidden />
            Open Trigger Portal
            <ArrowRight className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-2xl">
        <div className="amity-card text-sm leading-relaxed text-[var(--color-amity-muted)]">
          <strong className="text-[var(--color-amity-text)]">Demo scope:</strong> triggers are
          simulated via the Trigger Portal. Wearable and workplace integrations are planned for
          future releases.
        </div>
      </section>
    </div>
  );
}
