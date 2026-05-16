import { NextResponse } from 'next/server';
import { resolveBeyondPresenceAvatarId, startBeyondPresenceSpeechToVideo } from '@/lib/beyond-presence-stv';
import { createLiveKitRecoveryRoom, isLiveKitConfigured } from '@/lib/livekit-room';
import { RoomServiceClient } from 'livekit-server-sdk';

function serverLog(phase: string, data: Record<string, unknown>) {
  console.info(`[AmityRecovery] [avatar-livekit] [${phase}]`, data);
}

/**
 * POST /api/recovery/avatar-livekit
 * Body: { sessionId: string, phase: 'connect' | 'activate' }
 *
 * connect — create LiveKit room + browser token
 * activate — start BP speech-to-video worker (call before publishing ElevenLabs audio)
 */
export async function POST(request: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      {
        error: 'LIVEKIT_NOT_CONFIGURED',
        message:
          'Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET from LiveKit Cloud to enable lip-synced avatar video.',
      },
      { status: 400 }
    );
  }

  let body: { sessionId?: string; phase?: 'connect' | 'activate' };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim() || 'SES-DEMO-001';
  const phase = body.phase ?? 'connect';

  serverLog('request', { sessionId, phase });

  try {
    const room = await createLiveKitRecoveryRoom(sessionId);
    serverLog('room', {
      sessionId,
      phase,
      roomName: room.roomName,
      livekitUrl: room.livekitUrl,
      userIdentity: 'amity-user-*',
      beyIdentity: 'bey-avatar-agent',
    });

    if (phase === 'connect') {
      return NextResponse.json({
        roomName: room.roomName,
        livekitUrl: room.livekitUrl,
        token: room.participantToken,
      });
    }

    const avatarId = await resolveBeyondPresenceAvatarId();
    serverLog('resolve-avatar', { sessionId, avatarId: avatarId ?? null });

    if (!avatarId) {
      return NextResponse.json(
        {
          error: 'BEY_AVATAR_MISSING',
          message:
            'Set BEYOND_PRESENCE_AVATAR_ID or BEYOND_PRESENCE_AGENT_ID with a valid avatar in Beyond Presence.',
        },
        { status: 400 }
      );
    }

    const bpSession = await startBeyondPresenceSpeechToVideo({
      avatarId,
      livekitUrl: room.livekitUrl,
      livekitToken: room.beyAvatarToken,
    });

    serverLog('activate-ok', {
      sessionId,
      beySessionId: bpSession.sessionId,
      avatarId: bpSession.avatarId,
      startedAt: bpSession.startedAt,
    });

    try {
      const host = room.livekitUrl.replace(/^wss:/, 'https:').replace(/^ws:/, 'http:');
      const apiKey = process.env.LIVEKIT_API_KEY!.trim();
      const apiSecret = process.env.LIVEKIT_API_SECRET!.trim();
      const svc = new RoomServiceClient(host, apiKey, apiSecret);
      const participants = await svc.listParticipants(room.roomName);
      serverLog('room-participants', {
        sessionId,
        count: participants.length,
        identities: participants.map((p) => ({
          identity: p.identity,
          tracks: p.tracks?.map((t) => ({ type: t.type, sid: t.sid, name: t.name })),
        })),
      });
    } catch (listErr) {
      serverLog('room-participants-error', {
        message: listErr instanceof Error ? listErr.message : String(listErr),
      });
    }

    return NextResponse.json({
      roomName: room.roomName,
      livekitUrl: room.livekitUrl,
      token: room.participantToken,
      beySessionId: bpSession.sessionId,
      avatarId: bpSession.avatarId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LiveKit avatar session failed.';
    serverLog('error', {
      sessionId,
      phase,
      message,
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ error: 'AVATAR_LIVEKIT_FAILED', message }, { status: 502 });
  }
}
