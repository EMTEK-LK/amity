import type { AgentSessionContextPayload } from '@/types/agent';

export interface AmityRecoveryResponseInput {
  userMessage: string;
  sessionContext: AgentSessionContextPayload;
  sessionId: string;
  employeeId: string;
  selectedRecoveryMode?: string | null;
}

export function buildRecoveryPrompt(input: AmityRecoveryResponseInput): string {
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

  return `You are Amity, a workplace emotional recovery assistant (not a therapist).
Write ONLY a JSON object with keys: response, recommendedAction, nextQuestion.
Do NOT include analysis, planning, or reasoning text.

Rules:
- response: 2-4 calm sentences for the employee
- recommendedAction: one of guided_reset | breathe_first | prepare_next_step | continue_recovery
- nextQuestion: short follow-up string or null
- riskLevel in context is a workplace signal only — do NOT mention risk scores unless helpful
- Only stop for crisis if the USER mentions self-harm, suicide, violence, or immediate danger

Context:
${JSON.stringify(ctx)}`;
}

export function parseRecoveryJson(text: string): Partial<{
  response: string;
  recommendedAction: string;
  nextQuestion: string | null;
}> | null {
  const tryParse = (raw: string) => {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
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
    return null;
  };

  try {
    const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
    const direct = tryParse(cleaned);
    if (direct) return direct;
  } catch {
    /* try embedded JSON */
  }

  const jsonMatch = text.match(/\{[\s\S]*"response"\s*:\s*"[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const embedded = tryParse(jsonMatch[0]);
      if (embedded) return embedded;
    } catch {
      /* fall through */
    }
  }

  return null;
}
