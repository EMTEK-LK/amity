import type { DemoAdmin, DemoEmployee, DemoIdentity, UserRole } from '@/types/identity';

/**
 * Hardcoded demo identities for the hackathon. No real authentication —
 * a role switcher toggles between these two perspectives.
 */

export const DEMO_ADMIN: DemoAdmin = {
  id: 'ADMIN-001',
  name: 'Admin User',
  role: 'Company Admin',
  company: 'Amity Demo Company',
  email: 'admin@amity.demo',
};

export const DEMO_EMPLOYEE: DemoEmployee = {
  id: 'EMP-001',
  name: 'Sarah Perera',
  role: 'Customer Support Agent',
  department: 'Customer Care',
  company: 'Amity Demo Company',
  email: 'sarah@amity.demo',
  status: 'Stable',
};

export const DEMO_IDENTITY: DemoIdentity = {
  admin: DEMO_ADMIN,
  employee: DEMO_EMPLOYEE,
};

export const DEFAULT_ROLE: UserRole = 'employee';
export const ROLE_STORAGE_KEY = 'amity-role';

export function isUserRole(value: unknown): value is UserRole {
  return value === 'admin' || value === 'employee';
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Company Admin',
  employee: 'Employee',
};

export function getRoleDisplayName(role: UserRole): string {
  return ROLE_LABELS[role];
}

/** Returns the hardcoded identity (name, email, etc.) for the given demo role. */
export function getDemoIdentityByRole(role: UserRole): DemoAdmin | DemoEmployee {
  return role === 'admin' ? DEMO_ADMIN : DEMO_EMPLOYEE;
}
