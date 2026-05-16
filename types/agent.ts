import type { SafetyLevel } from './session-context';
import type { TriggerRiskLevel } from './trigger';

/** Summarized facial quality sent to agent — never raw video */
export type AgentFacialSignalQuality =
  | 'usable'
  | 'low_quality'
  | 'no_face'
  | 'camera_off';

/**
 * Summarized session fields sent to backend.
 * Only summarized facial signals are sent — raw webcam video/images are never sent.
 */
export interface AgentSessionContextPayload {
  stressLevel: number;
  heartRate: number;
  voiceState: string;
  transcript?: string | null;
  facialExpression?: string | null;
  facialConfidence?: number | null;
  engagement?: string | null;
  facialSignalQuality?: AgentFacialSignalQuality | string | null;
  riskLevel: TriggerRiskLevel;
  safetyLevel: SafetyLevel;
  triggerType?: string | null;
  currentEmotion?: string | null;
  selectedRecoveryMode?: string | null;
  employeeRole?: string;
}

export type AgentMessageSource = 'voice_transcript' | 'typed_input';

export interface AgentRespondRequest {
  sessionId: string;
  employeeId: string;
  userMessage: string;
  /** Whether the message came from the live transcript or the typed fallback */
  source?: AgentMessageSource;
  sessionContext: AgentSessionContextPayload;
  selectedRecoveryMode?: string | null;
}

/**
 * Step 6A: no mock fallback. `real` = live Gemini, `safety` = crisis
 * short-circuit, `not_configured` = missing GEMINI_API_KEY, `error` = request failed.
 */
export type GeminiProviderStatus = 'real' | 'safety' | 'not_configured' | 'error';

export interface AgentProviderStatus {
  gemini: GeminiProviderStatus;
  voice: 'disabled';
}

/** Returned (with non-2xx status) when Gemini is missing/failed — no mock fallback. */
export interface AgentErrorResponse {
  error: 'GEMINI_API_KEY_MISSING' | 'GEMINI_REQUEST_FAILED';
  message: string;
  provider: AgentProviderStatus;
}

export interface AgentReceivedContext {
  facialExpression?: string | null;
  facialConfidence?: number | null;
  engagement?: string | null;
  voiceState?: string;
  riskLevel?: string;
  stressLevel?: number;
}

/** Text-only agent response (Step 6A — voice disabled until Step 7) */
export interface AgentRespondResponse {
  response: string;
  safetyLevel: SafetyLevel;
  recommendedAction: string;
  nextQuestion?: string | null;
  nextRoute?: string;
  provider: AgentProviderStatus;
  receivedContext: AgentReceivedContext;
  crisis: boolean;
  geminiContextPreview?: Record<string, unknown>;
}

/** @deprecated Step 5.2 audio fields — not used in Step 6A */
export type AgentAudioStatus = 'ready' | 'mock_ready' | 'unavailable' | 'error';
