import type { TriggerCategory } from './trigger';

/**
 * Privacy-safe aggregates for company admin — no transcripts or PII.
 */
export interface PrivacySafeAnalyticsSnapshot {
  periodLabel: string;
  totalRecoverySessions: number;
  averageStressReduction: number;
  triggerCategoryBreakdown: Record<TriggerCategory, number>;
  departmentTrends: { department: string; avgStress: number; sessionCount: number }[];
  highLevelSignals: string[];
  generatedAt: string;
}

export interface AnalyticsConsentScope {
  /** Only aggregated metrics — never individual session content */
  allowAggregates: boolean;
  allowDepartmentTrends: boolean;
  lastUpdatedAt: string;
}
