import type { TriggerCategory } from './trigger';
import type { EmotionalDelta, EmotionState } from './emotion';

export type SessionStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'crisis_escalated';

export interface RecoverySession {
  id: string;
  employeeId: string;
  triggerCategory: TriggerCategory;
  status: SessionStatus;
  startedAt?: string;
  endedAt?: string;
  beyondPresenceRoomId?: string;
  /** Employee-private; never sent to analytics API */
  agentSummaryPrivate?: string;
}

export interface RecoverySummary {
  sessionId: string;
  employeeId: string;
  triggerCategory: TriggerCategory;
  durationSeconds: number;
  delta: EmotionalDelta;
  headline: string;
  completedAt: string;
}

export interface OrchestrationLayerStatus {
  status: 'placeholder' | 'ready' | 'blocked' | 'streaming' | 'handoff';
  contextSummary?: Record<string, unknown>;
  voiceMode?: string;
  avatarMode?: string;
}

/** Output from recovery orchestrator — wires Gemini, ElevenLabs, BP layers */
export interface RecoveryOrchestrationPlan {
  sessionId: string;
  employeeId: string;
  mode: string;
  geminiContextReady: boolean;
  elevenLabsVoiceMode: string;
  bpAvatarMode: string;
  nextRoute: string;
  layers: {
    gemini: OrchestrationLayerStatus;
    elevenLabs: OrchestrationLayerStatus;
    beyondPresence: OrchestrationLayerStatus;
  };
  preparedAt: string;
}

export interface SessionOrchestratorInput {
  employeeId: string;
  triggerCategory: TriggerCategory;
  riskScore: number;
}

export interface SessionOrchestratorResult {
  session: RecoverySession;
  plan: RecoveryOrchestrationPlan;
}
