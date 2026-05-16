import type { AgentSessionContextPayload } from '@/types/agent';
import type { SafetyLevel } from '@/types/session-context';
import { classifySafetySync } from './safety-classifier';

export interface GeminiAgentRequest {
  context: string;
  sessionContext?: { sessionId?: string; employeeId?: string; stressLevel?: number };
}

export interface GeminiAgentResponse {
  supportText: string;
  streamingReady: boolean;
}

export interface AmityRecoveryResponseInput {
  userMessage: string;
  sessionContext: AgentSessionContextPayload;
  sessionId: string;
  employeeId: string;
  selectedRecoveryMode?: string | null;
}

export interface AmityRecoveryResponseResult {
  response: string;
  safetyLevel: SafetyLevel;
  recommendedAction: string;
  nextQuestion: string | null;
  provider: 'real' | 'safety';
}

export type GeminiErrorCode = 'GEMINI_API_KEY_MISSING' | 'GEMINI_REQUEST_FAILED';

/**
 * Step 6A: there is no mock fallback. A missing key or failed request
 * throws this so the route can surface a clear setup error in the UI.
 */
export class GeminiError extends Error {
  readonly code: GeminiErrorCode;
  constructor(code: GeminiErrorCode, message: string) {
    super(message);
    this.name = 'GeminiError';
    this.code = code;
  }
}

const GEMINI_KEY_MISSING_MESSAGE =
  'Gemini API key is missing. Add GEMINI_API_KEY to .env.local and restart the dev server.';
const GEMINI_REQUEST_FAILED_MESSAGE =
  'Gemini request failed. Check API key, model name, and server logs.';

const CRISIS_SAFE_RESPONSE =
  "I'm really sorry you're feeling unsafe. Normal coaching is paused, and I'm preparing human support options now.";

function buildPrompt(input: AmityRecoveryResponseInput): string {
  const ctx = {
    employeeRole: input.sessionContext.employeeRole ?? 'employee',
    employeeId: input.employeeId,
    sessionId: input.sessionId,
    triggerType: input.sessionContext.triggerType,
    userMessage: input.userMessage,
    transcript: input.sessionContext.transcript,
    stressLevel: input.sessionContext.stressLevel,
    heartRate: input.sessionContext.heartRate,
    voiceState: input.sessionContext.voiceState,
    facialExpression: input.sessionContext.facialExpression,
    facialConfidence: input.sessionContext.facialConfidence,
    engagement: input.sessionContext.engagement,
    facialSignalQuality: input.sessionContext.facialSignalQuality,
    riskLevel: input.sessionContext.riskLevel,
    selectedRecoveryMode: input.selectedRecoveryMode ?? input.sessionContext.selectedRecoveryMode,
    disclaimer:
      'Facial signal is optional and uncertain — not diagnosis. Prioritize user words over facial signal.',
  };

  return `You are Amity, a workplace emotional recovery assistant.
You are NOT a therapist or medical provider.
You do NOT diagnose.
You help employees recover from high-pressure work moments.
Use short, calm, practical responses (2-4 sentences).
Ask permission before guiding when appropriate.
Use the facial signal only as a supportive cue, not as proof.
If the user mentions self-harm, suicide, violence, or immediate danger, stop coaching and recommend crisis escalation.

Session context (summarized only — no images or video):
${JSON.stringify(ctx, null, 2)}

Respond with JSON only, no markdown:
{
  "response": "your supportive reply",
  "recommendedAction": "guided_reset | breathe_first | prepare_next_step | continue_recovery",
  "nextQuestion": "optional short follow-up question or null"
}`;
}

function parseGeminiJson(text: string): Partial<{
  response: string;
  recommendedAction: string;
  nextQuestion: string | null;
}> | null {
  try {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    if (typeof parsed.response === 'string') {
      return {
        response: parsed.response,
        recommendedAction:
          typeof parsed.recommendedAction === 'string' ? parsed.recommendedAction : undefined,
        nextQuestion:
          typeof parsed.nextQuestion === 'string'
            ? parsed.nextQuestion
            : parsed.nextQuestion === null
              ? null
              : undefined,
      };
    }
  } catch {
    /* use raw text */
  }
  return null;
}

/**
 * Generates recovery coaching text via the Gemini API. Step 6A: NO mock
 * fallback — a missing key or failed request throws `GeminiError`.
 * Server-side only — never expose GEMINI_API_KEY to the browser.
 */
export async function generateAmityRecoveryResponse(
  input: AmityRecoveryResponseInput
): Promise<AmityRecoveryResponseResult> {
  const safety = classifySafetySync(input.userMessage);
  if (safety.mode === 'crisis') {
    return {
      response: CRISIS_SAFE_RESPONSE,
      safetyLevel: 'crisis',
      recommendedAction: 'open_crisis_flow',
      nextQuestion: null,
      provider: 'safety',
    };
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY_MISSING', GEMINI_KEY_MISSING_MESSAGE);
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 320,
          responseMimeType: 'application/json',
        },
      }),
    });
  } catch {
    throw new GeminiError('GEMINI_REQUEST_FAILED', GEMINI_REQUEST_FAILED_MESSAGE);
  }

  if (!res.ok) {
    throw new GeminiError('GEMINI_REQUEST_FAILED', GEMINI_REQUEST_FAILED_MESSAGE);
  }

  const data = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  } | null;
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!raw) {
    throw new GeminiError('GEMINI_REQUEST_FAILED', GEMINI_REQUEST_FAILED_MESSAGE);
  }

  const parsed = parseGeminiJson(raw);
  if (parsed?.response) {
    return {
      response: parsed.response,
      safetyLevel: 'normal',
      recommendedAction: parsed.recommendedAction ?? 'guided_reset',
      nextQuestion: parsed.nextQuestion ?? null,
      provider: 'real',
    };
  }

  return {
    response: raw,
    safetyLevel: 'normal',
    recommendedAction: 'guided_reset',
    nextQuestion: null,
    provider: 'real',
  };
}

export function getCrisisSafeResponseText(): string {
  return CRISIS_SAFE_RESPONSE;
}

/** Legacy — prefer generateAmityRecoveryResponse */
export async function generateSupportResponse(
  request: GeminiAgentRequest
): Promise<GeminiAgentResponse> {
  const result = await generateAmityRecoveryResponse({
    userMessage: request.context,
    sessionId: request.sessionContext?.sessionId ?? 'SES-DEMO-001',
    employeeId: request.sessionContext?.employeeId ?? 'EMP-001',
    sessionContext: {
      stressLevel: request.sessionContext?.stressLevel ?? 50,
      heartRate: 72,
      voiceState: 'calm',
      riskLevel: 'low',
      safetyLevel: 'normal',
    },
  });
  return { supportText: result.response, streamingReady: false };
}
