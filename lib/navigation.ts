import {
  BarChart3,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  UserCircle,
  Users,
  Video,
} from 'lucide-react';
import type { RoleNavigation } from '@/types/navigation';
import type { UserRole } from '@/types/identity';

const HOME = { label: 'Home', href: '/', icon: Home };

/**
 * Admin navigation. Dashboard lives in the nav itself, so there is no
 * primary CTA (avoids a duplicate "Open Dashboard" control).
 */
export const ADMIN_NAV: RoleNavigation = {
  role: 'admin',
  home: HOME,
  items: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Employees', href: '/admin/employees', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Summary', href: '/admin/summary', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
};

/**
 * Employee navigation. Trigger Demo is intentionally NOT a nav item —
 * it is the single primary action surfaced as a CTA / drawer button.
 */
export const EMPLOYEE_NAV: RoleNavigation = {
  role: 'employee',
  home: HOME,
  items: [
    { label: 'My Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'Recovery', href: '/user/recovery', icon: Video },
    { label: 'My Summary', href: '/user/summary', icon: FileText },
    { label: 'Crisis Support', href: '/user/crisis', icon: ShieldAlert },
    { label: 'Profile', href: '/user/profile', icon: UserCircle },
  ],
  primaryAction: { label: 'Trigger Demo', href: '/user/trigger-demo', icon: HeartPulse },
};

export function getRoleNavigation(role: UserRole): RoleNavigation {
  return role === 'admin' ? ADMIN_NAV : EMPLOYEE_NAV;
}
