import { NextResponse } from 'next/server';
import { getBeyondPresenceConfig } from '@/lib/beyond-presence';

/** GET — avatar config for Recovery Room (no API secrets exposed). */
export async function GET() {
  const avatar = await getBeyondPresenceConfig();
  return NextResponse.json({
    avatar: {
      displayMode: avatar.displayMode,
      embedUrl: avatar.embedUrl,
      sessionUrl: avatar.sessionUrl,
      agentId: avatar.agentId,
      agentName: avatar.agentName,
      placeholder: avatar.placeholder,
    },
  });
}
