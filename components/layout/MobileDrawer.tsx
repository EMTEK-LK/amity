'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/components/providers/RoleProvider';
import { getRoleNavigation } from '@/lib/navigation';
import { getRoleDisplayName } from '@/lib/demo-identities';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';
import { RoleSwitcher } from './RoleSwitcher';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const pathname = usePathname();
  const { role, identity, mounted } = useRole();
  const nav = getRoleNavigation(role);
  const links = [nav.home, ...nav.items];

  const isAdmin = role === 'admin';
  const person = isAdmin ? identity.admin : identity.employee;
  const personSub = isAdmin
    ? identity.admin.company
    : `${identity.employee.role} · ${identity.employee.department}`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] lg:hidden',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-[var(--amity-overlay)] transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel — slides left → right */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'absolute left-0 top-0 flex h-full w-[min(86vw,340px)] flex-col border-r border-[var(--amity-border)] bg-[var(--amity-surface)] shadow-[var(--amity-shadow-elevated)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--amity-border)] px-4 py-3.5">
          <Logo showTagline={false} onClick={onClose} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text-muted)] hover:bg-[var(--amity-bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Profile summary */}
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
              {isAdmin ? (
                <Building2 className="h-5 w-5" aria-hidden />
              ) : (
                <User className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--amity-text)]">
                {mounted ? person.name : 'Amity'}
              </p>
              <p className="truncate text-xs text-[var(--amity-text-muted)]">
                {mounted ? personSub : getRoleDisplayName(role)}
              </p>
            </div>
          </div>

          {/* Role switcher */}
          <div className="mt-4">
            <RoleSwitcher />
          </div>

          {/* Role nav */}
          <nav
            className="mt-5 flex flex-col gap-1"
            aria-label={`${isAdmin ? 'Company admin' : 'Employee'} navigation`}
          >
            {links.map((item) => {
              const active = isActivePath(pathname, item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
                    active
                      ? 'bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]'
                      : 'text-[var(--amity-text)] hover:bg-[var(--amity-bg-subtle)]'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Primary action (employee only) + privacy footer */}
        <div className="space-y-3 border-t border-[var(--amity-border)] p-4">
          {nav.primaryAction && (
            <ButtonLink
              href={nav.primaryAction.href}
              variant="primary"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              <nav.primaryAction.icon className="h-4 w-4" aria-hidden />
              {nav.primaryAction.label}
            </ButtonLink>
          )}
          <p className="text-center text-[11px] leading-relaxed text-[var(--amity-text-muted)]">
            {isAdmin
              ? 'Company view shows privacy-safe aggregates only — never private content.'
              : 'Your recovery sessions are private. The company sees aggregates only.'}
          </p>
        </div>
      </aside>
    </div>
  );
}
