# Amity

## Overview

Amity is a **video-first AI emotional recovery system** for companies. It helps employees during high-pressure emotional moments by receiving stress or emotional trigger signals, calculating emotional risk, and launching a private AI video recovery session.

Amity is **workplace wellbeing support** — not a medical or therapy product. It does not diagnose conditions or replace professional care.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts
- Lucide React
- Gemini API
- ElevenLabs
- Beyond Presence

## Current Build Status

**Recovery Room (Step 6B)** — one **Start live recovery session** action requests camera + microphone together; local **face-api.js** + browser Web Speech transcript feed shared session context. Final speech segments **auto-send** to **`POST /api/agent/respond`** → **Gemini text only**; the typed chatbot is always available as fallback and uses the same route (`source: voice_transcript | typed_input`). **No mock fallback:** `GEMINI_API_KEY` is required; a missing key shows a clear setup error. ElevenLabs is **disabled until Step 7**. Large left panel = avatar output; the small camera signal is local facial awareness. Raw video/audio never sent — summarized cues only; the key stays server-side.

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

See `docs/BUILD_PROGRESS.md` and `docs/ARCHITECTURE.md` for live progress.

## Architecture

Amity is a real-time **emotional recovery** platform (not medical, not therapy). Signals flow through consent gates, merge into shared session context, and drive recovery or crisis paths.

```
User Device → Consent Gate → [Trigger | Facial (optional) | Voice] → Shared Session Context
  → Risk + Safety → Recovery Orchestrator → Gemini + ElevenLabs + Beyond Presence
  → Summary / Privacy-safe Analytics → Crisis Escalation (if needed)
```

## Signal pipelines

| Pipeline | MVP | Future |
|----------|-----|--------|
| **Trigger** | `/user/trigger-demo` — 10 simulated scenarios (wearables, Teams, Slack, calendar, call center, manual, wake word, video/crisis) | Real integrations |
| **Facial awareness** | Optional browser face-api.js → summarized cues in session context — **not diagnosis** | `public/models`, `lib/browser/face-awareness-client.ts` |
| **Voice intelligence** | Mock voice state / transcript snapshot | Gemini Live + WebRTC |

## Shared session context

`SharedSessionContext` (`types/session-context.ts`) holds sessionId, vitals, emotion, voice state, optional facial signal, engagement, risk, safety level, and recommended action. Updated via `lib/session-context.ts` from each pipeline. See `buildSessionContextFromScenario()` for Trigger Demo bridge.

## MVP vs future scope

**MVP (buildathon):** simulated triggers, rule-based risk, shared context object, recovery/crisis UI placeholders, Gemini/ElevenLabs/BP safe placeholders, privacy-safe admin analytics.

**Future production:** face-api.js, Gemini Live streaming, WebRTC, real BP lip-sync, real wearables and workplace tools, production human handoff, enterprise privacy controls.

## Privacy and safety

- **Facial awareness** is optional and requires explicit consent (`types/consent.ts`)
- **Employee sessions** stay private — admin sees aggregates only
- **Crisis mode** stops normal coaching and routes to human escalation simulation
- No medical diagnosis language; visible cues are indicative only

## Recovery Room

**Route:** `/user/recovery` (employee-only). Legacy `/recovery-room` redirects here.

| Feature | MVP status |
|---------|----------------|
| Consent gate | Mic + optional camera; facial awareness consent-based |
| Avatar output (large panel) | Beyond Presence placeholder — **not** the local camera |
| Facial preview (sidebar) | Local face-api.js; summarized cues in session context only |
| Conversation | Text + Web Speech transcript → `POST /api/agent/respond` |
| Gemini | `generateAmityRecoveryResponse()` — real Gemini; **no mock**, requires `GEMINI_API_KEY` (Step 6A) |
| ElevenLabs | Disabled until Step 7 |
| Crisis | Safety classifier on user text → crisis mode → `/user/crisis` (never from face alone) |
| Context | Trigger Demo bridge + live facial/mic summaries |

**Future:** Gemini Live via secure WebSocket relay — see `docs/GEMINI_LIVE_PLAN.md`.

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
  gemini.ts | elevenlabs.ts | beyond-presence.ts  # Layer placeholders
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

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy the example file to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Emotional reasoning, responses, safety, summaries |
| `ELEVENLABS_API_KEY` | Natural recovery voice synthesis |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice selection |
| `BEYOND_PRESENCE_API_KEY` | Video avatar recovery room |
| `BEYOND_PRESENCE_AGENT_ID` | Beyond Presence agent configuration |
| `NEXT_PUBLIC_APP_URL` | App base URL (default `http://localhost:3000`) |

API keys can remain empty for early UI-only development steps.

## Development Steps

1. Foundation — docs, rules, placeholders
2. Next.js app shell + design system
3. Role-based admin/employee UI + Trigger Demo console
4. **Architecture — shared context, pipelines, orchestrator** *(current)*
5. Recovery Room UI (consent gate, BP placeholder, context panel, Gemini/ElevenLabs placeholders)
6. Gemini / ElevenLabs / Beyond Presence real integrations
7. API routes + demo store wiring
8. Landing page polish
9. Deploy and pitch

## Useful Commands

```bash
npm run dev    # Start development server
npm run lint   # Run ESLint
npm run build  # Production build
```

## Demo Scope

- The **Trigger Simulation Portal** simulates future wearable and workplace integrations
- No real Apple Watch, WHOOP, Teams, Slack, WhatsApp, or HR integrations in the MVP
- Real integrations are future scope

## Safety and Privacy Note

- Amity is **not** a medical or therapy product and should **not** diagnose users
- **Crisis mode** escalates to human support when immediate danger is detected — the AI alone is never presented as sufficient
- The **company dashboard** shows privacy-safe aggregated analytics only; employee recovery sessions remain private
