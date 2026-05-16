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
  /** Privacy-safe line for employee UI only */
  headline: string;
  completedAt: string;
}

export interface SessionOrchestratorInput {
  employeeId: string;
  triggerCategory: TriggerCategory;
  riskScore: number;
}

export interface SessionOrchestratorResult {
  session: RecoverySession;
  roomConfigPlaceholder: Record<string, unknown>;
}
