import type { SafetyLevel } from '@/types/session-context';

export interface AmityRecoveryResponseResult {
  response: string;
  safetyLevel: SafetyLevel;
  recommendedAction: string;
  nextQuestion: string | null;
  provider: 'real' | 'safety';
}

export type GeminiErrorCode = 'GEMINI_API_KEY_MISSING' | 'GEMINI_REQUEST_FAILED';

export class GeminiError extends Error {
  readonly code: GeminiErrorCode;
  constructor(code: GeminiErrorCode, message: string) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}
