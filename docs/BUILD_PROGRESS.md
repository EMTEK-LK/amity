# Amity — Build Progress

> **Source of truth** for hackathon build status.

## Current Status

**Phase:** Step 8 — LiveKit + Beyond Presence lip-sync avatar  
**Overall:** Recovery Room has unified camera/mic/chat, Gemini responses, ElevenLabs voice fallback, and lip-synced BP avatar via LiveKit Agents

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

## Next Task

- [ ] Production deploy checklist (env vars, agent worker hosting)
- [ ] Optional: reduce `/api/agent/respond` latency (stream text before TTS)
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
| `npm run agent:dev` → `joining room` | Manual |
| Lip-sync video + audio | Manual |
| Single speak per reply (no duplicate) | Manual |
| ElevenLabs fallback when agent down | Manual |
| Crisis flow | Manual |
| Admin aggregates only (no transcripts) | Manual |

## Notes

- Employee sessions are private; dashboard is aggregates only.
- Bey video alone does **not** mean the agent worker is live — check for `joining room` in agent terminal.
- Raw video/audio are not sent to the LLM — transcript + summarized facial cues only.

---

*Last updated: Step 8 — LiveKit + Beyond Presence lip-sync*
