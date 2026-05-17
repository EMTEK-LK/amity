export type AvatarStatus = 'ready' | 'listening' | 'responding' | 'crisis';

export type RecoverySessionStatus = 'consent' | 'active' | 'paused' | 'crisis' | 'completed';

export type RecoverySafetyState = 'normal' | 'elevated' | 'recovery_needed' | 'crisis';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
