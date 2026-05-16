# Amity — Build Progress

> **Source of truth** for hackathon build status. Update after every completed task.

## Current Status

**Phase:** Recovery Room UI  
**Overall:** Recovery Room UI ready for API / live integration step

## Completed Tasks

- [x] Foundation through architecture (session context, pipelines, orchestrator)
- [x] Employee Trigger Demo — 10 scenarios
- [x] Employee Recovery Room UI (`/user/recovery`)
- [x] Consent gate (mic, optional camera, crisis escalation copy)
- [x] Beyond Presence avatar placeholder panel (Framer Motion pulse)
- [x] Conversation simulation + sample messages + text input
- [x] Shared session context panel (+ collapsible dev JSON)
- [x] Signal status panel (trigger, voice, facial)
- [x] ElevenLabs voice output placeholder + waveform animation
- [x] Safety status + crisis routing to `/user/crisis`
- [x] Session controls (start, pause, complete, reset)
- [x] Trigger Demo → Recovery context bridge (`sessionStorage`)
- [x] `/recovery-room` redirects to `/user/recovery`
- [x] Docs updated

## Current Task

**None** — Step 5 complete.

## Next Task

**Step 6: Mock API routes and demo store**

- `POST` recovery sessions, agent responses, voice generation
- Wire demo store to session context
- Optional summary persistence

## Issues / Blockers

None.

## Testing Status

| Check | Status |
|-------|--------|
| `npm run dev` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass (23 routes) |
| `/user/recovery` consent flow | Pass |
| Crisis sample message | Pass |
| `/recovery-room` redirect | Pass |
| Mobile layout | Manual check recommended |

## Notes

- Crisis keyword: “not safe” and full crisis sample message activate crisis mode.
- `generateSupportResponse` and `synthesizeRecoveryVoice` are safe placeholders.

---

*Last updated: Recovery Room UI (Step 5)*
