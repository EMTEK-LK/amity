'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRole } from '@/components/providers/RoleProvider';
import { getRoleNavigation } from '@/lib/navigation';

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Desktop-only role-based navigation. Hidden on mobile (drawer handles it). */
export function Navigation() {
  const pathname = usePathname();
  const { role } = useRole();
  const nav = getRoleNavigation(role);
  const links = [nav.home, ...nav.items];

  return (
    <nav
      className="hidden items-center gap-1 lg:flex"
      aria-label={`${role === 'admin' ? 'Company admin' : 'Employee'} navigation`}
    >
      {links.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
              active
                ? 'bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
                : 'text-[var(--amity-text-muted)] hover:bg-[var(--amity-bg-subtle)] hover:text-[var(--amity-text)]'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
