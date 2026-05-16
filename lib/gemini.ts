import type { SharedSessionContext } from '@/types/session-context';

export interface GeminiAgentRequest {
  context: string;
  triggerCategory?: string;
  employeeFirstName?: string;
  sessionContext?: SharedSessionContext;
}

export interface GeminiAgentResponse {
  supportText: string;
  sessionSummary?: string;
  /** MVP placeholder — future streaming session id */
  streamingReady: boolean;
}

const DEMO_RESPONSES = [
  'I hear that this moment feels heavy. Let’s take one slow breath together before we continue.',
  'What you are feeling makes sense after a high-pressure signal. You are not alone in this reset.',
  'Let’s ground for a moment — notice your feet, soften your shoulders, and exhale a little longer than you inhale.',
];

/**
 * Gemini emotional reasoning layer (MVP placeholder).
 * Future: Gemini API + Gemini Live streaming.
 */
export async function generateSupportResponse(
  request: GeminiAgentRequest
): Promise<GeminiAgentResponse> {
  const idx = Math.abs(hashCode(request.context)) % DEMO_RESPONSES.length;
  return {
    supportText: DEMO_RESPONSES[idx],
    sessionSummary: request.sessionContext
      ? `Recovery support for ${request.sessionContext.currentEmotion} signal.`
      : undefined,
    streamingReady: false,
  };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}
