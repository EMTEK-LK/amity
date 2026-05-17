export interface BeyondPresenceRoomConfig {
  sessionId: string;
  employeeId: string;
  agentId?: string;
  avatarMode?: string;
}

import { isLiveKitConfigured } from './livekit-room';

/** How Recovery Room shows Beyond Presence */
export type BeyondPresenceDisplayMode = 'stage' | 'iframe' | 'livekit';

export interface BeyondPresenceConfig {
  roomId: string;
  agentId: string | null;
  agentName: string | null;
  /** Full bey.chat session (optional — separate BP agent UI) */
  sessionUrl: string | null;
  /** Only set when displayMode is iframe */
  embedUrl: string | null;
  displayMode: BeyondPresenceDisplayMode;
  placeholder: boolean;
}

export interface BeyondPresenceRoom {
  roomId: string;
  embedUrl?: string | null;
  joinToken?: string;
  agentId?: string | null;
  placeholder: boolean;
}

const BEY_API = 'https://api.bey.dev/v1';

let cachedBeyondPresence: BeyondPresenceConfig | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

function useIframeEmbed(): boolean {
  const flag = process.env.BEYOND_PRESENCE_EMBED_IFRAME?.trim().toLowerCase();
  return flag === 'true' || flag === '1' || flag === 'yes';
}

async function fetchAgentName(apiKey: string, agentId: string): Promise<string | null> {
  try {
    const res = await fetch(`${BEY_API}/agents/${agentId}`, {
      headers: { 'x-api-key': apiKey },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { name?: string };
    return data.name?.trim() ?? null;
  } catch {
    return null;
  }
}

/**
 * Beyond Presence config for Recovery Room.
 *
 * Default `stage` mode: Amity-driven coach visual + ElevenLabs audio (no bey.chat iframe).
 * Set BEYOND_PRESENCE_EMBED_IFRAME=true to embed the full bey.chat call UI (separate BP agent).
 *
 * Lip-synced BP video requires Speech-to-Video + LiveKit (future step).
 * @see https://docs.bey.dev/integrations/speech-to-video/
 */
export async function getBeyondPresenceConfig(): Promise<BeyondPresenceConfig> {
  if (cachedBeyondPresence && Date.now() < cacheExpiresAt) {
    return cachedBeyondPresence;
  }

  const apiKey = process.env.BEYOND_PRESENCE_API_KEY?.trim();
  const agentId = process.env.BEYOND_PRESENCE_AGENT_ID?.trim();
  const iframe = useIframeEmbed();
  const livekit = isLiveKitConfigured() && Boolean(apiKey);

  if (!apiKey) {
    cachedBeyondPresence = {
      roomId: 'bp-unconfigured',
      agentId: null,
      agentName: null,
      sessionUrl: null,
      embedUrl: null,
      displayMode: 'stage',
      placeholder: true,
    };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return cachedBeyondPresence;
  }

  if (!agentId && !livekit) {
    cachedBeyondPresence = {
      roomId: 'bp-unconfigured',
      agentId: null,
      agentName: null,
      sessionUrl: null,
      embedUrl: null,
      displayMode: 'stage',
      placeholder: true,
    };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return cachedBeyondPresence;
  }

  const agentName = agentId ? await fetchAgentName(apiKey, agentId) : null;
  const sessionUrl = agentId ? `https://bey.chat/${agentId}` : null;

  let displayMode: BeyondPresenceDisplayMode = 'stage';
  if (livekit) displayMode = 'livekit';
  else if (iframe) displayMode = 'iframe';

  cachedBeyondPresence = {
    roomId: agentId ? `bp-${agentId}` : 'bp-livekit',
    agentId: agentId ?? null,
    agentName,
    sessionUrl,
    embedUrl: iframe ? sessionUrl : null,
    displayMode,
    placeholder: false,
  };
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cachedBeyondPresence;
}

/** @deprecated Use getBeyondPresenceConfig */
export async function getBeyondPresenceEmbed(): Promise<BeyondPresenceRoom> {
  const config = await getBeyondPresenceConfig();
  return {
    roomId: config.roomId,
    embedUrl: config.embedUrl,
    agentId: config.agentId,
    placeholder: config.placeholder,
  };
}

/** @deprecated Use getBeyondPresenceConfig */
export async function createRecoveryRoom(
  config: BeyondPresenceRoomConfig
): Promise<BeyondPresenceRoom> {
  const room = await getBeyondPresenceEmbed();
  return {
    ...room,
    roomId: room.roomId || `bp-demo-${config.sessionId}`,
  };
}
