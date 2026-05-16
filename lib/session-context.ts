import type { TriggerScenario } from '@/types/trigger';
import type {
  SessionContextPatch,
  SharedSessionContext,
} from '@/types/session-context';
import type { FacialAwarenessSignal } from '@/types/facial-awareness';
import type { VoiceSessionState } from '@/types/voice';
import { createDefaultConsent } from './consent-manager';
import { captureFacialSignal } from './facial-awareness';
import { createVoiceSessionSnapshot } from './voice-session';
import { calculateSessionRisk, shouldActivateCrisisMode } from './risk-engine';
import { DEMO_EMPLOYEE } from './demo-identities';

const DEMO_SESSION_ID = 'SES-DEMO-001';

export function createInitialSessionContext(
  employeeId: string = DEMO_EMPLOYEE.id
): SharedSessionContext {
  const now = new Date().toISOString();
  const consent = createDefaultConsent({ crisisEscalationEnabled: true });

  return {
    sessionId: DEMO_SESSION_ID,
    employeeId,
    role: 'employee',
    source: 'session_init',
    consent,
    currentEmotion: 'calm',
    stressLevel: 22,
    heartRate: 68,
    voiceState: 'calm',
    facialSignal: null,
    engagement: 'medium',
    riskLevel: 'low',
    safetyLevel: 'normal',
    recommendedAction: 'monitor',
    lastUpdatedAt: now,
  };
}

function applyPatch(
  ctx: SharedSessionContext,
  patch: SessionContextPatch
): SharedSessionContext {
  return {
    ...ctx,
    ...patch,
    consent: ctx.consent,
    lastUpdatedAt: new Date().toISOString(),
  };
}

export function updateContextFromTrigger(
  ctx: SharedSessionContext,
  scenario: TriggerScenario
): SharedSessionContext {
  const facialSignal = captureFacialSignal({
    consent: ctx.consent,
    expressionHint: scenario.facialSignal,
    simulated: true,
  });

  const voiceSession = createVoiceSessionSnapshot({
    consent: ctx.consent,
    voiceStateHint: scenario.voiceState,
    simulated: true,
  });

  let next = applyPatch(ctx, {
    source: scenario.source,
    triggerId: scenario.id,
    triggerType: scenario.triggerType,
    currentEmotion: scenario.emotionSignal,
    stressLevel: scenario.stressScore,
    heartRate: scenario.heartRate,
    voiceState: scenario.voiceState,
    facialSignal,
    engagement: scenario.engagement,
    voiceSession: voiceSession ?? undefined,
  });

  const risk = calculateSessionRisk(next);
  const crisis = shouldActivateCrisisMode(next);

  next = applyPatch(next, {
    riskLevel: risk.riskLevel,
    recommendedAction: crisis ? 'crisis_safety_flow' : scenario.recommendedAction,
    safetyLevel: crisis ? 'crisis' : risk.safetyLevel,
  });

  return next;
}

export function updateContextFromFacialSignal(
  ctx: SharedSessionContext,
  signal: FacialAwarenessSignal | null
): SharedSessionContext {
  if (!signal) return ctx;

  const next = applyPatch(ctx, {
    facialSignal: signal,
    engagement: signal.engagement,
    source: ctx.source === 'session_init' ? 'manual' : ctx.source,
  });

  const risk = calculateSessionRisk(next);
  const crisis = shouldActivateCrisisMode(next);

  return applyPatch(next, {
    riskLevel: risk.riskLevel,
    safetyLevel: crisis ? 'crisis' : risk.safetyLevel,
    recommendedAction: crisis ? 'crisis_safety_flow' : next.recommendedAction,
  });
}

export function updateContextFromVoiceSignal(
  ctx: SharedSessionContext,
  voiceSession: VoiceSessionState | null
): SharedSessionContext {
  if (!voiceSession) return ctx;

  const next = applyPatch(ctx, {
    voiceSession,
    voiceState: voiceSession.voiceState,
  });

  const risk = calculateSessionRisk(next);
  const crisis = shouldActivateCrisisMode(next);

  return applyPatch(next, {
    riskLevel: risk.riskLevel,
    safetyLevel: crisis ? 'crisis' : risk.safetyLevel,
    recommendedAction: crisis ? 'crisis_safety_flow' : next.recommendedAction,
  });
}

export function getSessionContextSummary(ctx: SharedSessionContext): string {
  return `Stress ${ctx.stressLevel} · HR ${ctx.heartRate} · Risk ${ctx.riskLevel}`;
}

export function buildSessionContextFromScenario(
  scenario: TriggerScenario
): SharedSessionContext {
  return updateContextFromTrigger(createInitialSessionContext(), scenario);
}
