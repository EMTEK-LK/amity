import { classifySafetySync } from './safety-classifier';
import { GeminiError, type AmityRecoveryResponseResult } from './llm-types';
import { generateOpenRouterRecoveryResponse } from './openrouter';
import {
  buildFallbackRecoveryResponse,
  normalizeRecoveryResponse,
} from './recovery-response-parser';
import { buildRecoveryPrompt, type AmityRecoveryResponseInput } from './recovery-llm-prompt';

export type { AmityRecoveryResponseResult, GeminiErrorCode } from './llm-types';
export { GeminiError } from './llm-types';
export type { AmityRecoveryResponseInput } from './recovery-llm-prompt';

export interface GeminiAgentRequest {
  context: string;
  sessionContext?: { sessionId?: string; employeeId?: string; stressLevel?: number };
}

export interface GeminiAgentResponse {
  supportText: string;
  streamingReady: boolean;
}

export type LlmProviderMode = 'auto' | 'gemini' | 'openrouter';

const LLM_KEY_MISSING_MESSAGE =
  'No LLM API key configured. Add OPENROUTER_API_KEY (free at openrouter.ai/keys) or GEMINI_API_KEY to .env.local, then restart the dev server.';
const GEMINI_REQUEST_FAILED_MESSAGE =
  'Gemini request failed. Check API key, model name, and server logs.';

type GeminiApiErrorBody = {
  error?: { code?: number; message?: string; status?: string };
};

function getLlmProviderMode(): LlmProviderMode {
  const mode = process.env.AMITY_LLM_PROVIDER?.trim().toLowerCase();
  if (mode === 'gemini' || mode === 'openrouter' || mode === 'auto') return mode;
  return 'auto';
}

function isGeminiQuotaError(message: string): boolean {
  return (
    message.includes('quota') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.includes('rate limit')
  );
}

async function messageFromGeminiErrorResponse(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as GeminiApiErrorBody | null;
  const code = data?.error?.code;
  const status = data?.error?.status;
  const apiMessage = data?.error?.message?.trim();

  if (code === 429 || status === 'RESOURCE_EXHAUSTED') {
    return 'Gemini API quota exceeded. Wait about a minute and try again, or enable billing in Google AI Studio.';
  }
  if (code === 403) {
    return 'Gemini API key was rejected. Verify GEMINI_API_KEY in .env.local and restart the dev server.';
  }
  if (code === 404) {
    const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
    return `Gemini model "${model}" was not found. Set GEMINI_MODEL in .env.local to a model your key can access.`;
  }
  if (apiMessage) {
    return apiMessage.length > 240 ? `${apiMessage.slice(0, 240)}…` : apiMessage;
  }
  return GEMINI_REQUEST_FAILED_MESSAGE;
}

const CRISIS_SAFE_RESPONSE =
  "I'm really sorry you're feeling unsafe. Normal coaching is paused, and I'm preparing human support options now.";

function resultFromRawText(
  raw: string,
  input: AmityRecoveryResponseInput
): AmityRecoveryResponseResult {
  const normalized = normalizeRecoveryResponse(raw, {
    userMessage: input.userMessage,
    selectedRecoveryMode: input.selectedRecoveryMode,
  });
  if (normalized) return normalized;
  return buildFallbackRecoveryResponse(
    input.userMessage,
    input.selectedRecoveryMode ?? input.sessionContext.selectedRecoveryMode
  );
}

async function generateGeminiRecoveryResponse(
  input: AmityRecoveryResponseInput
): Promise<AmityRecoveryResponseResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiError('GEMINI_API_KEY_MISSING', LLM_KEY_MISSING_MESSAGE);
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: buildRecoveryPrompt(input) }] }],
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
    throw new GeminiError('GEMINI_REQUEST_FAILED', await messageFromGeminiErrorResponse(res));
  }

  const data = (await res.json().catch(() => null)) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  } | null;
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!raw) {
    throw new GeminiError('GEMINI_REQUEST_FAILED', GEMINI_REQUEST_FAILED_MESSAGE);
  }

  return resultFromRawText(raw, input);
}

/**
 * Recovery coaching text via configured LLM provider(s).
 * `auto`: Gemini when keyed, else OpenRouter; on Gemini quota errors, falls back to OpenRouter.
 * Server-side only — never expose API keys to the browser.
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

  const mode = getLlmProviderMode();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY?.trim());

  if (mode === 'openrouter') {
    return generateOpenRouterRecoveryResponse(input);
  }

  if (mode === 'gemini') {
    return generateGeminiRecoveryResponse(input);
  }

  // auto
  if (hasGemini) {
    try {
      return await generateGeminiRecoveryResponse(input);
    } catch (err) {
      if (hasOpenRouter && err instanceof GeminiError && isGeminiQuotaError(err.message)) {
        return generateOpenRouterRecoveryResponse(input);
      }
      throw err;
    }
  }

  if (hasOpenRouter) {
    return generateOpenRouterRecoveryResponse(input);
  }

  throw new GeminiError('GEMINI_API_KEY_MISSING', LLM_KEY_MISSING_MESSAGE);
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
