import type { SharedSessionContext } from '@/types/session-context';
import { createInitialSessionContext } from './session-context';

export const RECOVERY_CONTEXT_KEY = 'amity-recovery-context';

export function loadRecoveryContext(): SharedSessionContext {
  if (typeof window === 'undefined') return createInitialSessionContext();
  try {
    const raw = sessionStorage.getItem(RECOVERY_CONTEXT_KEY);
    if (raw) return JSON.parse(raw) as SharedSessionContext;
  } catch {
    /* use default */
  }
  return createInitialSessionContext();
}

export function saveRecoveryContext(ctx: SharedSessionContext): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RECOVERY_CONTEXT_KEY, JSON.stringify(ctx));
}

export function clearRecoveryContext(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(RECOVERY_CONTEXT_KEY);
}
