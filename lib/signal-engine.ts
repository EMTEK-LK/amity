import type { TriggerPayload } from '../types/trigger';
import type { EmotionalDigitalTwin } from '../types/employee';

export interface SignalEngineInput {
  twin: EmotionalDigitalTwin;
  trigger: TriggerPayload;
}

export interface SignalEngineOutput {
  twin: EmotionalDigitalTwin;
  events: string[];
}

/**
 * Maps simulated triggers to vitals / emotion updates.
 * Implementation planned in Phase 2.
 */
export function processSignal(_input: SignalEngineInput): SignalEngineOutput {
  throw new Error('signal-engine not implemented — Phase 2');
}
