/**
 * Employee consent for optional sensing and escalation features.
 * All optional pipelines require explicit consent — never implied.
 */
export interface UserConsent {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  facialAwarenessEnabled: boolean;
  voiceAnalysisEnabled: boolean;
  crisisEscalationEnabled: boolean;
  /** Aggregated, privacy-safe company analytics only */
  analyticsConsent: boolean;
  lastUpdatedAt: string;
}

export type ConsentField = keyof Omit<UserConsent, 'lastUpdatedAt'>;

export interface ConsentGateResult {
  allowed: boolean;
  missing: ConsentField[];
  message: string;
}
