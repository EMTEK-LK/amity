import { NextResponse } from 'next/server';
import { dispatchAmityRecoveryAgent } from '@/lib/livekit-agent-dispatch';
import { createLiveKitRecoveryRoom, isLiveKitConfigured } from '@/lib/livekit-room';

function serverLog(phase: string, data: Record<string, unknown>) {
  console.info(`[AmityRecovery] [avatar-livekit] [${phase}]`, data);
}

/**
 * POST /api/recovery/avatar-livekit
 * Body: { sessionId: string, phase: 'connect' | 'activate' }
 *
 * connect — LiveKit room + user token + dispatch amity-recovery-agent worker
 * activate — legacy alias for connect dispatch (BP REST path removed)
 */
export async function POST(request: Request) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json(
      {
        error: 'LIVEKIT_NOT_CONFIGURED',
        message:
          'Add LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET from LiveKit Cloud.',
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
    serverLog('room', { sessionId, roomName: room.roomName, livekitUrl: room.livekitUrl });

    let agentDispatched = false;
    try {
      await dispatchAmityRecoveryAgent(room.roomName);
      agentDispatched = true;
    } catch (dispatchErr) {
      serverLog('dispatch-error', {
        message: dispatchErr instanceof Error ? dispatchErr.message : String(dispatchErr),
      });
    }

    return NextResponse.json({
      roomName: room.roomName,
      livekitUrl: room.livekitUrl,
      token: room.participantToken,
      agentDispatched,
      mode: 'livekit-agents-bey',
      message: agentDispatched
        ? 'Agent dispatched. Ensure npm run agent:dev is running.'
        : 'Room ready but agent dispatch failed. Start the agent worker.',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'LiveKit avatar session failed.';
    serverLog('error', { sessionId, phase, message });
    return NextResponse.json({ error: 'AVATAR_LIVEKIT_FAILED', message }, { status: 502 });
  }
}
