# Amity — Build Progress

> **Source of truth** for hackathon build status. Update after every completed task.

## Current Status

**Phase:** App shell  
**Overall:** App shell ready — runnable Next.js project with dark-first layout and navigation stubs

## Completed Tasks

- [x] Repository folder structure (`app/`, `components/`, `lib/`, `types/`, `docs/`, `.cursor/rules/`)
- [x] Project documentation (`PROJECT_PLAN`, `API_PLAN`, `UI_PLAN`, `DEMO_SCRIPT`, `CURSOR_TASKS`)
- [x] Cursor rules (`.cursor/rules/amity.mdc`)
- [x] TypeScript type placeholders (`types/`)
- [x] Library module placeholders (`lib/`)
- [x] Next.js app shell initialized (`package.json`, `tsconfig`, Tailwind v4, ESLint)
- [x] Dependencies installed (framer-motion, recharts, lucide-react, clsx, tailwind-merge)
- [x] Base layout created (`AppShell`, `Header`, `Navigation`)
- [x] Minimal home page created (`app/page.tsx`)
- [x] Route placeholders for nav targets (dashboard, trigger-portal, recovery-room, summary, crisis)
- [x] Environment example created (`.env.example`)
- [x] README updated with setup instructions

## Current Task

**None** — Step 2 complete. Ready for Step 3.

## Next Task

**Step 3: Design system and reusable UI components**

1. `components/ui/` — Button, Card, Badge, Progress, Skeleton
2. Align tokens with `docs/UI_PLAN.md`
3. Update this file

## Issues / Blockers

None.

## Testing Status

| Check | Status |
|-------|--------|
| `npm install` | Pass |
| `npm run dev` | Pass (starts on port 3000) |
| `npm run lint` | Pass (warnings only in lib placeholders) |
| `npm run build` | Pass |
| Mobile layout (home + nav) | Manual check recommended at 375px width |

## Notes

- `create-next-app` could not run in non-empty folder — Next.js was configured manually to preserve existing structure.
- API route folders retain `.gitkeep` until route handlers are added in Step 9.
- Do **not** implement Gemini, ElevenLabs, or Beyond Presence until orchestration layer exists.

---

*Last updated: Step 2 — Next.js app shell (2026-05-16)*
