# LLM, Voice, and Recovery Reply Pipeline

> **Current implementation reference** for how Amity generates coaching text, what context is sent, and how latency is managed. Complements `docs/RECOVERY_AVATAR.md` (lip-sync) and `docs/FACIAL_AWARENESS.md` (browser face cues).

## Overview

Each employee **turn** (typed chat or finalized speech segment) triggers **one** server round-trip:

```txt
POST /api/agent/respond
  → classifySafety(userMessage)
  → runRecoveryPipeline()
       → generateAmityRecoveryResponse()   # LLM
       → generateAmityVoice()              # optional — skipped when LiveKit speaks
       → getBeyondPresenceConfig()         # parallel with LLM; cached 5 min
  → JSON response to browser
  → publishLiveKitAvatarSpeak(text)         # agent worker TTS + Bey lip-sync
```

This is **turn-based request/response**, not real-time token streaming to the UI (see [Turn model vs streaming](#turn-model-vs-streaming)).

---

## Who is the “emotional support agent”?

The LLM is instructed **on every request** via `lib/recovery-llm-prompt.ts` → `buildRecoveryPrompt()`:

- Opening line: *“You are Amity, a workplace emotional recovery assistant (not a therapist).”*
- Output shape: JSON only — `response`, `recommendedAction`, `nextQuestion`
- Rules: calm, short, no diagnosis; crisis only if **user text** mentions danger
- Context blob: stress, transcript, facial **labels**, risk, mode, disclaimers

**Provider routing** (`lib/gemini.ts`):

| `AMITY_LLM_PROVIDER` | Behavior |
|----------------------|----------|
| `gemini` | Google Generative Language API (`GEMINI_MODEL`, default `gemini-2.0-flash`) |
| `openrouter` | OpenRouter chat completions (`OPENROUTER_MODEL`) |
| `auto` (default) | Gemini first if `GEMINI_API_KEY` set; on quota/credit exhaustion → OpenRouter |

`gemini` and `auto` both **fall back to OpenRouter** when Gemini returns quota/depleted/rate-limit errors and `OPENROUTER_API_KEY` is set.

**OpenRouter** adds a thin system line (“reply with JSON only”); the full Amity persona lives in the user message (`buildRecoveryPrompt`).

**LiveKit agent worker** (`agent-worker/main.ts`) is **not** the reasoning brain. It only speaks exact lines received on data topic `amity/speak` via ElevenLabs TTS + Bey lip-sync.

---

## Turn model vs streaming

| Topic | Current MVP | Future (`docs/GEMINI_LIVE_PLAN.md`) |
|-------|-------------|-------------------------------------|
| User input | Full message per turn (typed or debounced speech chunk) | Duplex audio + streamed transcript |
| LLM calls | One HTTP request per turn | Persistent Gemini Live session |
| LLM output | Complete JSON in one response | Streamed tokens to UI (planned) |
| Facial cues | Snapshot at send time — **not** every 1s to LLM | Same privacy rule; optional periodic context updates in Live |
| Avatar speech | Full line after API returns | Lip-sync from streamed audio |

**Voice auto-send:** Web Speech API accumulates text locally; when a segment finalizes and ~2s debounce passes, the app calls `handleSend` once with the **whole chunk** — not word-by-word LLM calls.

**Internal tokenization:** Gemini/OpenRouter tokenize prompts on their servers. Amity does not implement client-side token chunking of user input.

---

## Session context sent to the LLM

Built in `lib/agent-session-context.ts` → included in `buildRecoveryPrompt()` JSON:

| Field | Source |
|-------|--------|
| `userMessage` | Current turn text |
| `transcript` | Prior speech + current (voice path) |
| `stressLevel`, `heartRate`, `voiceState` | `SharedSessionContext` |
| `facialExpression` | Mapped label (see facial doc) |
| `facialConfidence` | 0–1 indicative score |
| `engagement` | `high` \| `medium` \| `low` |
| `facialSignalQuality` | `usable`, `low_quality`, `no_face`, `camera_off` |
| `riskLevel`, `selectedRecoveryMode` | Session / UI |
| `disclaimer` | Prioritize user words; facial cue uncertain |

**Never sent:** raw webcam frames, images, or microphone audio.

---

## Performance optimizations

Implemented in `lib/recovery-performance.ts` and `lib/recovery-pipeline.ts`:

| Optimization | When | Effect |
|--------------|------|--------|
| **Skip server TTS** | `LIVEKIT_*` configured or `AMITY_SKIP_SERVER_TTS=true` | Avoids waiting for ElevenLabs + large base64 `audioUrl` in API response; agent worker speaks instead |
| **Parallel LLM + BP config** | Every reply | `Promise.all` for LLM and `getBeyondPresenceConfig()` |
| **BP config cache** | 5 min TTL | Skips repeated `api.bey.dev` agent name fetch |
| **OpenRouter JSON-first** | OpenRouter path | One fast attempt with `response_format: json_object` before plain retry |
| **No auto `openrouter/free` fallback** | Unless `AMITY_LLM_FALLBACK_FREE=true` | Avoids 20s+ queued free-tier retries |
| **`ELEVENLABS_MODEL=eleven_turbo_v2_5`** | Stage / fallback path only | Faster than `eleven_multilingual_v2` |
| **`AMITY_LLM_MAX_TOKENS`** | Default 220 | Smaller coaching JSON |

### Typical latency (after optimizations)

| Setup | Chat text (API) | Avatar speech |
|-------|-----------------|---------------|
| LiveKit + Gemini or fast OpenRouter model | ~2–6s | +2–5s via agent worker (parallel to UI) |
| `openrouter/free` only | ~10–20s | Same |
| Stage mode (no LiveKit) + server TTS | ~5–12s | Included in API wait |

### Common 502 causes

| Error | Cause | Fix |
|-------|-------|-----|
| Gemini 429 / credits depleted | Direct API prepay exhausted | Add billing in AI Studio, or use `AMITY_LLM_PROVIDER=openrouter` |
| `GEMINI_API_KEY_MISSING` | No keys | Set `GEMINI_API_KEY` and/or `OPENROUTER_API_KEY` |
| `GEMINI_REQUEST_FAILED` | Invalid model name, network | Check `GEMINI_MODEL`; dev server logs show message |

---

## Environment variables (LLM + performance)

See `.env.example`. Key variables:

```env
AMITY_LLM_PROVIDER=auto          # auto | gemini | openrouter
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.0-flash-001   # avoid openrouter/free for speed
AMITY_LLM_FALLBACK_FREE=false
AMITY_LLM_MAX_TOKENS=220

AMITY_SKIP_SERVER_TTS=true       # optional; auto when LiveKit configured
ELEVENLABS_MODEL=eleven_turbo_v2_5
```

---

## Key files

| Path | Role |
|------|------|
| `lib/recovery-llm-prompt.ts` | Persona + rules + context JSON |
| `lib/gemini.ts` | Provider routing + Gemini API + OpenRouter fallback |
| `lib/openrouter.ts` | OpenRouter chat completions |
| `lib/recovery-pipeline.ts` | LLM + voice + avatar per reply |
| `lib/recovery-performance.ts` | Skip TTS / max tokens helpers |
| `lib/agent-session-context.ts` | Summarized payload for API |
| `app/api/agent/respond/route.ts` | HTTP handler |
| `lib/client/recovery-agent.ts` | Browser `fetch` wrapper |

---

## Related docs

- [`docs/RECOVERY_AVATAR.md`](RECOVERY_AVATAR.md) — LiveKit + Bey speak path
- [`docs/FACIAL_AWARENESS.md`](FACIAL_AWARENESS.md) — face-api.js → labels
- [`docs/GEMINI_LIVE_PLAN.md`](GEMINI_LIVE_PLAN.md) — future streaming
- [`docs/API_PLAN.md`](API_PLAN.md) — endpoint contract
