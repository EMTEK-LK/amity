export type SafetyMode = 'normal' | 'crisis';

export interface SafetyClassification {
  mode: SafetyMode;
  flags: string[];
  confidence: number; // 0–1
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

export interface CrisisDemoPhrase {
  id: string;
  text: string;
  category: 'suicide' | 'self_harm' | 'violence' | 'immediate_danger';
}
