import type { SharedSessionContext } from '@/types/session-context';
import type { RecoveryOrchestrationPlan } from '@/types/session';
import { buildGeminiSessionContextPayload } from './gemini-session-context';
import { shouldActivateCrisisMode } from './risk-engine';
import { prepareCrisisEscalation } from './crisis-escalation';

export { buildGeminiSessionContextPayload } from './gemini-session-context';
export type { GeminiSessionContextInput } from './gemini-session-context';

/**
 * Prepares recovery layers from shared session context.
 * MVP: deterministic demo plan — no real Gemini / ElevenLabs / BP calls.
 */
export function prepareRecoverySession(
  ctx: SharedSessionContext
): RecoveryOrchestrationPlan {
  if (shouldActivateCrisisMode(ctx)) {
    const crisis = prepareCrisisEscalation(ctx);
    return crisis.orchestrationPlan;
  }

  const mode = mapRecoveryMode(ctx);
  const isHigh = ctx.riskLevel === 'high' || ctx.riskLevel === 'crisis';

  return {
    sessionId: ctx.sessionId,
    employeeId: ctx.employeeId,
    mode,
    geminiContextReady: true,
    elevenLabsVoiceMode: isHigh ? 'grounding_slow' : 'calm_support',
    bpAvatarMode: 'supportive_recovery',
    nextRoute: '/user/recovery',
    layers: {
      gemini: {
        status: 'placeholder',
        contextSummary: buildGeminiSessionContextPayload({ ctx }),
      },
      elevenLabs: {
        status: 'placeholder',
        voiceMode: isHigh ? 'grounding_slow' : 'calm_support',
      },
      beyondPresence: {
        status: 'placeholder',
        avatarMode: 'supportive_recovery',
      },
    },
    preparedAt: new Date().toISOString(),
  };
}

function mapRecoveryMode(ctx: SharedSessionContext): string {
  if (ctx.stressLevel >= 80) return 'calm_reset';
  if (ctx.stressLevel >= 60) return 'focus_reset';
  return 'light_reset';
}

/** @deprecated Use buildGeminiSessionContextPayload */
export function buildGeminiContextPayload(ctx: SharedSessionContext): Record<string, unknown> {
  return buildGeminiSessionContextPayload({ ctx });
}
