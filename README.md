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

**Role-based app shell complete** — design system with light/dark themes, reusable components, and full production-quality screens split into a **Company Admin** experience and an **Employee** experience, with role-based navigation and a corrected mobile drawer. Responsive web + mobile. The demo flow is interactive via local state. Real APIs and integrations (Gemini, ElevenLabs, Beyond Presence) are not wired yet.

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
| `/user/trigger-demo` | **Trigger Simulation Portal — employee-side only** |
| `/user/summary` | Private before/after recovery summary |
| `/user/crisis` | Crisis Safety Mode and human handoff |
| `/user/profile` | Personal details and preferences |
| `/user/settings` | Personal privacy / notification / recovery preferences |

The **Trigger Demo belongs to the employee side**. It simulates future signal sources (Apple Watch, WHOOP, Microsoft Teams, Slack, WhatsApp, HR/call-center systems, and in-call video/audio analysis). It is intentionally absent from admin navigation.

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

See `docs/BUILD_PROGRESS.md` for live progress.

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
2. Next.js app shell
3. **Design system and reusable UI components** *(current)*
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
