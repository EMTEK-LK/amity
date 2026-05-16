export type AmityVoiceMode =
  | 'calm_supportive'
  | 'grounding_slow'
  | 'warm_gentle'
  | 'firm_steady'
  | 'crisis_serious'
  | 'calm_support';

export interface VoiceSynthesisRequest {
  text: string;
  voiceId?: string;
  voiceMode?: string;
}

export interface VoiceSynthesisResult {
  audioUrl: string;
  durationMs?: number;
  placeholder: boolean;
}

export interface AmityVoiceInput {
  text: string;
  voiceMode: AmityVoiceMode | string;
}

export interface AmityVoiceResult {
  audioUrl: string | null;
  audioStatus: 'ready' | 'mock_ready' | 'unavailable' | 'error';
  placeholder: boolean;
  durationMs?: number;
}

let cachedVoiceId: string | null = null;

async function resolveElevenLabsVoiceId(apiKey: string): Promise<string | null> {
  const fromEnv = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (fromEnv) return fromEnv;
  if (cachedVoiceId) return cachedVoiceId;
  try {
    const res = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': apiKey },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { voices?: { voice_id: string; name?: string }[] };
    const preferred =
      data.voices?.find((v) => /rachel|sarah|calm|gentle/i.test(v.name ?? '')) ?? data.voices?.[0];
    cachedVoiceId = preferred?.voice_id ?? null;
    return cachedVoiceId;
  } catch {
    return null;
  }
}

const VOICE_SETTINGS: Record<string, { stability: number; similarity_boost: number; style?: number }> = {
  calm_supportive: { stability: 0.55, similarity_boost: 0.75 },
  calm_support: { stability: 0.55, similarity_boost: 0.75 },
  grounding_slow: { stability: 0.7, similarity_boost: 0.65, style: 0.2 },
  warm_gentle: { stability: 0.5, similarity_boost: 0.8 },
  firm_steady: { stability: 0.65, similarity_boost: 0.7 },
  crisis_serious: { stability: 0.8, similarity_boost: 0.6, style: 0.1 },
};

/**
 * Backend-only ElevenLabs TTS. Returns data URL audio or mock status.
 */
export async function generateAmityVoice(input: AmityVoiceInput): Promise<AmityVoiceResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = apiKey ? await resolveElevenLabsVoiceId(apiKey) : null;

  if (!apiKey || !voiceId || !input.text.trim()) {
    return {
      audioUrl: null,
      audioStatus: 'mock_ready',
      placeholder: true,
      durationMs: Math.max(2000, input.text.length * 60),
    };
  }

  const settings = VOICE_SETTINGS[input.voiceMode] ?? VOICE_SETTINGS.calm_supportive;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: input.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: settings,
      }),
    });

    if (!res.ok) {
      return {
        audioUrl: null,
        audioStatus: 'mock_ready',
        placeholder: true,
        durationMs: Math.max(2000, input.text.length * 60),
      };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString('base64');
    return {
      audioUrl: `data:audio/mpeg;base64,${base64}`,
      audioStatus: 'ready',
      placeholder: false,
      durationMs: Math.max(2000, input.text.length * 50),
    };
  } catch {
    return {
      audioUrl: null,
      audioStatus: 'error',
      placeholder: true,
      durationMs: Math.max(2000, input.text.length * 60),
    };
  }
}

/** Legacy placeholder */
export async function synthesizeRecoveryVoice(
  request: VoiceSynthesisRequest
): Promise<VoiceSynthesisResult> {
  const result = await generateAmityVoice({
    text: request.text,
    voiceMode: request.voiceMode ?? 'calm_supportive',
  });
  return {
    audioUrl: result.audioUrl ?? '',
    durationMs: result.durationMs,
    placeholder: result.placeholder,
  };
}

export function mapVoiceMode(mode: string): string {
  const map: Record<string, string> = {
    grounding_slow: 'Calm, slow pacing',
    calm_support: 'Warm support',
    calm_supportive: 'Warm support',
    warm_gentle: 'Warm, gentle',
    firm_steady: 'Firm, steady',
    crisis_serious: 'Crisis, serious',
    disabled: 'Off (crisis mode)',
  };
  return map[mode] ?? mode;
}
