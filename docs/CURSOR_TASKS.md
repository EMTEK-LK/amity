# Amity — Cursor Task Queue

Work **one task at a time**. Update `docs/BUILD_PROGRESS.md` after each.

## Phase 0 — Foundation ✅

- [x] Folder structure
- [x] Docs + Cursor rules
- [x] Types + lib placeholders

## Phase 1 — App shell

- [ ] `npx create-next-app@latest` (App Router, TS, Tailwind, ESLint)
- [ ] Install `framer-motion`, `recharts`, `lucide-react`
- [ ] Dark theme + global layout
- [ ] `.env.example` for API keys

## Phase 2 — Demo state & engines

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
