import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface LiveKitRoomCredentials {
  roomName: string;
  livekitUrl: string;
  participantToken: string;
  beyAvatarToken: string;
}

function getLiveKitConfig() {
  const livekitUrl = process.env.LIVEKIT_URL?.trim();
  const apiKey = process.env.LIVEKIT_API_KEY?.trim();
  const apiSecret = process.env.LIVEKIT_API_SECRET?.trim();
  if (!livekitUrl || !apiKey || !apiSecret) return null;
  return { livekitUrl, apiKey, apiSecret };
}

export function isLiveKitConfigured(): boolean {
  return getLiveKitConfig() !== null;
}

function sanitizeRoomName(sessionId: string): string {
  return `amity-${sessionId.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 48)}`;
}

async function createToken(opts: {
  apiKey: string;
  apiSecret: string;
  roomName: string;
  identity: string;
  canPublish: boolean;
  canSubscribe: boolean;
}): Promise<string> {
  const at = new AccessToken(opts.apiKey, opts.apiSecret, {
    identity: opts.identity,
    ttl: '2h',
  });
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.canPublish,
    canSubscribe: opts.canSubscribe,
  });
  return at.toJwt();
}

/** Creates (or reuses) a LiveKit room and returns tokens for browser + Beyond Presence worker. */
export async function createLiveKitRecoveryRoom(sessionId: string): Promise<LiveKitRoomCredentials> {
  const config = getLiveKitConfig();
  if (!config) {
    throw new Error('LiveKit is not configured. Add LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET.');
  }

  const roomName = sanitizeRoomName(sessionId);
  const host = config.livekitUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
  const svc = new RoomServiceClient(host, config.apiKey, config.apiSecret);

  try {
    await svc.createRoom({
      name: roomName,
      emptyTimeout: 15 * 60,
      maxParticipants: 4,
    });
  } catch {
    /* room may already exist */
  }

  try {
    const existing = await svc.listParticipants(roomName);
    for (const participant of existing) {
      if (
        participant.identity.startsWith('bey-') ||
        participant.identity === 'bey-avatar-agent'
      ) {
        await svc.removeParticipant(roomName, participant.identity);
      }
    }
  } catch {
    /* best-effort cleanup of stale BP workers */
  }

  const [participantToken, beyAvatarToken] = await Promise.all([
    createToken({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      roomName,
      identity: `amity-user-${sessionId.slice(0, 12)}`,
      canPublish: true,
      canSubscribe: true,
    }),
    createToken({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      roomName,
      identity: 'bey-avatar-agent',
      canPublish: true,
      canSubscribe: true,
    }),
  ]);

  return {
    roomName,
    livekitUrl: config.livekitUrl,
    participantToken,
    beyAvatarToken,
  };
}
