# Amity — API Plan

## Overview

Next.js Route Handlers under `app/api/`. Demo uses in-memory `demo-store` first; APIs wrap lib modules for client components and future persistence.

## Endpoints (planned)

### `GET/POST /api/employees`

- Demo employee profile (Sarah)
- Update emotional twin state after triggers

### `POST /api/triggers`

- Accept simulated trigger payload from Trigger Portal
- Run signal engine → risk engine → return updated state + recommendation

### `POST/GET /api/recovery-sessions`

- Start session (orchestrator → Beyond Presence room config)
- End session → trigger summary generation

### `POST /api/agent`

- Gemini: emotional support response, session summary
- Input: context, risk level, trigger category (no full transcript to analytics)

### `POST /api/voice`

- ElevenLabs: synthesize recovery line from agent text
- Return audio URL or stream for recovery room

### `POST /api/safety`

- Gemini safety classifier: normal vs crisis
- Returns `{ mode: 'normal' | 'crisis', flags: string[] }`

### `POST /api/crisis`

- Crisis escalation simulation: handoff state, emergency options payload

### `GET /api/analytics`

- Privacy-safe aggregates for company dashboard only

## Request / Response Conventions

- JSON bodies, `Content-Type: application/json`
- Typed with shared `types/*` interfaces
- Errors: `{ error: string, code?: string }` with appropriate HTTP status
- No employee transcripts or PII in analytics responses

## Environment Variables (planned)

```env
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
BEYOND_PRESENCE_API_KEY=
BEYOND_PRESENCE_AGENT_ID=
```

## Security & Privacy

- Server-only API keys
- Safety check on every agent turn before coaching copy
- Crisis path bypasses normal coaching endpoints behavior
- Rate limiting optional for demo (Vercel edge config later)

## Role & Identity (demo)

- Identities hardcoded in `lib/demo-identities.ts` (`DemoAdmin` `ADMIN-001`, `DemoEmployee` `EMP-001`); no auth endpoints in the buildathon.
- Role (`admin` \| `employee`) is client state persisted in `localStorage` (`amity-role`) via `RoleProvider`; switched through a single account dropdown. Role-aware nav config: `lib/navigation.ts` (`getRoleNavigation`); identities: `getDemoIdentityByRole`.
- `/admin/*` is wrapped by a client demo gate (`app/admin/layout.tsx`) that prompts a role switch when the employee role is active — placeholder for future server-side authorization.
- **Privacy boundary:** `GET /api/analytics` and any admin-facing endpoint return aggregates only — never transcripts, personal confessions, medical labels, or crisis messages. Employee-private fields (e.g. `agentSummaryPrivate`) are excluded from admin responses.

## Service Areas (architecture)

Frontend: admin experience · employee experience · shared shell · shared design system.
Backend/service (planned): demo identity store · role/session state · trigger service · signal engine · risk engine · recovery session service · BP session adapter · Gemini agent service · ElevenLabs voice service · safety classifier · crisis escalation service · analytics service.

## Future Video / Audio Crisis Detection (planned)

A future session-analysis service consumes BP transcript/emotional cues/session signals. On crisis signal → calls the crisis escalation service, bypasses normal `agent` coaching, returns emergency options + handoff state, and keeps the user engaged until handoff. Not implemented in the buildathon — simulated via trigger demo / user messages.

## Implementation Order

1. `triggers` + `employees` (demo store wired)
2. `safety` + `agent` (Gemini)
3. `voice` (ElevenLabs)
4. `recovery-sessions` (Beyond Presence config)
5. `analytics` + `crisis`
6. session-analysis service (future video/audio crisis detection)
