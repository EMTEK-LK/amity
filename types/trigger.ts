export type TriggerCategory =
  | 'manager_conflict'
  | 'deadline_pressure'
  | 'public_criticism'
  | 'overload'
  | 'isolation'
  | 'customer_escalation'
  | 'custom';

export interface TriggerDefinition {
  id: string;
  category: TriggerCategory;
  label: string;
  description: string;
  /** Demo narrative shown in timeline */
  narrative: string;
}

export interface TriggerPayload {
  employeeId: string;
  triggerId: string;
  category: TriggerCategory;
  simulatedAt: string; // ISO 8601
  source: 'trigger_simulation_portal';
  metadata?: Record<string, unknown>;
}

export interface TriggerSimulationResult {
  payload: TriggerPayload;
  previousStressScore: number;
  newStressScore: number;
  riskLevel: import('./emotion').RiskLevel;
  recommendedAction: 'monitor' | 'recovery_call' | 'crisis_check';
}
