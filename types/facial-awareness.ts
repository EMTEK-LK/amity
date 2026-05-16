/**
 * Optional broad expression awareness — not diagnosis.
 * Browser-side face-api.js planned for production; MVP uses demo/mock signals only.
 */
export type FacialExpression =
  | 'neutral'
  | 'sad'
  | 'stressed'
  | 'angry'
  | 'tired'
  | 'uncertain'
  | 'unknown';

export type AttentionLevel = 'focused' | 'distracted' | 'unknown';

export type SignalQuality = 'good' | 'fair' | 'poor' | 'unavailable';

export interface FacialAwarenessSignal {
  expression: FacialExpression;
  /** Model confidence 0–1 — indicative only */
  confidence: number;
  engagement: 'high' | 'medium' | 'low';
  attention: AttentionLevel;
  signalQuality: SignalQuality;
  capturedAt: string;
  /** Demo flag — true when signal is simulated */
  simulated?: boolean;
}
