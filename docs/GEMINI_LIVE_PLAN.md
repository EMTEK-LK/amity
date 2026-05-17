# Gemini Live — future architecture

## Current MVP (implemented)

**Turn-based coaching** via `POST /api/agent/respond`:

- **LLM:** Gemini and/or OpenRouter (`AMITY_LLM_PROVIDER`, quota fallback) using `buildRecoveryPrompt()` — full persona + JSON context per request.
- **Input:** Typed message or **debounced** finalized Web Speech segment (one API call per turn — not word-by-word).
- **Context:** Summarized transcript + facial **labels** + vitals — never raw video/audio.
- **Output:** Complete JSON (`response`, `recommendedAction`, `nextQuestion`) in one response — **not** streamed tokens to the UI yet.
- **Voice:** LiveKit agent worker speaks via ElevenLabs + Bey; server ElevenLabs skipped when LiveKit configured.
- **Safety:** `classifySafety()` before coaching; crisis short-circuit.

See **`docs/LLM_AND_RECOVERY_PIPELINE.md`** for providers, latency, and env vars.

---

## Future: Gemini Live (real-time)

**Not implemented.** Would replace one-shot HTTP with a persistent session.

```
Browser mic audio
  → secure backend WebSocket relay
  → Gemini Live session
  → streamed transcript + response
  → ElevenLabs TTS and/or Gemini audio output
  → Beyond Presence avatar (lip-sync)
```

## Design principles (Live mode)

| Topic | Approach |
|-------|----------|
| API keys | Server-side only — never in the browser |
| WebSocket | Backend relay protects credentials and enforces safety |
| Session context | `SharedSessionContext` injected at session start and on updates |
| Facial signal | Summarized fields — **never raw video frames** |
| Crisis | Safety classifier on transcript; explicit language + triggers — **not face alone** |
| BP avatar | Large left panel = avatar **output**; small right preview = **local** facial awareness |

## What stays from MVP

- Consent gates (camera, mic, facial awareness)
- `buildGeminiSessionContextPayload()` — same summarized shape
- `classifySafety()` — crisis routing
- ElevenLabs + Bey speak path (possibly fed by streamed text chunks)
- Crisis UI → `/user/crisis`

## What changes in Live mode

- Replace one-shot `POST /api/agent/respond` with persistent Live session
- Stream partial transcripts to UI and optional partial LLM tokens (SSE)
- Duplex audio without storing raw video
- Optional periodic facial context updates (still labels only)

## Not in scope for Live v1

- Direct browser → Gemini Live (keys would leak)
- Sending webcam frames to Gemini
- Diagnosis from facial cues alone

See also: `docs/FACIAL_AWARENESS.md`, `docs/API_PLAN.md`, `docs/RECOVERY_AVATAR.md`.
