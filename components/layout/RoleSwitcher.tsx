'use client';

import { Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/components/providers/RoleProvider';
import type { UserRole } from '@/types/identity';

const options: { role: UserRole; label: string; icon: typeof User }[] = [
  { role: 'admin', label: 'Admin', icon: Building2 },
  { role: 'employee', label: 'Employee', icon: User },
];

export function RoleSwitcher({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { role, setRole, mounted } = useRole();

  return (
    <div
      className={cn(compact ? 'w-auto' : 'w-full', className)}
      role="group"
      aria-label="Demo role switcher"
    >
      <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] p-1">
        {options.map((opt) => {
          const active = mounted && role === opt.role;
          return (
            <button
              key={opt.role}
              type="button"
              onClick={() => setRole(opt.role)}
              aria-pressed={active}
              className={cn(
                'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]',
                active
                  ? 'bg-[var(--amity-surface)] text-[var(--amity-primary)] shadow-[var(--amity-shadow)]'
                  : 'text-[var(--amity-text-muted)] hover:text-[var(--amity-text)]'
              )}
            >
              <opt.icon className="h-4 w-4" aria-hidden />
              {opt.label}
            </button>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-1.5 text-center text-[11px] text-[var(--amity-text-muted)]">
          Demo role switch — no real sign-in
        </p>
      )}
    </div>
  );
}
