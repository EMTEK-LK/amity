import type { UserConsent } from '@/types/consent';
import type { VoiceSessionState, VoiceState } from '@/types/voice';
import { checkConsentGate } from './consent-manager';

export interface VoiceSessionInput {
  consent: UserConsent;
  voiceStateHint?: VoiceState;
  transcriptSnippet?: string;
  simulated?: boolean;
}

/**
 * MVP: mock voice session snapshot.
 * Future: Gemini Live streaming + WebRTC orchestration.
 */
export function createVoiceSessionSnapshot(
  input: VoiceSessionInput
): VoiceSessionState | null {
  const gate = checkConsentGate(input.consent, ['microphoneEnabled', 'voiceAnalysisEnabled']);
  if (!gate.allowed) return null;

  const voiceState = input.voiceStateHint ?? 'unknown';
  const now = new Date().toISOString();

  return {
    transcript: input.transcriptSnippet ?? '',
    voiceState,
    tone: voiceState === 'distressed' ? 'urgent' : voiceState === 'calm' ? 'steady' : 'tense',
    confidence: 0.7,
    streamingStatus: 'idle',
    lastUtteranceAt: input.transcriptSnippet ? now : null,
    simulated: input.simulated ?? true,
  };
}

export function updateVoiceFromTranscript(
  current: VoiceSessionState,
  transcript: string,
  voiceState?: VoiceState
): VoiceSessionState {
  return {
    ...current,
    transcript,
    voiceState: voiceState ?? current.voiceState,
    lastUtteranceAt: new Date().toISOString(),
    streamingStatus: 'streaming',
  };
}
