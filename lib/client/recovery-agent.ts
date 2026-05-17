import type {
  AgentErrorResponse,
  AgentRespondRequest,
  AgentRespondResponse,
  GeminiProviderStatus,
} from '@/types/agent';

/** Thrown when the agent route returns a non-2xx (e.g. missing GEMINI_API_KEY). */
export class RecoveryAgentError extends Error {
  readonly code?: string;
  readonly geminiProvider?: GeminiProviderStatus;
  constructor(message: string, code?: string, geminiProvider?: GeminiProviderStatus) {
    super(message);
    this.name = 'RecoveryAgentError';
    this.code = code;
    this.geminiProvider = geminiProvider;
  }
}

export async function sendRecoveryAgentMessage(
  body: AgentRespondRequest
): Promise<AgentRespondResponse> {
  const res = await fetch('/api/agent/respond', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as Partial<AgentErrorResponse> & {
      error?: string;
    };
    throw new RecoveryAgentError(
      err.message ?? err.error ?? `Agent request failed (${res.status})`,
      err.error,
      err.provider?.gemini
    );
  }

  return res.json() as Promise<AgentRespondResponse>;
}
