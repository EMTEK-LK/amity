import { GeminiError, type AmityRecoveryResponseResult } from './llm-types';
import {
  buildFallbackRecoveryResponse,
  normalizeRecoveryResponse,
} from './recovery-response-parser';
import { buildRecoveryPrompt, type AmityRecoveryResponseInput } from './recovery-llm-prompt';

type OpenRouterErrorBody = {
  error?: { message?: string; code?: number };
};

type OpenRouterMessage = {
  content?: string | null;
  reasoning?: string | null;
};

type OpenRouterCompletion = {
  choices?: { message?: OpenRouterMessage }[];
  model?: string;
  error?: { message?: string };
};

async function messageFromOpenRouterError(res: Response): Promise<string> {
  const data = (await res.json().catch(() => null)) as OpenRouterErrorBody | null;
  const apiMessage = data?.error?.message?.trim();
  if (res.status === 429) {
    return 'OpenRouter rate limit reached. Wait a moment and try again, or switch AMITY_LLM_PROVIDER=gemini.';
  }
  if (apiMessage) {
    return apiMessage.length > 240 ? `${apiMessage.slice(0, 240)}…` : apiMessage;
  }
  return 'OpenRouter request failed. Check OPENROUTER_API_KEY and OPENROUTER_MODEL in .env.local.';
}

function extractMessageText(message: OpenRouterMessage | undefined): string {
  return message?.content?.trim() ?? '';
}

async function requestOpenRouter(
  apiKey: string,
  appUrl: string,
  model: string,
  prompt: string,
  useJsonFormat: boolean
): Promise<OpenRouterCompletion> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      {
        role: 'system',
        content:
          'Reply with one JSON object only. Fields: response, recommendedAction, nextQuestion. No markdown, no reasoning, no extra text.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.65,
    max_tokens: 320,
  };
  if (useJsonFormat) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': appUrl,
      'X-Title': 'Amity',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new GeminiError('GEMINI_REQUEST_FAILED', await messageFromOpenRouterError(res));
  }

  return (await res.json().catch(() => ({}))) as OpenRouterCompletion;
}

/** OpenAI-compatible chat completions — https://openrouter.ai/docs */
export async function generateOpenRouterRecoveryResponse(
  input: AmityRecoveryResponseInput
): Promise<AmityRecoveryResponseResult> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiError(
      'GEMINI_API_KEY_MISSING',
      'OpenRouter API key is missing. Add OPENROUTER_API_KEY to .env.local (get one at openrouter.ai/keys).'
    );
  }

  const model = process.env.OPENROUTER_MODEL?.trim() || 'openrouter/free';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000';
  const prompt = buildRecoveryPrompt(input);

  const attempts: { model: string; useJsonFormat: boolean }[] = [
    { model, useJsonFormat: false },
    { model, useJsonFormat: true },
  ];
  if (model !== 'openrouter/free') {
    attempts.push({ model: 'openrouter/free', useJsonFormat: false });
  }

  let lastError: string | null = null;

  for (const attempt of attempts) {
    let data: OpenRouterCompletion;
    try {
      data = await requestOpenRouter(apiKey, appUrl, attempt.model, prompt, attempt.useJsonFormat);
    } catch (err) {
      if (err instanceof GeminiError) {
        lastError = err.message;
        continue;
      }
      throw new GeminiError('GEMINI_REQUEST_FAILED', 'OpenRouter request failed. Check network and API key.');
    }

    if (data.error?.message) {
      lastError = data.error.message;
      continue;
    }

    const raw = extractMessageText(data.choices?.[0]?.message);
    const normalized = raw
      ? normalizeRecoveryResponse(raw, {
          userMessage: input.userMessage,
          selectedRecoveryMode: input.selectedRecoveryMode,
        })
      : null;
    if (normalized) {
      return normalized;
    }
    lastError = raw
      ? `Model ${data.model ?? attempt.model} returned invalid coaching text`
      : `Model ${data.model ?? attempt.model} returned no text`;
  }

  return buildFallbackRecoveryResponse(
    input.userMessage,
    input.selectedRecoveryMode ?? input.sessionContext.selectedRecoveryMode
  );
}
