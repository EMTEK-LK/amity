export interface BeyondPresenceRoomConfig {
  sessionId: string;
  employeeId: string;
  agentId?: string;
  avatarMode?: string;
}

export interface BeyondPresenceRoom {
  roomId: string;
  embedUrl?: string;
  joinToken?: string;
  /** MVP embed placeholder */
  placeholder: boolean;
}

/**
 * Beyond Presence avatar interface (MVP placeholder).
 * Future: real embed + lip-sync.
 */
export async function createRecoveryRoom(
  config: BeyondPresenceRoomConfig
): Promise<BeyondPresenceRoom> {
  return {
    roomId: `bp-demo-${config.sessionId}`,
    embedUrl: undefined,
    joinToken: undefined,
    placeholder: true,
  };
}
