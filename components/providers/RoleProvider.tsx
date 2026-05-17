'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  DEFAULT_ROLE,
  DEMO_IDENTITY,
  ROLE_STORAGE_KEY,
  isUserRole,
} from '@/lib/demo-identities';
import type { UserRole } from '@/types/identity';

interface RoleContextValue {
  role: UserRole;
  setRole: (role: UserRole) => void;
  toggleRole: () => void;
  identity: typeof DEMO_IDENTITY;
  mounted: boolean;
}

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(DEFAULT_ROLE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(ROLE_STORAGE_KEY);
    if (isUserRole(stored)) setRoleState(stored);
    setMounted(true);
  }, []);

  const setRole = useCallback((next: UserRole) => {
    setRoleState(next);
    localStorage.setItem(ROLE_STORAGE_KEY, next);
  }, []);

  const toggleRole = useCallback(() => {
    setRoleState((prev) => {
      const next: UserRole = prev === 'admin' ? 'employee' : 'admin';
      localStorage.setItem(ROLE_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ role, setRole, toggleRole, identity: DEMO_IDENTITY, mounted }),
    [role, setRole, toggleRole, mounted]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
