# Amity

## Overview

Amity is a **video-first AI emotional recovery system** for companies. It helps employees during high-pressure emotional moments by receiving stress or emotional trigger signals, calculating emotional risk, and launching a private AI video recovery session.

Amity is **workplace wellbeing support** — not a medical or therapy product. It does not diagnose conditions or replace professional care.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- Gemini / OpenRouter (LLM)
- ElevenLabs (voice)
- Beyond Presence + **LiveKit Agents** (lip-synced avatar)
- LiveKit Cloud (WebRTC rooms)

## Current Build Status

**Final product polish** — recovery-first home (Start a Private Recovery Call), clean user-facing copy (no dev/env/API terms in the main UI; technical detail only in collapsed previews), consolidated recovery right column (Session Controls, Session Snapshot, Local Signal, Safety & Support, Voice), polished trigger simulation (collapsed demo signal preview), and a calm crisis support page with configurable emergency options.

**Incoming Recovery Call** — when a high-risk Trigger Demo scenario is selected, Amity simulates a proactive in-app recovery call: a calm ringing screen ("Amity Recovery Guide is calling") with the scenario context and risk label. Answering opens the Recovery Room with that context preloaded (session banner + context-aware welcome); declining keeps the demo usable. Crisis scenarios route to the Crisis Safety Flow instead. This is an in-app simulation — not a real phone call, and Amity is not an emergency service.

**Recovery Room (Step 8)** — unified live session with camera + mic, live transcript, and typed chat → recovery agent (one turn = one request; summarized context only). When configured, a lip-synced avatar speaks via the local agent worker. See **`docs/LLM_AND_RECOVERY_PIPELINE.md`** and **`docs/RECOVERY_AVATAR.md`**.

| Feature | Status |
|---------|--------|
| LLM coaching | Gemini + OpenRouter (`AMITY_LLM_PROVIDER`, auto-fallback on quota) |
| Voice | Agent worker TTS (LiveKit); ElevenLabs server fallback when lip-sync off |
| Lip-sync avatar | LiveKit + Bey (`agent-worker/`) |
| Facial cues | Browser face-api.js → labels per turn (never raw video) |
| Crisis safety | Text classifier → Crisis Safety Mode |
| Admin dashboard | Aggregates only — no session transcripts |

## Role-Based Demo Architecture

Amity has two distinct experiences. **One professional account dropdown** in the header (showing the active identity name + role, with a `ChevronDown`) switches between them — demo only, no real authentication; persisted in `localStorage` under `amity-role`. There are no separate Admin/Employee buttons. On mobile the same selector lives inside the left drawer.

### Admin view (company)

Company-level, privacy-safe information only.

| Route | Purpose |
|-------|---------|
| `/admin` | Redirects to the admin dashboard |
| `/admin/dashboard` | Aggregated wellbeing KPIs and trends |
| `/admin/employees` | High-level employee status only — no private content |
| `/admin/analytics` | Anonymized organization analytics |
| `/admin/summary` | Privacy-safe company recap |
| `/admin/settings` | Company, privacy, escalation, integration placeholders |

Admins never see transcripts, personal confessions, individual sensitive detail, medical labels, or crisis messages.

### Employee view (user)

A personal wellbeing space, private to the employee.

| Route | Purpose |
|-------|---------|
| `/user` | Redirects to the employee dashboard |
| `/user/dashboard` | Personal wellbeing state and quick actions |
| `/user/recovery` | Private AI video recovery session |
| `/user/trigger-demo` | **Signal simulation console — employee-side only** (10 scenarios, JSON preview) |
| `/user/summary` | Private before/after recovery summary |
| `/user/crisis` | Crisis Safety Mode and human handoff |
| `/user/profile` | Personal details and preferences |
| `/user/settings` | Personal privacy / notification / recovery preferences |

The **Trigger Demo** (`/user/trigger-demo`) is employee-side only. It simulates future signals from wearables (Apple Watch, WHOOP), workplace tools (Microsoft Teams, Slack, WhatsApp, calendar), call center, CRM, manual in-app request, wake word, future BP video/audio analysis, and safety classifier crisis detection. Scenarios are config-driven in `lib/demo-trigger-scenarios.ts`. Crisis scenarios route to `/user/crisis`; others route to `/user/recovery`. JSON payload preview demonstrates future API readiness. No real integrations in MVP.

### Hardcoded demo identities

Defined in `lib/demo-identities.ts`:

- **Admin** — `ADMIN-001`, Admin User, Company Admin, Amity Demo Company, admin@amity.demo
- **Employee** — `EMP-001`, Sarah Perera, Customer Support Agent, Customer Care, sarah@amity.demo, status Stable

### Navigation structure

