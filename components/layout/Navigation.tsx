'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/trigger-portal', label: 'Trigger Portal' },
  { href: '/recovery-room', label: 'Recovery Room' },
  { href: '/summary', label: 'Summary' },
  { href: '/crisis', label: 'Crisis' },
] as const;

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[var(--color-amity-accent)]/15 text-[var(--color-amity-text)]'
                : 'text-[var(--color-amity-muted)] hover:bg-white/5 hover:text-[var(--color-amity-text)]'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
