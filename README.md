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

**Step 2 complete** — the Next.js app shell is initialized with dark-first styling, base layout, navigation stubs, and a minimal home page. Dashboard, Trigger Portal, APIs, and integrations are not built yet.

See `docs/BUILD_PROGRESS.md` for live progress.

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
2. **Next.js app shell** *(current)*
3. Design system and reusable UI components
4. Landing page
5. Company dashboard
6. Trigger Simulation Portal UI
7. Smartwatch / wellness circle
8. Trigger data, JSON preview, Signal Engine, Risk Engine
9. API routes and demo store
10. Recovery Room
11. Gemini integration
12. ElevenLabs integration
13. Beyond Presence adapter / avatar frame
14. Recovery summary
15. Crisis escalation flow
16. Mobile polish
17. Deploy and prepare pitch

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
