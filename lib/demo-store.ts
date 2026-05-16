import type { EmployeeSnapshot } from '@/types/employee';
import type { RecoverySession } from '@/types/session';
import type { TriggerPayload } from '@/types/trigger';
import type { CrisisEscalationState } from '@/types/crisis';
import type { SharedSessionContext } from '@/types/session-context';
import { createInitialSessionContext } from './session-context';
import { DEMO_EMPLOYEE } from './demo-identities';
import { defaultStableState } from './demo-trigger-scenarios';

export interface DemoStoreState {
  employeeSnapshot: EmployeeSnapshot;
  sessionContext: SharedSessionContext;
  triggerHistory: TriggerPayload[];
  activeSession: RecoverySession | null;
  sessionHistory: RecoverySession[];
  crisis: CrisisEscalationState;
}

function buildDemoSnapshot(): EmployeeSnapshot {
  return {
    employee: {
      id: DEMO_EMPLOYEE.id,
      name: DEMO_EMPLOYEE.name,
      role: DEMO_EMPLOYEE.role,
      department: DEMO_EMPLOYEE.department,
    },
    twin: {
      employeeId: DEMO_EMPLOYEE.id,
      heartRateBpm: defaultStableState.heartRate,
      stressScore: defaultStableState.stressScore,
      stressLevel: 'low',
      emotionState: 'calm',
      lastUpdatedAt: new Date().toISOString(),
    },
  };
}

let demoState: DemoStoreState | null = null;

export function getDemoStore(): DemoStoreState {
  if (!demoState) {
    demoState = {
      employeeSnapshot: buildDemoSnapshot(),
      sessionContext: createInitialSessionContext(),
      triggerHistory: [],
      activeSession: null,
      sessionHistory: [],
      crisis: {
        active: false,
        detectedAt: '',
        emergencyOptionsShown: false,
        humanHandoffSimulated: false,
        wellbeingOfficerNotified: false,
      },
    };
  }
  return demoState;
}

export function resetDemoStore(): DemoStoreState {
  demoState = {
    employeeSnapshot: buildDemoSnapshot(),
    sessionContext: createInitialSessionContext(),
    triggerHistory: [],
    activeSession: null,
    sessionHistory: [],
    crisis: {
      active: false,
      detectedAt: '',
      emergencyOptionsShown: false,
      humanHandoffSimulated: false,
      wellbeingOfficerNotified: false,
    },
  };
  return demoState;
}

export function updateDemoSessionContext(ctx: SharedSessionContext): void {
  getDemoStore().sessionContext = ctx;
}
