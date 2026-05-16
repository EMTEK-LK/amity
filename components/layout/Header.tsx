'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/components/providers/RoleProvider';
import { getRoleNavigation } from '@/lib/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { Logo } from './Logo';
import { Navigation } from './Navigation';
import { ThemeToggle } from './ThemeToggle';
import { AccountMenu } from './AccountMenu';
import { MobileDrawer } from './MobileDrawer';

const iconBtn =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-surface)] text-[var(--amity-text-muted)] transition-colors hover:bg-[var(--amity-bg-subtle)] hover:text-[var(--amity-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--amity-ring)]';

export function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { role } = useRole();
  const isAdmin = role === 'admin';
  const nav = getRoleNavigation(role);
  const profileHref = isAdmin ? '/admin/settings' : '/user/profile';
  const ProfileIcon = isAdmin ? Building2 : UserCircle;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--amity-border)] bg-[var(--amity-surface)]/90 backdrop-blur-md">
        <div className="amity-container">
          <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
            {/* Left */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={cn(iconBtn, 'lg:hidden')}
                aria-label="Open menu"
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="h-5 w-5" aria-hidden />
              </button>
              <Logo showTagline />
            </div>

            {/* Middle — desktop role nav only */}
            <div className="hidden flex-1 justify-center lg:flex">
              <Navigation />
            </div>

            {/* Right */}
            <div className="flex shrink-0 items-center gap-2">
              <AccountMenu className="hidden lg:block" />
              <ThemeToggle />
              {/* Employee-only primary CTA. Admin has none (Dashboard is in nav). */}
              {nav.primaryAction && (
                <ButtonLink
                  href={nav.primaryAction.href}
                  variant="primary"
                  size="sm"
                  className="hidden lg:inline-flex"
                >
                  <nav.primaryAction.icon className="h-4 w-4" aria-hidden />
                  {nav.primaryAction.label}
                </ButtonLink>
              )}
              {/* Mobile compact profile shortcut */}
              <Link
                href={profileHref}
                aria-label={isAdmin ? 'Company settings' : 'Your profile'}
                className={cn(iconBtn, 'sm:hidden')}
              >
                <ProfileIcon className="h-[18px] w-[18px]" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div id="mobile-drawer">
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      </div>
    </>
  );
}