- **Desktop:** `Amity | role-specific nav | [Account ▾] [Theme]` — plus a single primary CTA only in employee mode.
  - **Admin nav:** Home · Dashboard · Employees · Analytics · Summary · Settings. **No primary CTA** (Dashboard is already in nav).
  - **Employee nav:** Home · My Dashboard · Recovery · My Summary · Crisis Support · Profile. **Trigger Demo is not a nav item** — it is the single primary CTA on the right.
- **Mobile:** hamburger on the **left** beside a compact logo; theme toggle + a compact profile icon on the right. A drawer **slides left → right** containing the Amity brand, close button, role/profile summary, account/role selector, role-specific nav, the primary action (employee only), and a privacy footer. It closes on navigation. Desktop links are never duplicated on mobile.
- Opening `/admin` while the employee role is selected shows a polished "switch to Company Admin" notice (demo gate, not real auth).

### Future video / audio crisis detection

Planned (not implemented): during a Beyond Presence recovery call, Amity will receive speech transcript, emotional cues, and session signals. If self-harm intent, crisis language, unsafe behavior, severe distress, or violence risk is detected, Crisis Safety Mode activates automatically — coaching stops, live human handoff begins, emergency options appear, and the user stays engaged until handoff. Today the Trigger Demo and user messages simulate these events.

## Legacy routes

Old routes redirect into the new structure: `/dashboard → /admin/dashboard`, `/trigger-portal → /user/trigger-demo`, `/recovery-room → /user/recovery`, `/crisis → /user/crisis`. `/summary` offers links to both the employee and company summaries.

See `docs/BUILD_PROGRESS.md`, `docs/ARCHITECTURE.md`, and `docs/RECOVERY_AVATAR.md` for details.
The official Cursor Buildathon submission write-up is `docs/CURSOR_BUILDATHON_SUBMISSION.md`.

## Architecture

Amity is a real-time **emotional recovery** platform (not medical, not therapy). Signals flow through consent gates, merge into shared session context, and drive recovery or crisis paths.

```
User Device → Consent Gate → [Trigger | Facial (optional) | Voice] → Shared Session Context
  → Risk + Safety → POST /api/agent/respond (LLM turn) → LiveKit speak OR ElevenLabs fallback
  → Summary / Privacy-safe Analytics → Crisis Escalation (if needed)
```

## Signal pipelines

| Pipeline | MVP | Future |
|----------|-----|--------|
| **Trigger** | `/user/trigger-demo` — 10 simulated scenarios (wearables, Teams, Slack, calendar, call center, manual, wake word, video/crisis) | Real integrations |
| **Facial awareness** | face-api.js ~1s locally → labels sent **per user message** to LLM — **not diagnosis** | `docs/FACIAL_AWARENESS.md` |
| **Voice intelligence** | Web Speech → debounced turn → same `/api/agent/respond` route | Gemini Live (future) |

## Shared session context

`SharedSessionContext` (`types/session-context.ts`) holds sessionId, vitals, emotion, voice state, optional facial signal, engagement, risk, safety level, and recommended action. Updated via `lib/session-context.ts` from each pipeline. See `buildSessionContextFromScenario()` for Trigger Demo bridge.

## MVP vs future scope

**MVP (buildathon):** simulated triggers, rule-based risk, shared context, LiveKit + Bey lip-sync via local agent worker, ElevenLabs fallback, privacy-safe admin analytics.

**Future production:** hosted agent worker, Gemini Live streaming, real wearables and workplace tools, production human handoff, enterprise privacy controls.

## Privacy and safety

- **Facial awareness** is optional and requires explicit consent (`types/consent.ts`)
- **Employee sessions** stay private — admin sees aggregates only
- **Crisis mode** stops normal coaching and routes to human escalation simulation
- **Crisis Safety Modal** — when the safety classifier flags crisis language in the Recovery Room, a calm modal opens immediately with emergency support options and a persistent crisis banner; "Stay with Amity" keeps the banner, "Open Crisis Safety Flow" routes to `/user/crisis`
- Emergency numbers are configurable by company/country; the Sri Lanka demo uses **119** (police) and **1990** (emergency medical). Human handoff is simulated in this MVP — **Amity is not an emergency service and does not call anyone automatically**
- No medical diagnosis language; visible cues are indicative only; crisis is never triggered by facial expression alone

## Recovery Room

**Route:** `/user/recovery` (employee-only). Legacy `/recovery-room` redirects here.

