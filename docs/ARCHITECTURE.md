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
       → LLM Response Layer (Gemini / OpenRouter)
       → ElevenLabs Voice Layer (fallback + agent TTS)
       → Beyond Presence Avatar (LiveKit Agents + Bey lip-sync)
  → Recovery Summary + Privacy-safe Analytics
  → Crisis Escalation (if needed)
```

## Recovery Room avatar pipeline (current)

When `LIVEKIT_URL` is set:

```
POST /api/agent/respond
  → LLM text + ElevenLabs audioUrl (fallback)

POST /api/recovery/avatar-livekit?phase=connect
  → room token + dispatch amity-recovery-agent

Browser (livekit-client)
  → subscribe bey-avatar-agent video + audio
  → publishData topic amity/speak { text, requestId }

agent-worker (amity-recovery-agent)
  → ElevenLabs TTS → Bey AvatarSession → lip-synced A/V
```

Full detail: **`docs/RECOVERY_AVATAR.md`**.

## Parallel pipelines

| Pipeline | MVP | Future production |
|----------|-----|-------------------|
| **Trigger** | `/user/trigger-demo` simulates wearables, Teams, Slack, calendar, call center, manual, wake word, video/crisis classifier | Real integrations |
| **Facial awareness** | face-api.js in browser when consented | Refined cues, on-device only |
| **Voice** | Web Speech transcript + ElevenLabs; lip-sync via agent worker | Gemini Live + WebRTC |

Pipelines merge into **`SharedSessionContext`** (`types/session-context.ts`, `lib/session-context.ts`).

## Shared session context

Single object per recovery session: vitals, emotion, voice state, optional facial signal, engagement, risk, safety level, recommended action. Employee-private during session; admin sees **aggregates only** (`types/analytics.ts`).

## Recovery orchestrator

`lib/recovery-orchestrator.ts` → `prepareRecoverySession()` returns plan for LLM context, ElevenLabs voice mode, BP avatar mode, and `nextRoute`.

`lib/recovery-pipeline.ts` runs LLM + ElevenLabs + `getBeyondPresenceConfig()` for each agent reply.

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
| `lib/recovery-pipeline.ts` | LLM + voice + avatar config per reply |
| `lib/livekit-avatar-session.ts` | Browser LiveKit session + speak |
| `lib/livekit-agent-dispatch.ts` | Agent worker dispatch + stale cleanup |
| `lib/livekit-room.ts` | Room + participant JWT |
| `agent-worker/main.ts` | LiveKit agent: Bey lip-sync + TTS |
| `lib/gemini.ts` / `lib/elevenlabs.ts` / `lib/beyond-presence.ts` | Provider integrations |
| `lib/risk-engine.ts` | Rule-based risk + crisis detection |
| `lib/crisis-escalation.ts` | Crisis plan |
| `lib/demo-trigger-scenarios.ts` | 10 demo scenarios + payloads |

## MVP vs future

**MVP:** simulated triggers, rule-based risk, LiveKit + Bey lip-sync via local agent worker, ElevenLabs fallback, privacy-safe admin analytics.

**Future:** hosted agent worker, Gemini Live streaming, real wearables/workplace tools, production human handoff.
