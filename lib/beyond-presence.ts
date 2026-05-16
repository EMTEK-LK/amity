export interface BeyondPresenceRoomConfig {
  sessionId: string;
  employeeId: string;
  agentId?: string;
}

export interface BeyondPresenceRoom {
  roomId: string;
  embedUrl?: string;
  joinToken?: string;
}

/**
 * Beyond Presence: video avatar recovery room wrapper.
 * Implementation planned in Phase 4.
 */
export async function createRecoveryRoom(
  _config: BeyondPresenceRoomConfig
): Promise<BeyondPresenceRoom> {
  throw new Error('beyond-presence not implemented — Phase 4');
}
