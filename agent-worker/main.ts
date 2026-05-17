/**
 * Amity recovery LiveKit agent + Beyond Presence lip-sync.
 * Run: npm run agent:dev (with npm run dev)
 */
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';
import {
  type JobContext,
  WorkerOptions,
  cli,
  defineAgent,
  voice,
} from '@livekit/agents';
import * as bey from '@livekit/agents-plugin-bey';
import * as elevenlabs from '@livekit/agents-plugin-elevenlabs';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(rootDir, '.env.local') });
config({ path: resolve(rootDir, '.env') });

const AGENT_NAME = 'amity-recovery-agent';
const SPEAK_TOPIC = 'amity/speak';
const DEFAULT_VOICE_ID = 'DODLEQrClDo8wCz460ld';

const avatarId =
  process.env.BEYOND_PRESENCE_AVATAR_ID?.trim() ||
  process.env.BEY_AVATAR_ID?.trim() ||
  undefined;

const elevenApiKey = process.env.ELEVENLABS_API_KEY?.trim();
const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID;
const livekitUrl = process.env.LIVEKIT_URL?.trim();
const livekitApiKey = process.env.LIVEKIT_API_KEY?.trim();
const livekitApiSecret = process.env.LIVEKIT_API_SECRET?.trim();
const beyApiKey =
  process.env.BEYOND_PRESENCE_API_KEY?.trim() || process.env.BEY_API_KEY?.trim();

let speakQueue: Promise<void> = Promise.resolve();
let lastHandledRequestId = -1;

function parseSpeakPayload(raw: string): { text: string; requestId?: number } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const msg = JSON.parse(trimmed) as { type?: string; text?: string; requestId?: number };
    if (msg.type === 'amity/speak' && msg.text?.trim()) {
      return { text: msg.text.trim(), requestId: msg.requestId };
    }
  } catch {
    /* plain text fallback */
  }

  return { text: trimmed };
}

function enqueueSpeak(
  session: voice.AgentSession,
  text: string,
  requestId?: number
): void {
  speakQueue = speakQueue
    .then(async () => {
      console.info('[AmityRecovery] [agent] speak start', { requestId, chars: text.length });
      const handle = session.say(text, {
        allowInterruptions: false,
        addToChatCtx: false,
      });
      await handle.waitForPlayout();
      console.info('[AmityRecovery] [agent] speak done', { requestId });
    })
    .catch((err) => {
      console.error('[AmityRecovery] [agent] speak failed', { requestId, err });
    });
}

function handleSpeakLine(
  session: voice.AgentSession,
  raw: string,
  from?: string
): void {
  const parsed = parseSpeakPayload(raw);
  if (!parsed) return;

  if (parsed.requestId !== undefined && parsed.requestId === lastHandledRequestId) {
    console.info('[AmityRecovery] [agent] speak skipped — duplicate requestId', {
      requestId: parsed.requestId,
    });
    return;
  }
  if (parsed.requestId !== undefined) lastHandledRequestId = parsed.requestId;

  console.info('[AmityRecovery] [agent] speak received', {
    from,
    requestId: parsed.requestId,
    chars: parsed.text.length,
  });
  enqueueSpeak(session, parsed.text, parsed.requestId);
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.info(`[AmityRecovery] [agent] joining room ${ctx.room.name}`);

    await ctx.connect();

    if (!elevenApiKey) console.error('[AmityRecovery] [agent] ELEVENLABS_API_KEY missing');
    if (!beyApiKey) console.error('[AmityRecovery] [agent] BEYOND_PRESENCE_API_KEY missing');
    if (!avatarId) {
      console.info(
        '[AmityRecovery] [agent] no BEYOND_PRESENCE_AVATAR_ID — using Bey plugin stock avatar default'
      );
    }

    const tts = new elevenlabs.TTS({
      apiKey: elevenApiKey,
      voiceId: elevenVoiceId,
    });

    const voiceAgentSession = new voice.AgentSession({
      tts,
      userAwayTimeout: null,
      turnHandling: {
        interruption: { enabled: false },
      },
    });

    const voiceAgent = new voice.Agent({
      instructions:
        'Speak only the exact recovery coaching lines sent on the data channel.',
    });

    const beyAvatarSession = new bey.AvatarSession({
      avatarId,
      avatarParticipantIdentity: 'bey-avatar-agent',
      apiKey: beyApiKey,
    });

    await beyAvatarSession.start(voiceAgentSession, ctx.room, {
      livekitUrl,
      livekitApiKey,
      livekitApiSecret,
    });

    await voiceAgentSession.start({
      agent: voiceAgent,
      room: ctx.room,
      inputOptions: {
        audioEnabled: false,
        textEnabled: false,
        // Keep TTS alive across brief browser reconnects / React remounts.
        closeOnDisconnect: false,
      },
      outputOptions: {
        audioEnabled: false,
        transcriptionEnabled: false,
      },
    });

    console.info('[AmityRecovery] [agent] ready', { voiceId: elevenVoiceId });

    ctx.room.on(
      'dataReceived',
      (
        payload: Uint8Array,
        participant?: { identity?: string },
        _kind?: unknown,
        topic?: string
      ) => {
        if (topic && topic !== SPEAK_TOPIC) return;
        handleSpeakLine(
          voiceAgentSession,
          new TextDecoder().decode(payload),
          participant?.identity
        );
      }
    );
  },
});

process.argv = [process.argv[0]!, process.argv[1]!, 'dev'];
cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
    agentName: AGENT_NAME,
  })
);
