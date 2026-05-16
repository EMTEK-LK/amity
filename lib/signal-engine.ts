import type { TriggerPayload } from '@/types/trigger';
import type { EmotionalDigitalTwin } from '@/types/employee';
import type { TriggerScenario } from '@/types/trigger';
import { scenarioToTwinState } from './demo-trigger-scenarios';

export interface SignalEngineInput {
  twin: EmotionalDigitalTwin;
  trigger: TriggerPayload;
}

export interface SignalEngineOutput {
  twin: EmotionalDigitalTwin;
  events: string[];
}

/**
 * Maps trigger payload to vitals update (MVP — uses scenario twin mapping when available).
 */
export function processSignal(input: SignalEngineInput): SignalEngineOutput {
  const events = [
    'Signal received',
    `Source: ${input.trigger.source}`,
    `Stress → ${input.trigger.stressScore}`,
    `Heart rate → ${input.trigger.heartRate}`,
  ];

  return {
    twin: {
      ...input.twin,
      stressScore: input.trigger.stressScore,
      heartRateBpm: input.trigger.heartRate,
      emotionState: mapEmotion(input.trigger.emotionSignal),
    },
    events,
  };
}

export function processTriggerScenario(scenario: TriggerScenario): SignalEngineOutput {
  const state = scenarioToTwinState(scenario);
  const stressLevel =
    state.riskLevel === 'crisis'
      ? 'critical'
      : state.riskLevel === 'high'
        ? 'high'
        : state.riskLevel === 'support_recommended'
          ? 'elevated'
          : 'low';

  return {
    twin: {
      employeeId: 'EMP-001',
      heartRateBpm: state.heartRate,
      stressScore: state.stressScore,
      stressLevel,
      emotionState: mapEmotion(scenario.emotionSignal),
      lastUpdatedAt: new Date().toISOString(),
    },
    events: scenario.timeline.map((t) => t.label),
  };
}

function mapEmotion(signal: string): import('@/types/emotion').EmotionState {
  if (signal.includes('crisis') || signal.includes('severe')) return 'overwhelmed';
  if (signal.includes('anxious') || signal.includes('frustrated')) return 'anxious';
  if (signal.includes('sad')) return 'frustrated';
  return 'anxious';
}
