import type { RecommendedAction, TriggerRiskLevel } from './trigger';

/**
 * Lightweight context handed from the Trigger Demo to the Recovery Room
 * when an employee answers a simulated incoming recovery call.
 * Stored locally only (no database, no transcripts).
 */
export interface RecoveryHandoffContext {
  scenarioId: string;
  scenarioLabel: string;
  /** Where the call originated, e.g. "trigger-demo" */
  source: string;
  context: string;
  emotionSignal: string;
  stressScore: number;
  heartRate: number;
  riskLevel: TriggerRiskLevel;
  recommendedAction: RecommendedAction;
  isCrisis: boolean;
  createdAt: string;
}
