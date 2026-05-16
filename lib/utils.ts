/**
 * Utility helpers.
 * `cn()` will use clsx + tailwind-merge after Next.js app shell (Phase 1).
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatIso(date: Date = new Date()): string {
  return date.toISOString();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
