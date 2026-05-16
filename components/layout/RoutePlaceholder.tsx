import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface RoutePlaceholderProps {
  title: string;
  description: string;
}

export function RoutePlaceholder({ title, description }: RoutePlaceholderProps) {
  return (
    <div className="amity-container py-10 sm:py-14">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--color-amity-muted)] hover:text-[var(--color-amity-text)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to home
      </Link>
      <div className="amity-card mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-[var(--color-amity-text)]">{title}</h1>
        <p className="mt-3 text-[var(--color-amity-muted)]">{description}</p>
        <p className="mt-4 text-sm text-[var(--color-amity-muted)]">Coming in a future build step.</p>
      </div>
    </div>
  );
}
