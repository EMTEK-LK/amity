# Gemini Live — future architecture

**Step 6A:** `POST /api/agent/respond` sends summarized session context (user message, transcript, facial cues) to **Gemini text API** — no ElevenLabs, no Live WebSocket yet. **No mock fallback:** `GEMINI_API_KEY` is required (server-side only); a missing/failed key returns a clear setup error, never a mock reply.

**Step 6B (current):** Recovery Room is a unified live session — one action starts camera + mic together; final Web Speech segments auto-send (debounced) and the typed chatbot fallback share the same `POST /api/agent/respond` route (`source: voice_transcript | typed_input`). Still one-shot request/response; no Live WebSocket. Raw audio/video are never sent — transcript + summarized facial context only.

**Step 7 (next):** ElevenLabs voice after Gemini text is stable.

**Gemini Live** (real-time audio duplex) is a future upgrade documented below.

## Future real-time flow

```
Browser mic audio
  → secure backend WebSocket relay
  → Gemini Live session
  → streamed transcript + response
  → ElevenLabs TTS and/or Gemini audio output
  → Beyond Presence avatar (lip-sync)
```

## Design principles

| Topic | Approach |
|-------|----------|
| API keys | Server-side only — never in the browser |
| WebSocket | Backend relay protects credentials and enforces safety |
| Session context | `SharedSessionContext` injected at session start and on updates |
| Facial signal | Summarized fields sent periodically — **never raw video frames** |
| Crisis | Safety classifier on transcript; explicit language + triggers — **not face alone** |
| BP avatar | Large left panel = avatar **output**; small right preview = **local** facial awareness |

## What stays from MVP

- Consent gates (camera, mic, facial awareness)
- `buildGeminiSessionContextPayload()` — same summarized shape for Live session tools
- `classifySafety()` — crisis routing before coaching continues
- ElevenLabs backend adapter for voice output
- Crisis UI → `/user/crisis`

## What changes in Live mode

- Replace one-shot `POST /api/agent/respond` with persistent Live session
- Stream partial transcripts to UI and context
- Optional: duplex audio without storing raw video
- BP embed receives audio + viseme/lip-sync stream

## Not in scope for Step 5.2

- Direct browser → Gemini Live (keys would leak)
- Sending webcam frames to Gemini
- Real Beyond Presence embed

See also: `docs/FACIAL_AWARENESS.md`, `docs/API_PLAN.md`.
