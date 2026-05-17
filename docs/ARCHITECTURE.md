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
  → POST /api/agent/respond (one turn = one LLM request)
       → LLM (Gemini / OpenRouter via buildRecoveryPrompt)
       → Optional server ElevenLabs (skipped when LiveKit configured)
       → Beyond Presence config (parallel + cached)
  → Browser: chat UI + LiveKit speak OR ElevenLabs fallback
  → Recovery Summary + Privacy-safe Analytics
  → Crisis Escalation (if needed)
```

Full LLM/voice/latency detail: **`docs/LLM_AND_RECOVERY_PIPELINE.md`**.

## Recovery Room avatar pipeline (current)

When `LIVEKIT_URL` is set:

```
POST /api/agent/respond
  → LLM text (no server TTS when LiveKit + AMITY_SKIP_SERVER_TTS / auto-skip)

POST /api/recovery/avatar-livekit?phase=connect
  → room token + dispatch amity-recovery-agent

Browser (livekit-client)
  → subscribe bey-avatar-agent video + audio
  → publishData topic amity/speak { text, requestId }

agent-worker (amity-recovery-agent)
  → ElevenLabs TTS → Bey AvatarSession → lip-synced A/V
```

Full detail: **`docs/RECOVERY_AVATAR.md`**.

## LLM layer (current)

| Concern | Implementation |
|---------|----------------|
| Persona | `lib/recovery-llm-prompt.ts` — sent every request |
| Providers | `lib/gemini.ts` — `AMITY_LLM_PROVIDER`, OpenRouter fallback on Gemini quota |
| Turn model | Full user message + context snapshot per POST — **not** streaming tokens |
| Safety | `lib/safety-classifier.ts` before coaching; crisis short-circuit in route |
| Performance | `lib/recovery-performance.ts` — skip server TTS, token cap, parallel fetch |

The **agent worker does not call the LLM** — it only speaks lines from the browser.

## Parallel pipelines

| Pipeline | MVP | Future production |
|----------|-----|-------------------|
| **Trigger** | `/user/trigger-demo` simulates wearables, Teams, Slack, calendar, call center, manual, wake word, video/crisis classifier | Real integrations |
| **Facial awareness** | face-api.js in browser ~1s; labels on **each user turn** to LLM | Same privacy; optional Live context updates |
| **Voice** | Web Speech → debounced segment → `/api/agent/respond`; lip-sync via agent worker | Gemini Live + WebRTC |

Pipelines merge into **`SharedSessionContext`** (`types/session-context.ts`, `lib/session-context.ts`).

## Shared session context

Single object per recovery session: vitals, emotion, voice state, optional facial signal, engagement, risk, safety level, recommended action. Employee-private during session; admin sees **aggregates only** (`types/analytics.ts`).

## Recovery orchestrator

`lib/recovery-orchestrator.ts` → `prepareRecoverySession()` returns plan for LLM context, ElevenLabs voice mode, BP avatar mode, and `nextRoute`.

`lib/recovery-pipeline.ts` runs LLM + optional voice + `getBeyondPresenceConfig()` for each agent reply.

## Crisis escalation

`lib/crisis-escalation.ts` → when `shouldActivateCrisisMode()` is true, normal coaching stops, `nextRoute` is `/user/crisis`. No real emergency calling in MVP. Crisis is driven by **user text** (and triggers), not facial cues alone.

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
| `lib/recovery-llm-prompt.ts` | LLM persona + JSON context |
| `lib/recovery-pipeline.ts` | LLM + optional voice + avatar per reply |
| `lib/recovery-performance.ts` | Latency helpers (skip TTS, tokens) |
| `lib/agent-session-context.ts` | Summarized API payload |
| `lib/livekit-avatar-session.ts` | Browser LiveKit session + speak |
| `lib/livekit-agent-dispatch.ts` | Agent worker dispatch + stale cleanup |
| `lib/livekit-room.ts` | Room + participant JWT |
| `agent-worker/main.ts` | LiveKit agent: Bey lip-sync + TTS (no LLM) |
| `lib/gemini.ts` / `lib/openrouter.ts` / `lib/elevenlabs.ts` / `lib/beyond-presence.ts` | Providers |
| `lib/risk-engine.ts` | Rule-based risk + crisis detection |
| `lib/crisis-escalation.ts` | Crisis plan |
| `lib/demo-trigger-scenarios.ts` | 10 demo scenarios + payloads |

## MVP vs future

**MVP:** simulated triggers, rule-based risk, turn-based LLM, LiveKit + Bey lip-sync, ElevenLabs fallback, privacy-safe admin analytics.

**Future:** hosted agent worker, Gemini Live streaming (SSE / WebSocket), real wearables/workplace tools, production human handoff.
