import type { AgentFacialSignalQuality, AgentSessionContextPayload } from '@/types/agent';
import type { FacialAwarenessSignal, FacialAwarenessStatus } from '@/types/facial-awareness';
import type { SharedSessionContext } from '@/types/session-context';

export interface BuildAgentSessionOptions {
  /** Speech-to-text transcript (text only — never raw audio) */
  transcript?: string | null;
  facialEnabled?: boolean;
  facialStatus?: FacialAwarenessStatus;
  facialSignal?: FacialAwarenessSignal | null;
  selectedRecoveryMode?: string | null;
}

function resolveFacialForAgent(
  ctx: SharedSessionContext,
  options: BuildAgentSessionOptions
): Pick<
  AgentSessionContextPayload,
  'facialExpression' | 'facialConfidence' | 'engagement' | 'facialSignalQuality'
> {
  if (!options.facialEnabled) {
    return {
      facialExpression: 'unknown',
      facialConfidence: null,
      engagement: ctx.engagement,
      facialSignalQuality: 'camera_off',
    };
  }

  if (options.facialStatus === 'no_face' || options.facialStatus === 'waiting_for_camera') {
    return {
      facialExpression: 'unknown',
      facialConfidence: 0,
      engagement: ctx.engagement,
      facialSignalQuality: 'no_face',
    };
  }

  const signal = options.facialSignal ?? ctx.facialSignal;
  if (!signal || signal.expression === 'unknown') {
    return {
      facialExpression: 'unknown',
      facialConfidence: ctx.facialConfidence ?? 0,
      engagement: ctx.engagement,
      facialSignalQuality: 'no_face',
    };
  }

  let quality: AgentFacialSignalQuality = 'usable';
  if (signal.signalQuality === 'poor') quality = 'low_quality';
  if (signal.signalQuality === 'unavailable') quality = 'camera_off';

  return {
    facialExpression: signal.expression,
    facialConfidence: ctx.facialConfidence ?? signal.confidence,
    engagement: signal.engagement ?? ctx.engagement,
    facialSignalQuality: quality,
  };
}

/**
 * Builds summarized session context for POST /api/agent/respond.
 * Only summarized facial signals are sent. Raw webcam video/images are never sent.
 */
export function buildAgentSessionContext(
  ctx: SharedSessionContext,
  options: BuildAgentSessionOptions = {}
): AgentSessionContextPayload {
  const facial = resolveFacialForAgent(ctx, options);

  return {
    stressLevel: ctx.stressLevel,
    heartRate: ctx.heartRate,
    voiceState: ctx.voiceState,
    transcript: options.transcript ?? ctx.voiceSession?.transcript ?? null,
    ...facial,
    riskLevel: ctx.riskLevel,
    safetyLevel: ctx.safetyLevel,
    triggerType: ctx.triggerType ?? null,
    currentEmotion: ctx.currentEmotion,
    selectedRecoveryMode: options.selectedRecoveryMode ?? null,
    employeeRole: ctx.role,
  };
}

export interface GeminiContextPreviewExtras {
  source?: 'voice_transcript' | 'typed_input';
  cameraStatus?: string;
  micStatus?: string;
}

/** Preview object for Gemini debug panel (matches server payload shape) */
export function buildGeminiContextPreview(
  userMessage: string,
  sessionContext: AgentSessionContextPayload,
  extras: GeminiContextPreviewExtras = {}
): Record<string, unknown> {
  return {
    source: extras.source ?? 'typed_input',
    userMessage,
    transcript: sessionContext.transcript ?? null,
    facialExpression: sessionContext.facialExpression,
    facialConfidence: sessionContext.facialConfidence,
    engagement: sessionContext.engagement,
    facialSignalQuality: sessionContext.facialSignalQuality,
    cameraStatus: extras.cameraStatus ?? null,
    micStatus: extras.micStatus ?? null,
    stressLevel: sessionContext.stressLevel,
    heartRate: sessionContext.heartRate,
    voiceState: sessionContext.voiceState,
    riskLevel: sessionContext.riskLevel,
    safetyLevel: sessionContext.safetyLevel,
    triggerType: sessionContext.triggerType,
    selectedRecoveryMode: sessionContext.selectedRecoveryMode,
    employeeRole: sessionContext.employeeRole,
  };
}
