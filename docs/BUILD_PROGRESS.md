# Amity — Build Progress

> **Source of truth** for hackathon build status.

## Current Status

**Phase:** Incoming Recovery Call  
**Overall:** Trigger Demo now connects high-risk signals to a proactive in-app recovery call flow

## Completed Tasks (Incoming Recovery Call)

- [x] Incoming Recovery Call flow added (`components/recovery/IncomingRecoveryCall.tsx`, `IncomingCallPulse.tsx`)
- [x] High-risk trigger scenarios launch ringing call UI (auto-call after 800ms, toggle, manual simulate)
- [x] Answering the call opens Recovery Room with selected scenario context
- [x] Recovery handoff context persisted locally (`lib/recovery-session-handoff.ts`, `types/recovery-handoff.ts`)
- [x] Recovery Room shows "Recovery call started from …" banner + context-aware welcome
- [x] Crisis scenarios route to Crisis Safety Flow (no normal-recovery-only path); crisis handoff opens crisis modal
- [x] Trigger Demo recovery-call panel added near the risk decision
- [x] Decline → dismissed message; low-risk → no auto-call (manual Start Recovery preserved)
- [x] Mobile incoming-call UI (bottom sheet, large tap targets)
- [x] Docs updated

## Completed Tasks (Crisis Safety Modal)

- [x] Crisis Safety Modal added (`components/crisis/CrisisSafetyModal.tsx`)
- [x] Crisis banner added to Recovery Room (`components/crisis/CrisisBanner.tsx`)
- [x] Reusable emergency support cards (`components/crisis/CrisisActionCard.tsx`)
- [x] Sri Lanka demo support numbers added as configurable options (119, 1990)
- [x] Wellbeing officer handoff demo state ("Wellbeing officer handoff prepared")
- [x] Crisis modal integrated with safety classifier response (`safetyLevel: crisis` / `open_crisis_flow`)
- [x] Stay-in-session keeps banner; "Show support options" reopens modal; reset clears both
- [x] Crisis page polished (119 / 1990 / wellbeing officer / trusted contact / return / "I am safe now")
- [x] Docs updated

## Completed Tasks (Header Restore)

- [x] Header navigation restored to previous clean role-based version
- [x] Trigger Demo removed from normal employee nav
- [x] Employee Trigger Demo kept as separate primary CTA (`/user/trigger-demo`)
- [x] Admin nav kept company-only (no Trigger Demo, no extra Dashboard CTA)
- [x] Mobile drawer navigation corrected (role-specific nav; Trigger Demo as drawer primary action)
- [x] Page-level final polish (home, recovery, trigger demo, crisis) preserved

## Completed Tasks (Final Polish)

- [x] Home CTA changed to recovery-first ("Start a Private Recovery Call" / "View My Dashboard")
- [x] Header reverted to previous clean nav (employee CTA = Trigger Demo; no Trigger Simulation nav item)
- [x] Recovery page user-facing copy cleaned — no npm/env/API/dev text in main UI
- [x] Developer/internal labels removed from main UI (dev details only in collapsed previews)
- [x] Recovery right-side panels consolidated; compact `SessionSnapshotCard` replaces the long signal list
- [x] Safety & Support card copy improved
- [x] Crisis support improved — configurable emergency options (SL demo: 119, 1990), `tel:` links, wellbeing officer + trusted contact placeholders, "Return to recovery" / "I am safe now"
- [x] Trigger Demo copy cleaned ("Risk decision", "Demo signal preview"); JSON collapsed by default
- [x] Mobile + desktop layout polished
- [x] Docs updated

## Completed Tasks (Step 6A)

- [x] Recovery Room sends text/transcript + facial signal to LLM
- [x] `/api/agent/respond` returns coaching text + provider status
- [x] No mock LLM fallback when keys missing — clear setup error
- [x] Speech transcript → user message; Gemini context preview
- [x] Crisis language → crisis-safe response

## Completed Tasks (Step 6B)

- [x] Unified live recovery session (`useRecoveryMediaSession`)
- [x] Camera + microphone from one session action
- [x] Speech auto-send (debounced); typed chat same route
- [x] Facial signal in Gemini context; signal status panel
- [x] Avatar vs local camera clarified

## Completed Tasks (Step 7 — Voice)

- [x] ElevenLabs TTS after LLM (`lib/recovery-pipeline.ts`, `lib/elevenlabs.ts`)
- [x] `voiceOutput` playback hook (`hooks/useRecoveryVoicePlayback.ts`)
- [x] Voice mode mapping (calm / crisis) from stress + safety
- [x] `ELEVENLABS_VOICE_ID` for consistent voice selection

## Completed Tasks (Step 8 — Lip-sync avatar)

