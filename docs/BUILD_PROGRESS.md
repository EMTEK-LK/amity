# Amity — Build Progress

> **Source of truth** for hackathon build status.

## Current Status

**Phase:** Step 6B — Unified live Recovery Room  
**Overall:** Recovery Room supports unified camera + mic + chatbot + Gemini text response flow

## Completed Tasks (Step 6A)

- [x] ElevenLabs disabled from current agent response flow
- [x] **Mock Gemini fallback removed** — no mock responses in Step 6A
- [x] Recovery Room sends text/transcript + facial signal to Gemini
- [x] `/api/agent/respond` returns Gemini text-only response
- [x] Missing/failed Gemini returns clear setup error (no mock)
- [x] Gemini provider status: `real` / `safety` / `not_configured` / `error`
- [x] Speech transcript can populate user message
- [x] Gemini context preview panel added
- [x] Crisis language returns crisis-safe response
- [x] `/api/agent/test` added (same error contract, no mock)
- [x] Docs updated

## Completed Tasks (Step 6B)

- [x] Unified live recovery session control (`useRecoveryMediaSession`)
- [x] Camera and microphone start together from one session action
- [x] Speech transcript reliability improved (statuses + guarded auto-restart)
- [x] Final transcript segments auto-send to Gemini (debounced + de-duplicated)
- [x] Facial signal integrated into Gemini context
- [x] Chatbot fallback preserved (typed input always available)
- [x] Typed messages and voice transcript use the same `/api/agent/respond` route
- [x] `source: voice_transcript | typed_input` threaded into request + preview
- [x] Signal status panel unified (camera / mic / transcript / facial / Gemini / voice)
- [x] Avatar output vs local camera signal clarified
- [x] Error/fallback states improved (camera/mic/speech/Gemini)
- [x] Docs updated

## Next Task

**Step 7:** Connect ElevenLabs voice generation after Gemini response is stable.

## Testing Status

| Check | Status |
|-------|--------|
| `npm run dev` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| No key → setup error (no mock) | Manual |
| Real Gemini (with key) | Manual |
| One-click camera + mic start | Manual |
| Voice transcript auto-send | Manual |
| Typed chatbot fallback | Manual |
| Camera/mic denied fallback | Manual |
| Camera / transcript / crisis | Manual |

## Notes

- **No mock Gemini fallback** in Step 6A — `GEMINI_API_KEY` is required; a missing key returns a clear setup error in the conversation panel.
- Raw video and mic audio are never sent — transcript + summarized facial cues only.
- API keys stay server-side (`GEMINI_API_KEY`); never `NEXT_PUBLIC_*`.
- ElevenLabs intentionally disabled until Step 7; Gemini Live streaming is a future upgrade.
- One "Start live recovery session" action requests camera + mic together; Web Speech transcript is browser-dependent and degrades to the typed chatbot.

---

*Last updated: Step 6B — Unified live Recovery Room*
