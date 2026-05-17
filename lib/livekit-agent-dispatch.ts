import { ParticipantInfo_Kind } from '@livekit/protocol';
import { AgentDispatchClient, RoomServiceClient } from 'livekit-server-sdk';

function getLiveKitHttpConfig() {
  const livekitUrl = process.env.LIVEKIT_URL?.trim();
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  if (!livekitUrl || !apiKey || !apiSecret) return null;
  const host = livekitUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  return { host, apiKey, apiSecret };
}

export const AMITY_RECOVERY_AGENT_NAME = 'amity-recovery-agent';
const BEY_IDENTITY = 'bey-avatar-agent';

function isLiveAgentParticipant(identity: string, kind: ParticipantInfo_Kind): boolean {
  if (kind === ParticipantInfo_Kind.AGENT) return true;
  return (
    identity.startsWith('agent-') ||
    identity === AMITY_RECOVERY_AGENT_NAME ||
    identity.includes('amity-recovery')
  );
}

/** True when the LiveKit Agents worker is actually connected (not just stale Bey video). */
export async function isAmityRecoveryAgentLive(roomName: string): Promise<boolean> {
  const config = getLiveKitHttpConfig();
  if (!config) return false;

  const rooms = new RoomServiceClient(config.host, config.apiKey, config.apiSecret);
  try {
    const participants = await rooms.listParticipants(roomName);
    return participants.some((p) => isLiveAgentParticipant(p.identity, p.kind));
  } catch {
    return false;
  }
}

async function clearStaleDispatches(roomName: string): Promise<void> {
  const config = getLiveKitHttpConfig();
  if (!config) return;

  const client = new AgentDispatchClient(config.host, config.apiKey, config.apiSecret);
  try {
    const existing = await client.listDispatch(roomName);
    for (const d of existing) {
      if (d.agentName === AMITY_RECOVERY_AGENT_NAME && d.id) {
        await client.deleteDispatch(d.id, roomName);
        console.info('[AmityRecovery] [dispatch] removed stale dispatch', {
          roomName,
          dispatchId: d.id,
        });
      }
    }
  } catch (err) {
    console.warn('[AmityRecovery] [dispatch] clear stale failed', {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

async function removeStaleBeyParticipant(roomName: string, agentLive: boolean): Promise<void> {
  if (agentLive) return;

  const config = getLiveKitHttpConfig();
  if (!config) return;

  const rooms = new RoomServiceClient(config.host, config.apiKey, config.apiSecret);
  try {
    const participants = await rooms.listParticipants(roomName);
    const bey = participants.find((p) => p.identity === BEY_IDENTITY);
    if (bey) {
      await rooms.removeParticipant(roomName, BEY_IDENTITY);
      console.info('[AmityRecovery] [dispatch] removed stale bey participant', { roomName });
    }
  } catch (err) {
    console.warn('[AmityRecovery] [dispatch] remove bey failed', {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Ensures the amity-recovery-agent worker is dispatched and connected.
 * Re-dispatches when only a stale Bey avatar is left from a crashed worker.
 */
export async function dispatchAmityRecoveryAgent(roomName: string): Promise<boolean> {
  const config = getLiveKitHttpConfig();
  if (!config) return false;

  const agentLive = await isAmityRecoveryAgentLive(roomName);
  if (agentLive) {
    console.info('[AmityRecovery] [dispatch] live agent in room', { roomName });
    return true;
  }

  await clearStaleDispatches(roomName);
  await removeStaleBeyParticipant(roomName, agentLive);

  const client = new AgentDispatchClient(config.host, config.apiKey, config.apiSecret);
  await client.createDispatch(roomName, AMITY_RECOVERY_AGENT_NAME, {
    metadata: JSON.stringify({ source: 'amity-recovery-room', at: Date.now() }),
  });

  console.info('[AmityRecovery] [dispatch] agent dispatched (fresh)', {
    roomName,
    agentName: AMITY_RECOVERY_AGENT_NAME,
  });
  return true;
}
