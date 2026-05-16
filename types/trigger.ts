import type { RiskLevel } from './emotion';
import type { EngagementLevel } from './session-context';
import type { FacialExpression } from './facial-awareness';
import type { VoiceState } from './voice';

export type TwinStatusType =
  | 'stable'
  | 'watch'
  | 'support_recommended'
  | 'recovery_needed'
  | 'in_recovery'
  | 'crisis';

export type TriggerCategory =
  | 'manager_conflict'
  | 'customer_escalation'
  | 'workload_spike'
  | 'panic_before_presentation'
  | 'late_night_burnout'
  | 'sales_rejection'
  | 'manual_help_request'
  | 'wake_word'
  | 'future_video_signal'
  | 'critical_self_harm_risk'
  | 'deadline_pressure'
  | 'public_criticism'
  | 'overload'
  | 'isolation'
  | 'custom';

export type TriggerSource =
  | 'apple_watch'
  | 'whoop'
  | 'microsoft_teams'
  | 'slack'
  | 'whatsapp'
  | 'calendar'
  | 'call_center'
  | 'manual'
  | 'wake_word'
  | 'bp_video_analysis'
  | 'safety_classifier'
  | 'work_pattern'
  | 'crm';

export type TriggerSignalType = 'wearable' | 'workplace' | 'manual' | 'video' | 'crisis';

export type TriggerRiskLevel = 'low' | 'support_recommended' | 'high' | 'crisis';

export type RecommendedAction =
  | 'monitor'
  | 'start_recovery_session'
  | 'crisis_safety_flow';

export interface TriggerTimelineItem {
  id: string;
  label: string;
  detail?: string;
  timestamp?: string;
}

export interface TriggerScenario {
  id: string;
  /** Display label */
  label: string;
  name: string;
  category: TriggerCategory;
  source: TriggerSource;
  sourceLabel: string;
  /** Primary channel category for chips */
  sourceType: TriggerSignalType;
  context: string;
  emotion: string;
  emotionSignal: string;
  stressScore: number;
  heartRate: number;
  voiceState: VoiceState;
  facialSignal: FacialExpression;
  engagement: EngagementLevel;
  riskScore: number;
  riskLevel: TriggerRiskLevel;
  signalTypes: TriggerSignalType[];
  triggerType: string;
  recommendedAction: RecommendedAction;
  statusType: TwinStatusType;
  recoveryMode: string;
  isCrisis: boolean;
  riskReason: string;
  riskAction: string;
  crisisNotice?: string;
  timeline: TriggerTimelineItem[];
  iconKey: TriggerIconKey;
  /** Pre-built demo payload shape */
  payload: Omit<TriggerPayload, 'simulatedAt'>;
}

export type TriggerIconKey =
  | 'users'
  | 'phone'
  | 'calendar'
  | 'presentation'
  | 'moon'
  | 'trending_down'
  | 'hand'
  | 'mic'
  | 'video'
  | 'shield_alert';

export interface TriggerPayload {
  employeeId: string;
  source: TriggerSource;
  triggerType: string;
  emotionSignal: string;
  stressScore: number;
  heartRate: number;
  riskLevel: TriggerRiskLevel;
  recommendedAction: RecommendedAction;
  simulatedAt: string;
  triggerId?: string;
  category?: TriggerCategory;
  metadata?: Record<string, unknown>;
}

export interface EmotionalTwinState {
  stressScore: number;
  heartRate: number;
  emotion: string;
  riskScore: number;
  riskLevel: TriggerRiskLevel;
  statusType: TwinStatusType;
  recoveryMode: string;
}

export interface TriggerDefinition {
  id: string;
  category: TriggerCategory;
  label: string;
  description: string;
  narrative: string;
}

export interface TriggerSimulationResult {
  payload: TriggerPayload;
  previousStressScore: number;
  newStressScore: number;
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
}
