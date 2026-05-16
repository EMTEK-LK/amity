# Amity — System Architecture

## Flow

```
User Device
  → Consent + Session Gate
  → Parallel Signal Pipelines
       A. Trigger Signal Pipeline
       B. Optional Facial Awareness Pipeline (consent-gated)
       C. Voice Conversation Pipeline (consent-gated)
  → Shared Session Context
  → Risk + Safety Engine
  → Recovery Orchestrator
       → Gemini Response Layer
       → ElevenLabs Voice Layer
       → Beyond Presence Avatar Interface
  → Recovery Summary + Privacy-safe Analytics
  → Crisis Escalation (if needed)
```

## Parallel pipelines

| Pipeline | MVP | Future production |
|----------|-----|-------------------|
| **Trigger** | `/user/trigger-demo` simulates wearables, Teams, Slack, calendar, call center, manual, wake word, video/crisis classifier | Real integrations |
| **Facial awareness** | Mock broad expression cues when consented | face-api.js in browser |
| **Voice** | Mock voice state + transcript snapshot | Gemini Live + WebRTC |

Pipelines merge into **`SharedSessionContext`** (`types/session-context.ts`, `lib/session-context.ts`).

## Shared session context

Single object per recovery session: vitals, emotion, voice state, optional facial signal, engagement, risk, safety level, recommended action. Employee-private during session; admin sees **aggregates only** (`types/analytics.ts`).

## Recovery orchestrator

`lib/recovery-orchestrator.ts` → `prepareRecoverySession()` returns plan for Gemini context, ElevenLabs voice mode, BP avatar mode, and `nextRoute`.

## Crisis escalation

`lib/crisis-escalation.ts` → when `shouldActivateCrisisMode()` is true, normal coaching stops, `nextRoute` is `/user/crisis`. No real emergency calling in MVP.

## Roles

| Role | Access |
|------|--------|
| **Employee** | Trigger Demo, Recovery Room, private summary, crisis flow |
| **Admin** | Aggregated dashboard, analytics — no transcripts or session content |

## Key modules

| Path | Purpose |
|------|---------|
| `lib/session-context.ts` | Context create/update from trigger, facial, voice |
| `lib/consent-manager.ts` | Consent defaults and gates |
| `lib/facial-awareness.ts` | Optional expression cues (not diagnosis) |
| `lib/voice-session.ts` | Voice pipeline placeholder |
| `lib/risk-engine.ts` | Rule-based risk + crisis detection |
| `lib/recovery-orchestrator.ts` | Layer preparation |
| `lib/crisis-escalation.ts` | Crisis plan |
| `lib/demo-trigger-scenarios.ts` | 10 demo scenarios + payloads |

## MVP vs future

See `README.md` § MVP vs Future Scope.
