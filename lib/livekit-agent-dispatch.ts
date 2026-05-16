import { AgentDispatchClient } from 'livekit-server-sdk';

function getLiveKitHttpConfig() {
  const livekitUrl = process.env.LIVEKIT_URL?.trim();
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  if (!livekitUrl || !apiKey || !apiSecret) return null;
  const host = livekitUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  return { host, apiKey, apiSecret };
}

export const AMITY_RECOVERY_AGENT_NAME = 'amity-recovery-agent';

/** Dispatches the LiveKit Agents worker (Bey plugin) into a recovery room. */
export async function dispatchAmityRecoveryAgent(roomName: string): Promise<void> {
  const config = getLiveKitHttpConfig();
  if (!config) return;

  const client = new AgentDispatchClient(config.host, config.apiKey, config.apiSecret);

  try {
    const existing = await client.listDispatch(roomName);
    const already = existing.some((d) => d.agentName === AMITY_RECOVERY_AGENT_NAME);
    if (already) {
      console.info('[AmityRecovery] [dispatch] agent already in room', { roomName });
      return;
    }
  } catch {
    /* list may fail on empty room */
  }

  await client.createDispatch(roomName, AMITY_RECOVERY_AGENT_NAME, {
    metadata: JSON.stringify({ source: 'amity-recovery-room' }),
  });

  console.info('[AmityRecovery] [dispatch] agent dispatched', {
    roomName,
    agentName: AMITY_RECOVERY_AGENT_NAME,
  });
}
