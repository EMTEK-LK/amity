import type { RecoveryHandoffContext } from '@/types/recovery-handoff';
import type { TriggerScenario } from '@/types/trigger';

const HANDOFF_KEY = 'amity:recoverySessionHandoff';

export function saveRecoveryHandoffContext(
  scenario: TriggerScenario,
  source = 'trigger-demo'
): RecoveryHandoffContext {
  const handoff: RecoveryHandoffContext = {
    scenarioId: scenario.id,
    scenarioLabel: scenario.label || scenario.name,
    source,
    context: scenario.context,
    emotionSignal: scenario.emotionSignal,
    stressScore: scenario.stressScore,
    heartRate: scenario.heartRate,
    riskLevel: scenario.riskLevel,
    recommendedAction: scenario.recommendedAction,
    isCrisis: scenario.isCrisis,
    createdAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoff));
    } catch {
      /* storage unavailable — handoff is best-effort */
    }
  }
  return handoff;
}

export function getRecoveryHandoffContext(): RecoveryHandoffContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RecoveryHandoffContext;
  } catch {
    return null;
  }
}

export function clearRecoveryHandoffContext(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(HANDOFF_KEY);
  } catch {
    /* ignore */
  }
}
