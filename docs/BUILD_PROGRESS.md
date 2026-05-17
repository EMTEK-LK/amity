# Amity — Build Progress

> **Source of truth** for hackathon build status.

## Current Status

**Phase:** Step 8 + performance — LiveKit lip-sync, turn-based LLM, optimized `/api/agent/respond`  
**Overall:** Recovery Room has unified camera/mic/chat, Gemini/OpenRouter coaching, agent-worker TTS + Bey lip-sync, ElevenLabs browser fallback only when needed

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

- [ ] Production deploy checklist (env vars, agent worker hosting)
- [ ] Stream LLM text to UI before avatar finishes speaking (SSE)
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
