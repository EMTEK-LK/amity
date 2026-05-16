import type { EmployeeSnapshot } from '../types/employee';
import type { RecoverySession } from '../types/session';
import type { TriggerPayload } from '../types/trigger';
import type { CrisisEscalationState } from '../types/crisis';

/**
 * In-memory demo state for hackathon (Sarah + sessions).
 * Implementation planned in Phase 2.
 */
export interface DemoStoreState {
  employeeSnapshot: EmployeeSnapshot;
  triggerHistory: TriggerPayload[];
  activeSession: RecoverySession | null;
  sessionHistory: RecoverySession[];
  crisis: CrisisEscalationState;
}

export function getDemoStore(): DemoStoreState {
  throw new Error('demo-store not implemented — Phase 2');
}

export function resetDemoStore(): DemoStoreState {
  throw new Error('demo-store not implemented — Phase 2');
}
