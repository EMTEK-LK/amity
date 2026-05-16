export interface VoiceSynthesisRequest {
  text: string;
  voiceId?: string;
  voiceMode?: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  durationMs?: number;
  /** MVP — no real audio file */
  placeholder: boolean;
}

/**
 * ElevenLabs emotional voice layer (MVP placeholder).
 */
export async function synthesizeRecoveryVoice(
  request: VoiceSynthesisRequest
): Promise<VoiceSynthesisResult> {
  return {
    audioUrl: '',
    durationMs: Math.max(2000, request.text.length * 60),
    placeholder: true,
  };
}

export function mapVoiceMode(mode: string): string {
  const map: Record<string, string> = {
    grounding_slow: 'Calm, slow pacing',
    calm_support: 'Warm support',
    disabled: 'Off (crisis mode)',
  };
  return map[mode] ?? mode;
}
