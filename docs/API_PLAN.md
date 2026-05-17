# Amity — API Plan

## Overview

Next.js Route Handlers under `app/api/`. Demo uses in-memory `demo-store` and **`SharedSessionContext`** (`lib/session-context.ts`) first; APIs wrap lib modules for client components and future persistence.

### Planned session endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/session/context` | Merge trigger / facial / voice into shared context (facial: summarized fields only — never video frames) |
| `GET /api/session/context` | Employee-private session state |
| `POST /api/session/recover` | Run `prepareRecoverySession()` |
| `POST /api/session/crisis` | Run `prepareCrisisEscalation()` |

## Endpoints (planned)

### `GET/POST /api/employees`

- Demo employee profile (Sarah)
- Update emotional digital twin state after triggers

### `POST /api/triggers`

- Accept simulated trigger payload from Employee Trigger Demo (`/user/trigger-demo`)
- Payload shape (demo preview today in UI):

```json
{
  "employeeId": "EMP-001",
  "source": "microsoft_teams",
  "triggerType": "manager_conflict",
  "emotionSignal": "sad_overwhelmed",
  "stressScore": 84,
  "heartRate": 118,
  "riskLevel": "high",
  "recommendedAction": "start_recovery_session"
}
```

- Sources simulated in MVP: `apple_watch`, `whoop`, `microsoft_teams`, `slack`, `whatsapp`, `calendar`, `call_center`, `manual`, `wake_word`, `bp_video_analysis`, `safety_classifier`, `work_pattern`, `crm`
- Crisis payloads use `recommendedAction: "crisis_safety_flow"`
- Run signal engine → risk engine → return updated state + recommendation

### `POST/GET /api/recovery-sessions`

- Start session (orchestrator → Beyond Presence room config)
- End session → trigger summary generation

### `POST /api/agent/respond` ✅ (current)

**Turn-based:** one HTTP request per user message (typed or finalized speech segment). Not streaming partial LLM tokens to the client.

- **Request:** `userMessage`, `sessionId`, `employeeId`, `source` (`voice_transcript` | `typed_input`), `sessionContext` (summarized stress, HR, voice, **transcript text**, facial expression/confidence/engagement/quality, risk, safety, recovery mode), `selectedRecoveryMode`
- **Flow:** `classifySafety()` → crisis short-circuit OR `runRecoveryPipeline()`:
  - `generateAmityRecoveryResponse()` — Gemini and/or OpenRouter (`AMITY_LLM_PROVIDER`, quota fallback)
  - `generateAmityVoice()` — **skipped** when LiveKit configured (`shouldSkipServerTts()`)
  - `getBeyondPresenceConfig()` — in parallel with LLM; 5 min cache
- **LLM prompt:** `buildRecoveryPrompt()` — Amity persona + JSON context (`lib/recovery-llm-prompt.ts`)
- **Keys:** `GEMINI_API_KEY` and/or `OPENROUTER_API_KEY` required (no mock coaching fallback)
- **Response (2xx):** `response`, `safetyLevel`, `recommendedAction`, `nextQuestion`, `provider.gemini` (`real` | `safety`), `provider.voice` (`ready` | `disabled` | `mock_ready` | …), `voice.audioUrl` (null when server TTS skipped), `avatar`, `receivedContext`, `geminiContextPreview`
- **Error 400:** `GEMINI_API_KEY_MISSING` — no keys configured
- **Error 502:** `GEMINI_REQUEST_FAILED` — includes Gemini quota/depleted or OpenRouter errors (message in `message` field; logged in dev)
- **Never:** raw webcam frames, images, or mic audio

See **`docs/LLM_AND_RECOVERY_PIPELINE.md`**.

### `POST /api/recovery/avatar-livekit` ✅

- `phase: connect` — room token + dispatch `amity-recovery-agent`
- `phase: token` — refresh browser token only

### `POST /api/agent/test` ✅

- Body: `{ "message": "..." }` — tests LLM adapter with demo session context
- Same error contract as `/api/agent/respond`

### `POST /api/agent` (future aliases)

- May wrap the same handler for batch/summary endpoints

### `POST /api/voice` (future)

- Optional dedicated TTS endpoint; today TTS is in pipeline or agent worker

### `POST /api/safety` (future)

- Dedicated safety classifier endpoint; today inline in respond route

### `POST /api/crisis`

- Crisis escalation simulation: handoff state, emergency options payload

### `GET /api/analytics`

- Privacy-safe aggregates for company dashboard only

## Request / Response Conventions

- JSON bodies, `Content-Type: application/json`
- Typed with shared `types/*` interfaces
- Errors: `{ error: string, message?: string, provider?: … }` with appropriate HTTP status
- No employee transcripts or PII in analytics responses

## Environment Variables

See `.env.example` and README. LLM + performance:

```env
AMITY_LLM_PROVIDER=auto
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.0-flash-001
AMITY_LLM_FALLBACK_FREE=false
AMITY_LLM_MAX_TOKENS=220
AMITY_SKIP_SERVER_TTS=true
ELEVENLABS_MODEL=eleven_turbo_v2_5
```

## Security & Privacy

- Server-only API keys
- Safety check on every agent turn before coaching copy
- Crisis path bypasses normal coaching endpoints behavior
- Facial: summarized labels only — never frames

## Role & Identity (demo)

- Identities hardcoded in `lib/demo-identities.ts`; role in `localStorage` (`amity-role`)
- **Privacy boundary:** admin endpoints return aggregates only

## Future Video / Audio Crisis Detection (planned)

Session-analysis service on BP transcript/cues — not implemented; simulated via trigger demo / user messages.

## Implementation Order

1. `triggers` + `employees` (demo store wired)
2. `safety` + `agent/respond` (LLM) ✅
3. `voice` + LiveKit agent worker ✅
4. `recovery-sessions` / avatar-livekit ✅
5. `analytics` + `crisis`
6. Gemini Live streaming (future)
