import type { SafetyClassification } from '../types/crisis';

/**
 * Classifies user text for crisis vs normal coaching.
 * Gemini + keyword fallback planned in Phase 4 / 6.
 */
export async function classifySafety(_userText: string): Promise<SafetyClassification> {
  throw new Error('safety-classifier not implemented — Phase 4');
}

/** Demo keyword list for crisis simulation without API */
export const CRISIS_DEMO_KEYWORDS: readonly string[] = [
  'want to die',
  'hurt myself',
  'cannot continue',
  'took pills',
  'have a plan',
  'not safe',
  'hurt someone',
] as const;
