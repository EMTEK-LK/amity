import type { SharedSessionContext } from '@/types/session-context';
import type { CrisisEscalationPlan } from '@/types/crisis';
import type { RecoveryOrchestrationPlan } from '@/types/session';
import { buildGeminiContextPayload } from './recovery-orchestrator';

/**
 * Crisis path — normal recovery coaching stops; human handoff simulated.
 */
export function prepareCrisisEscalation(ctx: SharedSessionContext): CrisisEscalationPlan {
  const now = new Date().toISOString();

  const orchestrationPlan: RecoveryOrchestrationPlan = {
    sessionId: ctx.sessionId,
    employeeId: ctx.employeeId,
    mode: 'crisis_safety',
    geminiContextReady: false,
    elevenLabsVoiceMode: 'disabled',
    bpAvatarMode: 'handoff',
    nextRoute: '/user/crisis',
    layers: {
      gemini: { status: 'blocked', contextSummary: buildGeminiContextPayload(ctx) },
      elevenLabs: { status: 'blocked', voiceMode: 'disabled' },
      beyondPresence: { status: 'handoff', avatarMode: 'handoff' },
    },
    preparedAt: now,
  };

  return {
    active: true,
    sessionId: ctx.sessionId,
    detectedAt: now,
    normalCoachingStopped: true,
    emergencyOptionsShown: true,
    humanHandoffSimulated: true,
    wellbeingOfficerNotified: true,
    message:
      'Normal recovery coaching is paused. Amity prepares live handoff and emergency support options.',
    nextRoute: '/user/crisis',
    orchestrationPlan,
  };
}

export function getCrisisCopy(): string {
  return 'Crisis mode requires human escalation. The recovery companion alone is not sufficient.';
}