- [x] LiveKit Cloud room + browser token (`lib/livekit-room.ts`)
- [x] Agent dispatch with stale-job recovery (`lib/livekit-agent-dispatch.ts`)
- [x] `agent-worker/` — LiveKit Agents + Bey + ElevenLabs TTS
- [x] Browser session singleton (`lib/livekit-avatar-session.ts`)
- [x] `publishData` topic `amity/speak` → agent `say()` → Bey lip-sync
- [x] `LiveKitAvatarVideo` + page-level session retain (no disconnect loops)
- [x] ElevenLabs fallback only when lip-sync unavailable (no double audio)
- [x] Request ID dedupe (browser + agent) — single speak per reply
- [x] Docs: `docs/RECOVERY_AVATAR.md`, README, agent-worker README

## Completed Tasks (Performance — respond latency)

- [x] Skip server ElevenLabs when LiveKit configured (`lib/recovery-performance.ts`)
- [x] LLM + Beyond Presence config in parallel (`runRecoveryPipeline`)
- [x] Cached Beyond Presence agent metadata (5 min TTL)
- [x] OpenRouter: JSON-first, no slow `openrouter/free` fallback unless `AMITY_LLM_FALLBACK_FREE=true`
- [x] ElevenLabs turbo model default (`ELEVENLABS_MODEL=eleven_turbo_v2_5`) for stage/fallback path
- [x] Lower default LLM max tokens (`AMITY_LLM_MAX_TOKENS`)

## Next Task

- [ ] Final demo rehearsal and submission review
- [ ] Optional ElevenLabs / Beyond Presence integration only if time allows
- [ ] Production deploy checklist (env vars, agent worker hosting)
- [ ] Gemini Live streaming (see `docs/GEMINI_LIVE_PLAN.md`)

## How to run (Recovery + lip-sync)

```bash
npm install
npm run agent:install   # once
cp .env.example .env.local   # fill keys

# Two terminals:
npm run dev
npm run agent:dev

# Or one command:
npm run recovery:dev
```

Open `/user/recovery` — requires `GEMINI_*` or `OPENROUTER_*`, `ELEVENLABS_*`, `LIVEKIT_*`, `BEYOND_PRESENCE_*`.

## Testing Status

| Check | Status |
|-------|--------|
| `npm run dev` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass (27 routes) |
| High-risk scenario → incoming call rings | Pass |
| Answer → Recovery Room with scenario context + welcome | Pass |
| Decline → dismissed message; manual simulate works | Pass |
| Low-risk → no auto-call; Start Recovery preserved | Pass |
| Crisis scenario → Crisis Safety Flow (no normal-only) | Pass |
| Incoming call mobile 360 / 390 / 430 | Reviewed |
| Crisis phrase in Recovery Room → modal opens | Pass |
| Modal: 119 / 1990 tel links, wellbeing officer, stay-in-session | Pass |
| Stay-in-session keeps crisis banner; reopen from banner | Pass |
| Open Crisis Safety Flow → `/user/crisis` | Pass |
| Mobile modal 360 / 390 / 430 | Reviewed |
| Desktop header — employee mode (nav + Trigger Demo CTA) | Pass |
| Desktop header — admin mode (nav, no CTA) | Pass |
| Mobile drawer — role-specific nav only | Pass |
| `/` recovery-first CTA | Pass |
| `/user/recovery` — no dev text in main UI | Pass |
| `/user/trigger-demo` — JSON collapsed | Pass |
| `/user/crisis` — emergency options + tel links | Pass |
| Mobile 360 / 390 / 430 | Reviewed |
| Desktop 1280 / 1440 | Reviewed |
| Crisis flow | Manual |
| Admin aggregates only (no transcripts) | Manual |

## Notes

- Employee sessions are private; dashboard is aggregates only.
- Bey video alone does **not** mean the agent worker is live — check for `joining room` in agent terminal.
- Raw video/audio are not sent to the LLM — transcript + summarized facial cues per **turn** only.
- LLM is **not** the LiveKit agent worker — see `docs/LLM_AND_RECOVERY_PIPELINE.md`.
- Gemini direct API 429 (credits depleted) → use OpenRouter or top up AI Studio billing.

## Documentation index

| Doc | Topic |
|-----|--------|
| `docs/LLM_AND_RECOVERY_PIPELINE.md` | Providers, prompt, turn model, latency, env |
| `docs/RECOVERY_AVATAR.md` | LiveKit + Bey lip-sync |
| `docs/FACIAL_AWARENESS.md` | face-api.js → LLM labels |
| `docs/ARCHITECTURE.md` | System flow |
| `docs/API_PLAN.md` | `/api/agent/respond` contract |

---

*Last updated: Docs sync — LLM pipeline, performance, architecture*
