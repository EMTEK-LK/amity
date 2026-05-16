/**
 * Architecture overview — parallel signal pipelines (MVP placeholders).
 *
 * User Device
 *   → Consent + Session Gate
 *   → Parallel: Trigger | Facial (optional) | Voice
 *   → Shared Session Context
 *   → Risk + Safety Engine
 *   → Recovery Orchestrator → Gemini | ElevenLabs | BP
 *   → Summary + Privacy-safe Analytics | Crisis Escalation
 */

export const PIPELINE_VERSION = 'mvp-0.1';

export const MVP_PIPELINES = {
  trigger: { status: 'simulated', route: '/user/trigger-demo' },
  facial: { status: 'placeholder', requiresConsent: true },
  voice: { status: 'placeholder', requiresConsent: true },
} as const;

export const FUTURE_PIPELINES = {
  facial: 'face-api.js (browser, consent-gated)',
  voice: 'Gemini Live streaming + WebRTC',
  avatar: 'Beyond Presence lip-sync',
  integrations: 'Wearables, Teams, Slack, WhatsApp',
} as const;
