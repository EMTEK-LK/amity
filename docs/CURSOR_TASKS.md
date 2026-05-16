# Amity — Cursor Task Queue

Work **one task at a time**. Update `docs/BUILD_PROGRESS.md` after each.

## Phase 0 — Foundation ✅

- [x] Folder structure
- [x] Docs + Cursor rules
- [x] Types + lib placeholders

## Phase 1 — App shell ✅

- [x] Next.js App Router setup (manual init — preserved existing folders)
- [x] Install `framer-motion`, `recharts`, `lucide-react`, `clsx`, `tailwind-merge`
- [x] Dark theme + global layout + navigation stubs
- [x] `.env.example` for API keys
- [x] README + minimal home page

## Phase 2 — Design system ✅

- [x] Light/dark theme CSS variables + toggle
- [x] Reusable UI components (Button, Card, Badge, etc.)
- [x] Mobile-first header/navigation
- [x] Professional placeholder pages

## Phase 2.5 — Role-based architecture ✅

- [x] Hardcoded demo identities (`lib/demo-identities.ts`) + `types/identity.ts`, `types/navigation.ts`
- [x] `RoleProvider` + `RoleSwitcher` (localStorage, no auth)
- [x] Admin (`/admin/*`) and employee (`/user/*`) route structure
- [x] Role-based desktop nav + left-side mobile drawer (left → right)
- [x] Trigger Demo moved to employee side only
- [x] Legacy route redirects
- [x] Future video/audio crisis detection documented

## Phase 2.6 — Navigation correction ✅

- [x] One account dropdown (`AccountMenu`) replaces separate role buttons / chips
- [x] Employee Trigger Demo → single primary CTA (removed from nav)
- [x] Admin "Open Dashboard" CTA removed (Dashboard already in nav)
- [x] Role-aware home (admin company overview vs employee recovery)
- [x] Mobile drawer holds account selector + nav + primary action + privacy footer
- [x] `/admin` demo gate (`app/admin/layout.tsx`)
- [x] `getDemoIdentityByRole`, `ROLE_LABELS` centralized

## Phase 3 — Employee Trigger Demo ✅

- [x] `lib/demo-trigger-scenarios.ts` — 10 scenarios, payload + timeline builders
- [x] `/user/trigger-demo` — full simulation console
- [x] Crisis → `/user/crisis`; recovery → `/user/recovery`

## Phase 4 — Architecture ✅

- [x] `SharedSessionContext` + pipeline placeholders
- [x] Consent, facial awareness, voice session types/libs
- [x] Recovery orchestrator + crisis escalation
- [x] Safe lib returns (no throwing stubs)
- [x] `docs/ARCHITECTURE.md` + README architecture sections

## Phase 5 — Recovery Room UI ✅

- [x] Consent gate, avatar panel, conversation, voice placeholder
- [x] Shared context, signal status, safety + crisis routing
- [x] Session controls + Trigger Demo context bridge

## Phase 6 — Mock API routes & demo store

- [ ] Implement `lib/demo-store.ts` (Sarah baseline)
- [ ] Implement `lib/signal-engine.ts` / `lib/risk-engine.ts` (server-side)
- [ ] `POST /api/triggers` (thin handler → engines)

## Phase 7 — Real integrations

- [ ] Session orchestrator in demo store
- [ ] `lib/gemini.ts`, `lib/safety-classifier.ts`
- [ ] `lib/elevenlabs.ts`, `lib/beyond-presence.ts`
- [ ] `/recovery-room` + APIs

## Phase 8 — Summary & dashboard

- [ ] `/summary` before/after UI
- [ ] `/dashboard` Recharts aggregates
- [ ] `GET /api/analytics`

## Phase 9 — Crisis (enhance)

- [ ] Crisis detection in safety classifier
- [ ] `/crisis` UI + `POST /api/crisis`
- [ ] Block normal agent path when crisis

## Phase 10 — Polish & deploy

- [ ] Demo script walkthrough fixes
- [ ] Vercel deploy
- [ ] README with env setup

## Rules for every task

1. Small, focused diff
2. Keep app runnable
3. Mobile-first
4. Update `BUILD_PROGRESS.md`
5. No medical/therapy positioning copy
