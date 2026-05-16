export interface VoiceSynthesisRequest {
  text: string;
  voiceId?: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  durationMs?: number;
}

/**
 * ElevenLabs: natural emotional recovery voice.
 * Implementation planned in Phase 4.
 */
export async function synthesizeRecoveryVoice(
  _request: VoiceSynthesisRequest
): Promise<VoiceSynthesisResult> {
  throw new Error('elevenlabs not implemented — Phase 4');
}
