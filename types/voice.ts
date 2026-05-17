export type VoiceState =
  | 'calm'
  | 'shaky'
  | 'fast'
  | 'low_energy'
  | 'distressed'
  | 'unknown';

export type VoiceTone =
  | 'steady'
  | 'tense'
  | 'flat'
  | 'urgent'
  | 'unknown';

export type VoiceStreamingStatus =
  | 'idle'
  | 'connecting'
  | 'streaming'
  | 'paused'
  | 'ended';

/**
 * Voice conversation pipeline state.
 * Gemini Live streaming planned for production; MVP uses placeholders.
 */
export interface VoiceSessionState {
  transcript: string;
  voiceState: VoiceState;
  tone: VoiceTone;
  confidence: number;
  streamingStatus: VoiceStreamingStatus;
  lastUtteranceAt: string | null;
  /** Demo flag */
  simulated?: boolean;
}
