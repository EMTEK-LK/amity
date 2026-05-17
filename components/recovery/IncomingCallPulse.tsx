'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Calm concentric pulse behind the Amity mark on the incoming call screen. */
export function IncomingCallPulse({
  crisis = false,
  children,
}: {
  crisis?: boolean;
  children: React.ReactNode;
}) {
  const ring = crisis ? 'border-[var(--amity-danger)]/40' : 'border-[var(--amity-primary)]/40';
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className={cn('absolute h-full w-full rounded-full border', ring)}
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
        />
      ))}
      <div
        className={cn(
          'relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-[var(--amity-surface)] shadow-[var(--amity-shadow)]',
          crisis
            ? 'border-[var(--amity-danger)]/50 text-[var(--amity-danger)]'
            : 'border-[var(--amity-primary)]/50 text-[var(--amity-primary)]'
        )}
      >
        {children}
      </div>
    </div>
  );
}