| Feature | Status |
|---------|--------|
| Consent gate | Mic + optional camera; facial awareness consent-based |
| Avatar (large panel) | **LiveKit + Bey lip-sync** when configured; else coach stage + ElevenLabs |
| Facial preview | Local face-api.js; summarized cues only — not sent raw to LLM |
| Conversation | Text + Web Speech (debounced chunks) → one API call per turn |
| LLM | `buildRecoveryPrompt()` — Gemini and/or OpenRouter; see `docs/LLM_AND_RECOVERY_PIPELINE.md` |
| Voice | Lip-sync via agent worker; server ElevenLabs only when LiveKit unavailable |
| Agent worker | `npm run agent:dev` — **required** for lip-sync (see `agent-worker/README.md`) |
| Crisis | Safety classifier on user text → `/user/crisis` |

**Architecture:** `docs/RECOVERY_AVATAR.md` · **Progress:** `docs/BUILD_PROGRESS.md`

## Folder structure (core lib)

```
lib/
  session-context.ts      # Shared context merge + updates
  consent-manager.ts      # Consent defaults and gates
  facial-awareness.ts     # Server-safe mock cues (trigger demo)
  browser/face-awareness-client.ts  # face-api.js (browser only)
  gemini-session-context.ts         # buildGeminiSessionContextPayload()
  voice-session.ts          # Voice pipeline (placeholder)
  recovery-orchestrator.ts  # Gemini / ElevenLabs / BP plan
  crisis-escalation.ts      # Crisis path
  risk-engine.ts            # Rule-based risk + crisis check
  signal-engine.ts          # Trigger → twin mapping
  demo-trigger-scenarios.ts # 10 scenarios + payloads
  demo-recovery-responses.ts # Conversation + voice mode mapping
  recovery-session-bridge.ts # sessionStorage context from Trigger Demo
  demo-store.ts             # In-memory demo state
  recovery-pipeline.ts      # LLM + optional voice + avatar per reply
  recovery-performance.ts   # Skip server TTS, token limits
  recovery-llm-prompt.ts    # Amity persona + context for LLM
  livekit-avatar-session.ts # Browser LiveKit + speak
  livekit-agent-dispatch.ts # Agent worker dispatch
  gemini.ts | elevenlabs.ts | beyond-presence.ts
agent-worker/main.ts        # LiveKit agent (Bey lip-sync)
components/recovery/        # Recovery Room UI panels
types/
  consent.ts | session-context.ts | facial-awareness.ts | voice.ts | analytics.ts
```

## Design System

Amity uses a **premium SaaS design language** inspired by modern AI customer-support products — soft blues, rounded cards, subtle shadows, and clean typography.

### Theme support

- **Light mode:** airy soft blue-white backgrounds (`#F6FBFF`), white surfaces, clean blue primary
- **Dark mode:** deep navy backgrounds (`#07111F`), elevated cards, soft blue glow accents
- Toggle via **sun/moon icon** in the header; preference persists in `localStorage`
- Respects system preference on first visit (no flash via inline theme script)

### Mobile-first rules

- Single-column stacked layouts on small screens
- Minimum ~44px tap targets on buttons and nav items
- Horizontal scroll nav chips on mobile; full nav on desktop
- Full-width primary actions where appropriate
- Readable text from 360px width upward

### Reusable components (`components/ui/`)

| Component | Use for |
|-----------|---------|
| `Button` / `ButtonLink` | Actions — variants: primary, secondary, ghost, danger, soft |
| `Card` | Content panels — variants: default, elevated, soft, glass, danger |
| `Badge` | Labels — neutral, success, warning, danger, info, primary |
| `StatusChip` | Employee/risk states — Stable, Watch, Recovery Needed, Crisis, etc. |
| `MetricCard` | KPI displays with optional icon and trend |
| `SectionHeader` | Page section titles with eyebrow and action slot |
| `PageContainer` | Responsive page wrapper |
| `ProgressBar` | Stress score / recovery progress |
| `Skeleton` | Loading placeholders |
| `EmptyState` | Empty views with icon and CTA |
| `Surface` | Elevated background sections |

### Example usage

```tsx
import { Button, Card, CardContent, MetricCard, PageContainer } from '@/components/ui';

<PageContainer>
  <MetricCard label="Stress score" value="24" tone="primary" />
  <Card variant="elevated">
    <CardContent>Content here</CardContent>
  </Card>
  <Button variant="primary" size="lg" fullWidth>Start recovery</Button>
</PageContainer>
```

Step 3 added **design foundations only** — not feature pages or API logic.

## Setup Instructions

### 1. Install dependencies

```bash
npm install
npm run agent:install   # once — installs agent-worker packages
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill in keys (see table below). The agent worker reads the same `/.env.local` at the repo root.

### 3. Run the app

**Recovery Room with lip-sync requires two processes:**

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — LiveKit agent (Bey lip-sync)
npm run agent:dev
```

