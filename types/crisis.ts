import type { RecoveryOrchestrationPlan } from './session';

export type SafetyMode = 'normal' | 'crisis';

export interface SafetyClassification {
  mode: SafetyMode;
  flags: string[];
  confidence: number;
  matchedPhrases?: string[];
}

export interface CrisisEscalationState {
  active: boolean;
  detectedAt: string;
  userInImmediateDanger?: boolean | null;
  emergencyOptionsShown: boolean;
  humanHandoffSimulated: boolean;
  wellbeingOfficerNotified: boolean;
}

export interface CrisisEscalationPlan {
  active: boolean;
  sessionId: string;
  detectedAt: string;
  normalCoachingStopped: boolean;
  emergencyOptionsShown: boolean;
  humanHandoffSimulated: boolean;
  wellbeingOfficerNotified: boolean;
  message: string;
  nextRoute: string;
  orchestrationPlan: RecoveryOrchestrationPlan;
}

export interface CrisisDemoPhrase {
  id: string;
  text: string;
  category: 'suicide' | 'self_harm' | 'violence' | 'immediate_danger';
}
