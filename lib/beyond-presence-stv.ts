const BEY_API = 'https://api.bey.dev/v1';

export interface BeySpeechToVideoSession {
  sessionId: string;
  avatarId: string;
  startedAt?: string;
}

async function fetchAgentAvatarId(apiKey: string, agentId: string): Promise<string | null> {
  try {
    const res = await fetch(`${BEY_API}/agents/${agentId}`, {
      headers: { 'x-api-key': apiKey },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { avatar_id?: string };
    return data.avatar_id?.trim() ?? null;
  } catch {
    return null;
  }
}

async function fetchFirstAvailableAvatarId(apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(`${BEY_API}/avatars?limit=10`, {
      headers: { 'x-api-key': apiKey },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      data?: { id: string; status?: string }[];
    };
    const found = data.data?.find((a) => a.status === 'available') ?? data.data?.[0];
    return found?.id ?? null;
  } catch {
    return null;
  }
}

export async function resolveBeyondPresenceAvatarId(): Promise<string | null> {
  const apiKey = process.env.BEYOND_PRESENCE_API_KEY?.trim();
  if (!apiKey) return null;

  const fromEnv = process.env.BEYOND_PRESENCE_AVATAR_ID?.trim();
  if (fromEnv) return fromEnv;

  const agentId = process.env.BEYOND_PRESENCE_AGENT_ID?.trim();
  if (agentId) {
    const fromAgent = await fetchAgentAvatarId(apiKey, agentId);
    if (fromAgent) return fromAgent;
  }

  return fetchFirstAvailableAvatarId(apiKey);
}

/**
 * Starts a Beyond Presence speech-to-video worker in the LiveKit room.
 * @see https://docs.bey.dev/api-reference/sessions/create-speech-to-video-session
 */
export async function startBeyondPresenceSpeechToVideo(opts: {
  avatarId: string;
  livekitUrl: string;
  livekitToken: string;
}): Promise<BeySpeechToVideoSession> {
  const apiKey = process.env.BEYOND_PRESENCE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('BEYOND_PRESENCE_API_KEY is missing.');
  }

  const res = await fetch(`${BEY_API}/sessions`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transport: 'livekit',
      avatar_id: opts.avatarId,
      url: opts.livekitUrl,
      token: opts.livekitToken,
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: unknown };
    throw new Error(
      `Beyond Presence speech-to-video failed (${res.status}). ${JSON.stringify(err.detail ?? '')}`
    );
  }

  const data = (await res.json()) as {
    id: string;
    avatar_id: string;
    started_at?: string;
  };

  return {
    sessionId: data.id,
    avatarId: data.avatar_id,
    startedAt: data.started_at,
  };
}
