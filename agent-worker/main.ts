/**
 * Amity recovery LiveKit agent + Beyond Presence lip-sync.
 *
 * Run alongside Next.js: npm run agent:dev
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

const avatarId =
  process.env.BEYOND_PRESENCE_AVATAR_ID?.trim() ||
  process.env.BEY_AVATAR_ID?.trim() ||
  undefined;

const elevenApiKey = process.env.ELEVENLABS_API_KEY?.trim();
const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim();
const livekitUrl = process.env.LIVEKIT_URL?.trim();
const livekitApiKey = process.env.LIVEKIT_API_KEY?.trim();
const livekitApiSecret = process.env.LIVEKIT_API_SECRET?.trim();
const beyApiKey =
  process.env.BEYOND_PRESENCE_API_KEY?.trim() || process.env.BEY_API_KEY?.trim();

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.info(`[AmityRecovery] [agent] joining room ${ctx.room.name}`);

    await ctx.connect();

    if (!elevenApiKey) console.error('[AmityRecovery] [agent] ELEVENLABS_API_KEY missing');
    if (!beyApiKey) console.error('[AmityRecovery] [agent] BEYOND_PRESENCE_API_KEY missing');

    const tts = new elevenlabs.TTS({
      apiKey: elevenApiKey,
      ...(elevenVoiceId ? { voiceId: elevenVoiceId } : {}),
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
        'Speak only the exact recovery coaching lines sent on the data channel. Do not improvise.',
    });

    const beyAvatarSession = new bey.AvatarSession({
      avatarId,
      avatarParticipantIdentity: 'bey-avatar-agent',
      apiKey: beyApiKey,
    });

    // Bey MUST wire DataStreamAudioOutput before AgentSession.start (see plugin warning).
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
      },
      outputOptions: {
        audioEnabled: false,
        transcriptionEnabled: false,
      },
    });

    console.info('[AmityRecovery] [agent] bey + voice session ready (TTS → avatar)');

    ctx.room.on(
      'dataReceived',
      (
        payload: Uint8Array,
        participant?: { identity?: string },
        _kind?: unknown,
        topic?: string
      ) => {
        if (topic && topic !== SPEAK_TOPIC) return;

        try {
          const msg = JSON.parse(new TextDecoder().decode(payload)) as {
            type?: string;
            text?: string;
          };
          if (msg.type !== 'amity/speak' || !msg.text?.trim()) return;

          const text = msg.text.trim();
          console.info('[AmityRecovery] [agent] speak', {
            from: participant?.identity,
            chars: text.length,
          });

          void voiceAgentSession.interrupt({ force: true });
          const handle = voiceAgentSession.say(text, {
            allowInterruptions: false,
            addToChatCtx: false,
          });
          void handle.waitForPlayout().then(() => {
            console.info('[AmityRecovery] [agent] speak done');
          }).catch((err: unknown) => {
            console.error('[AmityRecovery] [agent] speak failed', err);
          });
        } catch (err) {
          console.error('[AmityRecovery] [agent] bad data packet', err);
        }
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
