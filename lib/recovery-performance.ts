import { isLiveKitConfigured } from './livekit-room';

/** Skip Next.js ElevenLabs TTS when LiveKit agent worker will speak (major latency win). */
export function shouldSkipServerTts(): boolean {
  const flag = process.env.AMITY_SKIP_SERVER_TTS?.trim().toLowerCase();
  if (flag === 'true' || flag === '1' || flag === 'yes') return true;
  if (flag === 'false' || flag === '0' || flag === 'no') return false;
  return isLiveKitConfigured();
}

export function llmMaxOutputTokens(): number {
  const raw = process.env.AMITY_LLM_MAX_TOKENS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 220;
  return Number.isFinite(n) && n > 80 && n <= 512 ? n : 220;
}
