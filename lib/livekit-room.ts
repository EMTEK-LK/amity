import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

export interface LiveKitRoomCredentials {
  roomName: string;
  livekitUrl: string;
  participantToken: string;
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
}): Promise<string> {
  const at = new AccessToken(opts.apiKey, opts.apiSecret, {
    identity: opts.identity,
    ttl: '2h',
  });
  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: true,
    canSubscribe: true,
  });
  return at.toJwt();
}

/** Creates (or reuses) a LiveKit room and returns a browser participant token. */
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
      maxParticipants: 6,
    });
  } catch {
    /* room may already exist */
  }

  const participantToken = await createToken({
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    roomName,
    identity: `amity-user-${sessionId.slice(0, 12)}`,
  });

  return {
    roomName,
    livekitUrl: config.livekitUrl,
    participantToken,
  };
}
