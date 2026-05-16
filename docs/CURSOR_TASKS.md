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

## Phase 3 — Demo state & engines

- [ ] Implement `lib/demo-store.ts` (Sarah baseline)
- [ ] Implement `lib/signal-engine.ts`
- [ ] Implement `lib/risk-engine.ts`
- [ ] Wire types to store shape

## Phase 3 — Trigger Portal

- [ ] `/trigger-portal` page + components
- [ ] Mobile stack + desktop 3-column
- [ ] `POST /api/triggers` (thin handler → engines)

## Phase 4 — Recovery flow

- [ ] Session orchestrator in demo store
- [ ] `lib/gemini.ts`, `lib/safety-classifier.ts`
- [ ] `lib/elevenlabs.ts`, `lib/beyond-presence.ts`
- [ ] `/recovery-room` + APIs

## Phase 5 — Summary & dashboard

- [ ] `/summary` before/after UI
- [ ] `/dashboard` Recharts aggregates
- [ ] `GET /api/analytics`

## Phase 6 — Crisis

- [ ] Crisis detection in safety classifier
- [ ] `/crisis` UI + `POST /api/crisis`
- [ ] Block normal agent path when crisis

## Phase 7 — Polish & deploy

- [ ] Demo script walkthrough fixes
- [ ] Vercel deploy
- [ ] README with env setup

## Rules for every task

1. Small, focused diff
2. Keep app runnable
3. Mobile-first
4. Update `BUILD_PROGRESS.md`
5. No medical/therapy positioning copy
