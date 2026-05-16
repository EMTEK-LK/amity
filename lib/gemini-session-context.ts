import type { SharedSessionContext } from '@/types/session-context';

export interface GeminiSessionContextInput {
  ctx: SharedSessionContext;
  userMessage?: string;
  transcript?: string | null;
  selectedRecoveryMode?: string | null;
}

/**
 * Builds a summarized session payload for Gemini agent calls.
 *
 * IMPORTANT: Only summarized context is sent to Gemini.
 * Raw video and image frames are never sent.
 */
export function buildGeminiSessionContextPayload(
  input: GeminiSessionContextInput
): Record<string, unknown> {
  const { ctx, userMessage, transcript, selectedRecoveryMode } = input;

  return {
    sessionId: ctx.sessionId,
    employeeId: ctx.employeeId,
    userMessage: userMessage ?? null,
    triggerType: ctx.triggerType ?? null,
    triggerId: ctx.triggerId ?? null,
    currentEmotion: ctx.currentEmotion,
    stressLevel: ctx.stressLevel,
    heartRate: ctx.heartRate,
    voiceState: ctx.voiceState,
    transcript: transcript ?? ctx.voiceSession?.transcript ?? null,
    facialExpression: ctx.facialSignal?.expression ?? null,
    facialConfidence: ctx.facialConfidence,
    engagement: ctx.engagement,
    facialSignalQuality: ctx.facialSignalQuality,
    facialUpdatedAt: ctx.facialUpdatedAt,
    riskLevel: ctx.riskLevel,
    safetyLevel: ctx.safetyLevel,
    selectedRecoveryMode: selectedRecoveryMode ?? null,
    recommendedAction: ctx.recommendedAction,
    positioning: 'workplace_emotional_recovery_not_medical',
    facialDisclaimer: 'optional_indicative_cue_not_diagnosis_prioritize_user_words',
  };
}
