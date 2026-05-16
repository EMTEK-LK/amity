import type { FacialAwarenessSignal, FacialExpression } from '@/types/facial-awareness';
import type { UserConsent } from '@/types/consent';
import { checkConsentGate } from './consent-manager';

export interface FacialAwarenessInput {
  consent: UserConsent;
  /** Demo expression from trigger scenario or mock */
  expressionHint?: FacialExpression;
  simulated?: boolean;
}

/**
 * MVP: returns mock broad expression signal.
 * Future: face-api.js browser-side pipeline (consent-gated).
 */
export function captureFacialSignal(input: FacialAwarenessInput): FacialAwarenessSignal | null {
  const gate = checkConsentGate(input.consent, ['cameraEnabled', 'facialAwarenessEnabled']);
  if (!gate.allowed) return null;

  const expression = input.expressionHint ?? 'neutral';
  const now = new Date().toISOString();

  return {
    expression,
    confidence: input.simulated ? 0.72 : 0.85,
    engagement: expression === 'sad' || expression === 'stressed' ? 'low' : 'medium',
    attention: expression === 'tired' ? 'distracted' : 'focused',
    signalQuality: 'good',
    capturedAt: now,
    simulated: input.simulated ?? true,
  };
}

export function describeFacialSignal(signal: FacialAwarenessSignal | null): string {
  if (!signal) return 'Facial awareness off — consent required';
  return `Visible cue: ${signal.expression} (indicative, not diagnostic)`;
}
