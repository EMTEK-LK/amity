import type { UserConsent } from './consent';
import type { FacialAwarenessSignal, FacialSignalQuality } from './facial-awareness';
import type { RecommendedAction, TriggerRiskLevel, TriggerSource } from './trigger';
import type { VoiceSessionState, VoiceState } from './voice';

export type SessionRole = 'employee' | 'admin';

export type SafetyLevel = 'normal' | 'elevated' | 'crisis';

export type EngagementLevel = 'high' | 'medium' | 'low' | 'unknown';

export type SessionPipelineSource =
  | 'trigger'
  | 'facial'
  | 'voice'
  | 'wearable'
  | 'orchestrator';

/**
 * Unified in-session state merged from parallel signal pipelines.
 * Employee-private during active recovery — admin sees aggregates only.
 */
export interface SharedSessionContext {
  sessionId: string;
  employeeId: string;
  role: SessionRole;
  source: TriggerSource | 'session_init' | SessionPipelineSource;
  consent: UserConsent;
  currentEmotion: string;
  stressLevel: number;
  heartRate: number;
  voiceState: VoiceState;
  facialSignal: FacialAwarenessSignal | null;
  /** Latest expression confidence 0–1 (indicative, from facial pipeline) */
  facialConfidence: number | null;
  facialSignalQuality: FacialSignalQuality | null;
  /** ISO timestamp of last facial signal update */
  facialUpdatedAt: string | null;
  engagement: EngagementLevel;
  riskLevel: TriggerRiskLevel;
  safetyLevel: SafetyLevel;
  recommendedAction: RecommendedAction;
  lastUpdatedAt: string;
  /** Active voice pipeline snapshot (if consented) */
  voiceSession?: VoiceSessionState;
  triggerId?: string;
  triggerType?: string;
}

export interface SessionContextPatch {
  currentEmotion?: string;
  stressLevel?: number;
  heartRate?: number;
  voiceState?: VoiceState;
  facialSignal?: FacialAwarenessSignal | null;
  facialConfidence?: number | null;
  facialSignalQuality?: FacialSignalQuality | null;
  facialUpdatedAt?: string | null;
  engagement?: EngagementLevel;
  riskLevel?: TriggerRiskLevel;
  safetyLevel?: SafetyLevel;
  recommendedAction?: RecommendedAction;
  voiceSession?: VoiceSessionState;
  triggerId?: string;
  triggerType?: string;
  source?: TriggerSource | 'session_init' | SessionPipelineSource;
}
