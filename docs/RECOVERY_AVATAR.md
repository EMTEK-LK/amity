# Recovery Avatar — LiveKit + Beyond Presence Lip-Sync

This document describes how the **Recovery Room** lip-synced avatar works in the current build.

## Overview

When LiveKit is configured, the Recovery Room uses:

1. **Gemini / OpenRouter** — generates coaching text (`POST /api/agent/respond`) — see `docs/LLM_AND_RECOVERY_PIPELINE.md`
2. **Server ElevenLabs** — **skipped** when LiveKit is configured (`shouldSkipServerTts()`); avoids duplicate TTS and API latency
3. **LiveKit Agents worker** — runs ElevenLabs TTS and routes audio through the **Beyond Presence (Bey)** plugin for lip-synced video
4. **ElevenLabs in browser** — fallback `audioUrl` only when lip-sync is unavailable (`lipSyncFallbackVoice`)

The browser **does not** publish its own audio to LiveKit for lip-sync. Audio and video come from the `bey-avatar-agent` participant in the room.

## Architecture

```
┌─────────────────┐     POST /api/agent/respond      ┌──────────────────┐
│  Recovery Room  │ ───────────────────────────────► │  Next.js API     │
│  (browser)      │ ◄── LLM text (voice skipped if LiveKit)│  pipeline   │
└────────┬────────┘                                    └──────────────────┘
         │                                             └──────────────────┘
         │ POST /api/recovery/avatar-livekit
         │ (connect | token)
         ▼
┌─────────────────┐     WebRTC (subscribe A+V)         ┌──────────────────┐
│  livekit-client │ ◄────────────────────────────────► │  LiveKit Cloud   │
│  (browser)      │     publishData topic amity/speak   │  room amity-*    │
└─────────────────┘                                     └────────┬─────────┘
                                                               │
         ┌─────────────────────────────────────────────────────┘
         ▼
┌─────────────────┐     ElevenLabs TTS     ┌──────────────────┐
│  agent-worker   │ ─────────────────────► │  Bey AvatarSession│
│  amity-recovery │     (lip-sync stream)  │  bey-avatar-agent│
│  -agent         │ ◄──────────────────────│  (video + audio) │
└─────────────────┘                        └──────────────────┘
```

## Key files

| Path | Role |
|------|------|
| `agent-worker/main.ts` | LiveKit agent entry: Bey + ElevenLabs TTS, listens on `amity/speak` data channel |
| `lib/livekit-avatar-session.ts` | Browser singleton room session, track attach, speak publish |
| `lib/livekit-agent-dispatch.ts` | Dispatches worker; clears stale dispatch / Bey when worker is dead |
| `lib/livekit-room.ts` | Room creation + browser participant token |
| `app/api/recovery/avatar-livekit/route.ts` | `connect` (dispatch agent) or `token` (refresh token only) |
| `hooks/useLiveKitAvatar.ts` | React hook — subscribe to session snapshot |
| `components/recovery/LiveKitAvatarVideo.tsx` | Video element + speak on each assistant reply |
| `app/user/recovery/page.tsx` | Retains LiveKit session; ElevenLabs fallback when lip-sync fails |

## Speak flow

1. User sends a message (typed or debounced speech chunk) → `POST /api/agent/respond` returns `response`, `voice` (often `disabled` when LiveKit), `avatar`.
2. Recovery page sets `speakRequest` `{ id, text }` with the assistant line.
3. `LiveKitAvatarVideo` calls `publishLiveKitAvatarSpeak(sessionId, text, requestId)`.
4. Browser sends **one** reliable data packet on topic `amity/speak`:

   ```json
   { "type": "amity/speak", "text": "...", "requestId": 1 }
   ```

5. Agent worker receives `dataReceived`, dedupes by `requestId`, queues `voiceAgentSession.say(text)`.
6. TTS audio flows through Bey → `bey-avatar-agent` publishes synced video + audio.
7. Browser subscribes and plays Bey tracks (not local ElevenLabs).

## Display modes

| Mode | When | UI |
|------|------|-----|
| `livekit` | `LIVEKIT_*` configured + Bey API key | `LiveKitAvatarVideo` — lip-sync |
| `iframe` | `BEYOND_PRESENCE_EMBED_IFRAME=true` | Full Bey iframe (separate from Amity LLM) |
| `stage` | No LiveKit / no keys | Amity coach placeholder + ElevenLabs audio only |

## Agent dispatch rules

`lib/livekit-agent-dispatch.ts`:

- Checks for a **live** `AGENT` participant in the room (not just `bey-avatar-agent`).
- If dispatch metadata exists but the worker is gone, deletes stale dispatch, removes stale Bey, and creates a fresh dispatch.
- Avoids the false positive: *"agent already in room"* while `npm run agent:dev` never received a job.

## Audio policy (no double playback)

- **Lip-sync active:** hear only Bey remote audio track.
- **Fallback:** local ElevenLabs from `voiceOutput.audioUrl` when publish fails, agent missing, or room drops.
- Fallback is cleared when `agentReady` + video is streaming.
- Agent dedupes duplicate `requestId`; browser sends a single `publishData` per reply.

## Environment variables

See `.env.example`. Required for lip-sync:

| Variable | Used by |
|----------|---------|
| `LIVEKIT_URL` | Browser + agent worker |
| `LIVEKIT_API_KEY` | Server dispatch + tokens; agent worker |
| `LIVEKIT_API_SECRET` | Server + agent worker |
| `BEYOND_PRESENCE_API_KEY` | Agent worker Bey plugin |
| `BEYOND_PRESENCE_AVATAR_ID` or `BEY_AVATAR_ID` | Bey avatar selection |
| `ELEVENLABS_API_KEY` | Agent worker TTS (+ server fallback if no LiveKit) |
| `ELEVENLABS_VOICE_ID` | Agent TTS voice |
| `AMITY_SKIP_SERVER_TTS` | `true` or auto when LiveKit set — skip API TTS |
| `GEMINI_*` / `OPENROUTER_*` | LLM coaching text (not used by agent worker) |

Agent worker loads `../.env.local` from the repo root.

## Debugging

Filter browser console: `[AmityRecovery]`

| Log | Meaning |
|-----|---------|
| `publishData amity/speak` | Browser sent line to room |
| `attaching avatar video/audio` | Bey tracks subscribed |
| `agent worker join timeout` | Run `npm run agent:dev` |
| `Voice playback disabled` | Normal in LiveKit mode when fallback is off |
| `playing reply` | ElevenLabs fallback active |

Agent terminal (`npm run agent:dev`):

| Log | Meaning |
|-----|---------|
| `registered worker` | Worker connected to LiveKit Cloud |
| `joining room amity-...` | Job received — required for speech |
| `speak received` / `speak start` / `speak done` | Full speak pipeline OK |

Server terminal (`npm run dev`):

| Log | Meaning |
|-----|---------|
| `[dispatch] agent dispatched (fresh)` | New worker job created |
| `[dispatch] live agent in room` | Worker already connected |
| `[dispatch] removed stale dispatch` | Recovered from crashed session |

## References

- [`docs/LLM_AND_RECOVERY_PIPELINE.md`](LLM_AND_RECOVERY_PIPELINE.md) — LLM turn model, latency, providers
- [LiveKit Agents — Bey plugin](https://docs.livekit.io/agents/models/avatar/plugins/bey/)
- `agent-worker/README.md` — worker setup
