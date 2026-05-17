'use client';

import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/components/providers/RoleProvider';
import {
  DEMO_ADMIN,
  DEMO_EMPLOYEE,
  ROLE_LABELS,
  getDemoIdentityByRole,
} from '@/lib/demo-identities';
import type { UserRole } from '@/types/identity';

const ROLE_ORDER: UserRole[] = ['admin', 'employee'];

/** One professional account/role selector for the desktop header. */
export function AccountMenu({ className }: { className?: string }) {
  const { role, setRole, mounted } = useRole();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const identity = getDemoIdentityByRole(role);
  const Icon = role === 'admin' ? Building2 : User;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account and role selector"
        className={cn(
          'inline-flex items-center gap-2.5 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-2.5 py-1.5 text-left transition-colors',
          'hover:bg-[var(--amity-bg-subtle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]'
        )}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="hidden min-w-0 leading-tight sm:block">
          <span className="block truncate text-sm font-semibold text-[var(--amity-text)]">
            {mounted ? identity.name : 'Amity'}
          </span>
          <span className="block truncate text-[11px] text-[var(--amity-text-muted)]">
            {mounted ? ROLE_LABELS[role] : 'Loading'}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-[var(--amity-text-muted)] transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Switch demo role"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-surface)] shadow-[var(--amity-shadow-elevated)]"
        >
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--amity-text-muted)]">
            Demo role — no real sign-in
          </p>
          {ROLE_ORDER.map((r) => {
            const id = r === 'admin' ? DEMO_ADMIN : DEMO_EMPLOYEE;
            const RoleIcon = r === 'admin' ? Building2 : User;
            const active = mounted && role === r;
            return (
              <button
                key={r}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setRole(r);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  'hover:bg-[var(--amity-bg-subtle)] focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-[var(--amity-ring)]',
                  active && 'bg-[var(--amity-primary-muted)]'
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-primary)]">
                  <RoleIcon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-medium text-[var(--amity-text)]">
                    {id.name}
                  </span>
                  <span className="block truncate text-xs text-[var(--amity-text-muted)]">
                    {ROLE_LABELS[r]}
                  </span>
                </span>
                {active && (
                  <Check className="h-4 w-4 shrink-0 text-[var(--amity-primary)]" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
