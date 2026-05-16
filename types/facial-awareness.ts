/**
 * Optional broad expression awareness — not diagnosis.
 * Browser-side face-api.js when consented; never raw video to Gemini.
 */

export type FacialExpression =
  | 'neutral'
  | 'sad'
  | 'stressed'
  | 'angry'
  | 'tired'
  | 'uncertain'
  | 'unknown';

export type FacialEngagementLevel = 'high' | 'medium' | 'low';

export type FacialSignalQuality = 'good' | 'fair' | 'poor' | 'unavailable';

/** @deprecated Use FacialSignalQuality */
export type SignalQuality = FacialSignalQuality;

export type AttentionLevel = 'focused' | 'distracted' | 'unknown';

export type FacialAwarenessStatus =
  | 'idle'
  | 'loading_models'
  | 'waiting_for_camera'
  | 'running'
  | 'no_face'
  | 'models_missing'
  | 'permission_denied'
  | 'camera_off'
  | 'paused'
  | 'error';

export interface FacialAwarenessSignal {
  expression: FacialExpression;
  /** Model confidence 0–1 — indicative only, not certain */
  confidence: number;
  engagement: FacialEngagementLevel;
  attention: AttentionLevel;
  signalQuality: FacialSignalQuality;
  capturedAt: string;
  /** True when signal is simulated (trigger demo / mock) */
  simulated?: boolean;
}
