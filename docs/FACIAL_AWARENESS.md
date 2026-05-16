# Facial awareness (face-api.js)

Optional, consent-based browser-side expression cues for the Recovery Room. This is **not** medical diagnosis and must never be described as certain emotion detection.

## How face-api.js is used

1. User consents to camera and enables facial awareness in the Recovery Room.
2. `hooks/useFacialAwareness.ts` loads models from `/models` and requests the webcam.
3. `lib/browser/face-awareness-client.ts` runs `tinyFaceDetector` + `faceExpressionNet` on the local `<video>` element every **1 second**.
4. Dominant expression scores map to Amity `FacialAwarenessSignal` (broad cues: neutral, sad, stressed, etc.).
5. `updateContextFromFacialSignal()` merges summarized fields into `SharedSessionContext`.

## Model files

- Location: `public/models/`
- Load URL at runtime: `/models`
- Download helper: `scripts/download-face-models.sh`
- See `public/models/README.md`

If manifests are missing, the UI shows **Models unavailable** / **Facial awareness paused** and the app does not crash.

## Privacy and Gemini

| Data | Sent to Gemini? |
|------|-----------------|
| Raw webcam video / image frames | **Never** |
| Summarized expression, confidence, engagement, quality | **Future** — via `buildGeminiSessionContextPayload()` only |

All camera processing runs **locally in the browser**. No facial video is sent to Amity backends in the current MVP.

## Consent

Facial awareness requires:

- Recovery consent flow (`cameraEnabled`, `facialAwarenessEnabled`)
- Explicit enable in `FacialAwarenessPanel` (user can disable without leaving the session)

## Not diagnosis

- Copy uses “visible cue”, “indicative”, “supportive signal”.
- Confidence is shown as uncertain.
- Crisis routing must **not** rely on facial expression alone (see `shouldActivateCrisisMode` — text/trigger/consent paths dominate).

## UI layout (Recovery Room)

| Panel | Meaning |
|-------|---------|
| **Large left** | Beyond Presence **avatar output** (placeholder) — not your webcam |
| **Small right (session context)** | **Local facial awareness** preview + summarized cues |

Camera analysis runs in the browser. Only expression/confidence/engagement/quality fields are sent to `POST /api/agent/respond` — never frames.

## Detection tuning

Constants in `lib/browser/face-awareness-client.ts`:

- `FACE_DETECTION_INPUT_SIZE` (default 416)
- `FACE_DETECTION_SCORE_THRESHOLD` (default 0.35)
- `FACE_DETECTION_INTERVAL_MS` (default 1000)

Detection runs only when video has non-zero dimensions and `readyState >= 2`.

## MVP vs future

| MVP (now) | Future |
|-----------|--------|
| Browser face-api.js → summarized fields in `/api/agent/respond` → Gemini text | Gemini Live via WebSocket relay (`docs/GEMINI_LIVE_PLAN.md`) |
| ElevenLabs disabled in Step 6A | Step 7 adds voice after Gemini text |
| No mock Gemini — `GEMINI_API_KEY` required (server-side) | Same key handling for Live |
| Step 6B: camera starts with the unified live session (no separate enable button) | Same in Live |
| Local-only; summarized agent context | Same — never raw video to Gemini |
| Models optional in repo | CI check + model hosting/CDN |
| Web Speech transcript demo | Full streaming voice pipeline |

## Key files

- `types/facial-awareness.ts`
- `lib/browser/face-awareness-client.ts` (browser only — do not import from server routes)
- `hooks/useFacialAwareness.ts`
- `components/recovery/FacialAwarenessPanel.tsx`
- `lib/gemini-session-context.ts` — `buildGeminiSessionContextPayload()`
