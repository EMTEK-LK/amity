import type { ConsentField, ConsentGateResult, UserConsent } from '@/types/consent';

export const CONSENT_STORAGE_KEY = 'amity-consent-demo';

export function createDefaultConsent(partial?: Partial<UserConsent>): UserConsent {
  const now = new Date().toISOString();
  return {
    cameraEnabled: false,
    microphoneEnabled: false,
    facialAwarenessEnabled: false,
    voiceAnalysisEnabled: false,
    crisisEscalationEnabled: true,
    analyticsConsent: false,
    lastUpdatedAt: now,
    ...partial,
  };
}

/** Consent preset for recovery room demo (still opt-in in UI) */
export function createRecoveryRoomConsent(): UserConsent {
  return createDefaultConsent({
    cameraEnabled: true,
    microphoneEnabled: true,
    facialAwarenessEnabled: true,
    voiceAnalysisEnabled: true,
    crisisEscalationEnabled: true,
  });
}

export function mergeConsent(
  current: UserConsent,
  patch: Partial<Omit<UserConsent, 'lastUpdatedAt'>>
): UserConsent {
  return {
    ...current,
    ...patch,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function checkConsentGate(
  consent: UserConsent,
  required: ConsentField[]
): ConsentGateResult {
  const missing = required.filter((field) => !consent[field]);
  if (missing.length === 0) {
    return { allowed: true, missing: [], message: 'Consent satisfied' };
  }
  return {
    allowed: false,
    missing,
    message: `Enable ${missing.join(', ')} to continue.`,
  };
}

export function loadStoredConsent(): UserConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserConsent;
  } catch {
    return null;
  }
}

export function saveStoredConsent(consent: UserConsent): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
}
