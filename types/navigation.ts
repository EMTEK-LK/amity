import type { LucideIcon } from 'lucide-react';
import type { UserRole } from './identity';

export interface RoleNavigationItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface RoleNavigation {
  role: UserRole;
  /** Home route shown in every navigation context. */
  home: RoleNavigationItem;
  items: RoleNavigationItem[];
  /**
   * Optional primary call-to-action surfaced in header / drawer.
   * Admin has none (Dashboard already lives in nav); employee uses Trigger Demo.
   */
  primaryAction?: RoleNavigationItem;
}