**Or one command:**

```bash
npm run recovery:dev
```

Open [http://localhost:3000](http://localhost:3000) → Employee → **Recovery** (or `/user/recovery`).

### 4. Verify lip-sync

1. Accept consent and start the live session.
2. Send a chat message.
3. **Agent terminal** should log: `joining room` → `speak start` → `speak done`.
4. **Browser** badge: **Lip-sync live**; avatar speaks with synced mouth movement.

If you only see idle avatar video with no speech, the agent worker is not in the room — restart `npm run agent:dev`. See **`agent-worker/README.md`** troubleshooting.

## Environment Variables

| Variable | Required for | Purpose |
|----------|----------------|---------|
| `AMITY_LLM_PROVIDER` | LLM | `auto` \| `gemini` \| `openrouter` |
| `GEMINI_API_KEY` | LLM | Direct Gemini API |
| `GEMINI_MODEL` | LLM | e.g. `gemini-2.0-flash` |
| `OPENROUTER_API_KEY` | LLM backup | Used when provider is `openrouter` or Gemini quota fails |
| `OPENROUTER_MODEL` | LLM | Prefer fast model (e.g. `google/gemini-2.0-flash-001`); avoid slow `openrouter/free` |
| `AMITY_LLM_FALLBACK_FREE` | Optional | `true` = retry on `openrouter/free` (slow) |
| `AMITY_LLM_MAX_TOKENS` | Optional | Cap coaching JSON size (default 220) |
| `AMITY_SKIP_SERVER_TTS` | Optional | Skip API ElevenLabs when LiveKit speaks (auto if LiveKit set) |
| `ELEVENLABS_API_KEY` | Voice | Agent worker TTS + server fallback |
| `ELEVENLABS_VOICE_ID` | Voice | Same voice in API and agent |
| `ELEVENLABS_MODEL` | Voice | Default `eleven_turbo_v2_5` for fallback path |
| `BEYOND_PRESENCE_API_KEY` | Lip-sync | Bey plugin in agent worker |
| `BEYOND_PRESENCE_AGENT_ID` | Config | Bey agent metadata |
| `BEYOND_PRESENCE_AVATAR_ID` | Lip-sync | Avatar ID for Bey session |
| `LIVEKIT_URL` | Lip-sync | LiveKit Cloud WebSocket URL |
| `LIVEKIT_API_KEY` | Lip-sync | Server + agent worker |
| `LIVEKIT_API_SECRET` | Lip-sync | Server + agent worker |
| `NEXT_PUBLIC_APP_URL` | App | Base URL (default `http://localhost:3000`) |
| `BEYOND_PRESENCE_EMBED_IFRAME` | Optional | `true` = full Bey iframe instead of LiveKit mode |

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run agent:install` | Install `agent-worker` dependencies |
| `npm run agent:dev` | LiveKit agent worker (lip-sync) |
| `npm run agent:start` | Agent worker production mode |
| `npm run recovery:dev` | `dev` + `agent:dev` together |

## Documentation

| Doc | Contents |
|-----|----------|
| [`docs/BUILD_PROGRESS.md`](docs/BUILD_PROGRESS.md) | Task status and testing |
| [`docs/LLM_AND_RECOVERY_PIPELINE.md`](docs/LLM_AND_RECOVERY_PIPELINE.md) | LLM providers, turn model, latency, env |
| [`docs/RECOVERY_AVATAR.md`](docs/RECOVERY_AVATAR.md) | Lip-sync pipeline, debugging |
| [`docs/FACIAL_AWARENESS.md`](docs/FACIAL_AWARENESS.md) | face-api.js, privacy, LLM labels |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture |
| [`agent-worker/README.md`](agent-worker/README.md) | Agent worker setup |
| [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) | 5–7 min demo script |

## Development milestones

1. Foundation — docs, rules, design system
2. Role-based admin/employee UI + Trigger Demo
3. Shared context, orchestrator, risk engine
4. Recovery Room UI + consent + media session
5. LLM integration (Gemini / OpenRouter)
6. ElevenLabs voice + recovery pipeline
7. **LiveKit + Beyond Presence lip-sync** *(current)*
8. Deploy and pitch

## Demo Scope

- The **Trigger Simulation Portal** simulates future wearable and workplace integrations
- No real Apple Watch, WHOOP, Teams, Slack, WhatsApp, or HR integrations in the MVP
- Real integrations are future scope

## Safety and Privacy Note

- Amity is **not** a medical or therapy product and should **not** diagnose users
- **Crisis mode** escalates to human support when immediate danger is detected — the AI alone is never presented as sufficient
- The **company dashboard** shows privacy-safe aggregated analytics only; employee recovery sessions remain private
