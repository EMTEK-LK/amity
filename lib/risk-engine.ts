import type { SharedSessionContext, SafetyLevel } from '@/types/session-context';
import type { TriggerRiskLevel } from '@/types/trigger';
import type { RiskAssessment } from '@/types/emotion';
import type { EmotionalDigitalTwin } from '@/types/employee';
import type { TriggerPayload } from '@/types/trigger';

export interface SessionRiskResult {
  riskScore: number;
  riskLevel: TriggerRiskLevel;
  safetyLevel: SafetyLevel;
  factors: string[];
  reasoning: string;
  recommendation: import('@/types/trigger').RecommendedAction;
}

export interface RiskEngineInput {
  twin: EmotionalDigitalTwin;
  trigger?: TriggerPayload;
}

/**
 * Rule-based session risk from shared context (MVP).
 */
export function calculateSessionRisk(ctx: SharedSessionContext): SessionRiskResult {
  let score = Math.min(100, Math.round(ctx.stressLevel * 0.6 + (ctx.heartRate - 60) * 0.5));

  if (ctx.voiceState === 'distressed' || ctx.voiceState === 'shaky') score += 10;
  if (ctx.facialSignal?.expression === 'sad' || ctx.facialSignal?.expression === 'stressed') {
    score += 8;
  }
  if (ctx.engagement === 'low') score += 5;
  if (ctx.triggerType === 'critical_self_harm_risk' || ctx.triggerType === 'future_video_signal') {
    score = 100;
  }

  score = Math.min(100, score);

  const riskLevel = scoreToRiskLevel(score, ctx.safetyLevel === 'crisis');
  const safetyLevel: SafetyLevel =
    ctx.safetyLevel === 'crisis' || riskLevel === 'crisis' ? 'crisis' : score >= 70 ? 'elevated' : 'normal';

  const factors: string[] = [];
  if (ctx.stressLevel >= 70) factors.push('Elevated stress');
  if (ctx.heartRate >= 100) factors.push('Elevated heart rate');
  if (ctx.voiceState !== 'calm' && ctx.voiceState !== 'unknown') factors.push(`Voice: ${ctx.voiceState}`);
  if (ctx.facialSignal) factors.push(`Visible cue: ${ctx.facialSignal.expression}`);

  return {
    riskScore: score,
    riskLevel,
    safetyLevel,
    factors,
    reasoning: factors.length ? factors.join(' · ') : 'Within stable range',
    recommendation:
      riskLevel === 'crisis'
        ? 'crisis_safety_flow'
        : riskLevel === 'high'
          ? 'start_recovery_session'
          : riskLevel === 'support_recommended'
            ? 'start_recovery_session'
            : 'monitor',
  };
}

function scoreToRiskLevel(score: number, forceCrisis: boolean): TriggerRiskLevel {
  if (forceCrisis || score >= 95) return 'crisis';
  if (score >= 75) return 'high';
  if (score >= 50) return 'support_recommended';
  return 'low';
}

export function shouldActivateCrisisMode(ctx: SharedSessionContext): boolean {
  if (ctx.safetyLevel === 'crisis') return true;
  if (ctx.riskLevel === 'crisis') return true;
  if (ctx.recommendedAction === 'crisis_safety_flow') return true;
  if (
    ctx.triggerType === 'critical_self_harm_risk' ||
    ctx.triggerType === 'future_video_signal'
  ) {
    return true;
  }
  return ctx.stressLevel >= 95 && ctx.voiceState === 'distressed';
}

/** Legacy twin + trigger assessment — safe demo return */
export function assessRisk(input: RiskEngineInput): RiskAssessment {
  const stress = input.trigger?.stressScore ?? input.twin.stressScore;
  const score = Math.min(100, Math.round(stress * 0.9 + 10));

  return {
    level: score >= 75 ? 'high' : score >= 45 ? 'medium' : 'low',
    score,
    factors: input.trigger ? ['Simulated trigger signal'] : ['Baseline'],
    recommendation:
      score >= 75 ? 'recovery_call' : score >= 45 ? 'monitor' : 'none',
    reasoning: 'Rule-based MVP risk assessment',
  };
}
