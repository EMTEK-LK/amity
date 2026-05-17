import type { SafetyClassification } from '@/types/crisis';

/**
 * Classifies user text for crisis vs normal coaching (MVP keyword demo).
 * Future: Gemini safety layer.
 */
export async function classifySafety(userText: string): Promise<SafetyClassification> {
  const lower = userText.toLowerCase();
  const matched = CRISIS_DEMO_KEYWORDS.filter((kw) => lower.includes(kw));

  if (matched.length > 0) {
    return {
      mode: 'crisis',
      flags: ['immediate_danger_language'],
      confidence: 0.88,
      matchedPhrases: matched,
    };
  }

  return {
    mode: 'normal',
    flags: [],
    confidence: 0.92,
  };
}

/** Synchronous demo helper for UI */
export function classifySafetySync(userText: string): SafetyClassification {
  const lower = userText.toLowerCase();
  const matched = CRISIS_DEMO_KEYWORDS.filter((kw) => lower.includes(kw));
  if (matched.length > 0) {
    return {
      mode: 'crisis',
      flags: ['immediate_danger_language'],
      confidence: 0.88,
      matchedPhrases: matched,
    };
  }
  return { mode: 'normal', flags: [], confidence: 0.92 };
}

export const CRISIS_DEMO_KEYWORDS: readonly string[] = [
  'want to die',
  'hurt myself',
  'cannot continue',
  'took pills',
  'have a plan',
  'not safe',
  'hurt someone',
] as const;
