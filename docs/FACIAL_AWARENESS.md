# Facial awareness (face-api.js)

Optional, consent-based browser-side expression cues for the Recovery Room. This is **not** medical diagnosis and must never be described as certain emotion detection.

## How face-api.js is used

1. User consents to camera and enables facial awareness in the Recovery Room.
2. `hooks/useFacialAwareness.ts` loads models from `/models` and requests the webcam.
3. `lib/browser/face-awareness-client.ts` runs `tinyFaceDetector` + `faceExpressionNet` on the local `<video>` element every **1 second**.
4. Dominant expression scores map to Amity `FacialAwarenessSignal` (broad cues: neutral, sad, stressed, etc.).
5. `updateContextFromFacialSignal()` merges summarized fields into `SharedSessionContext` in the browser.

## Expression mapping (face-api → LLM labels)

face-api.js outputs `happy`, `sad`, `angry`, `fearful`, `disgusted`, `surprised`, `neutral`. Amity maps them before any API call:

| face-api dominant | Sent to LLM as `facialExpression` |
|-------------------|-----------------------------------|
| `happy` | `neutral` (no separate “happy” label) |
| `neutral` | `neutral` |
| `sad` | `sad` |
| `angry` | `angry` |
| `fearful`, `disgusted` | `stressed` |
| `surprised` | `uncertain` |
| no face / camera off | `unknown` |

Allowed Amity types: `neutral` | `sad` | `stressed` | `angry` | `tired` | `uncertain` | `unknown` (`types/facial-awareness.ts`).

## What the LLM receives (and when)

| Data | Sent to LLM? | When |
|------|----------------|------|
| Raw webcam video / image frames | **Never** | — |
| `facialExpression`, `facialConfidence`, `engagement`, `facialSignalQuality` | **Yes** | **Only when the user sends a message** (typed or voice transcript) via `POST /api/agent/respond` |
| Continuous 1s detection stream | **No** | Detection updates local UI/context only |

The prompt includes: *facial signal is optional and uncertain — prioritize user words.*

**Not streaming:** facial labels are a **snapshot at send time**, not tokenized or streamed sentence-by-sentence to the model. See `docs/LLM_AND_RECOVERY_PIPELINE.md`.

## Model files

- Location: `public/models/`
- Load URL at runtime: `/models`
- Download helper: `scripts/download-face-models.sh`
- See `public/models/README.md`

If manifests are missing, the UI shows **Models unavailable** / **Facial awareness paused** and the app does not crash.

## Consent

Facial awareness requires:

- Recovery consent flow (`cameraEnabled`, `facialAwarenessEnabled`)
- Camera enabled in the unified live session

## Not diagnosis

- Copy uses “visible cue”, “indicative”, “supportive signal”.
- Confidence is shown as uncertain.
- Crisis routing must **not** rely on facial expression alone (`shouldActivateCrisisMode` — text/trigger paths dominate).

## UI layout (Recovery Room)

| Panel | Meaning |
|-------|---------|
| **Large left** | Beyond Presence **avatar output** (LiveKit lip-sync) — not your webcam |
| **Small right (session context)** | **Local facial awareness** preview + summarized cues |

## Detection tuning

Constants in `lib/browser/face-awareness-client.ts`:

- `FACE_DETECTION_INPUT_SIZE` (default 416)
- `FACE_DETECTION_SCORE_THRESHOLD` (default 0.35)
- `FACE_DETECTION_INTERVAL_MS` (default 1000)

## Key files

- `types/facial-awareness.ts`
- `lib/browser/face-awareness-client.ts` (browser only — do not import from server routes)
- `hooks/useFacialAwareness.ts`
- `components/recovery/FacialAwarenessPanel.tsx`
- `lib/agent-session-context.ts` — `buildAgentSessionContext()`
- `lib/gemini-session-context.ts` — `buildGeminiSessionContextPayload()`
- `lib/recovery-llm-prompt.ts` — includes facial fields in LLM JSON context

## Related

- `docs/LLM_AND_RECOVERY_PIPELINE.md` — turn-based LLM flow
- `docs/GEMINI_LIVE_PLAN.md` — future Live mode (same privacy rules)
