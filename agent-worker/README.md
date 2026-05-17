# Amity LiveKit Agent Worker

Runs **alongside** the Next.js app. It powers **lip-synced Beyond Presence video** in the Recovery Room by joining LiveKit rooms as `amity-recovery-agent` and publishing synced audio/video via the Bey plugin.

Without this process, you may see Bey idle video from a stale session but **no speech** and no lip movement.

## Prerequisites

- Node.js 18+
- Dependencies installed at repo root: `npm install`
- Worker dependencies (once): `npm run agent:install`
- `.env.local` at repo root with LiveKit, Bey, and ElevenLabs keys (see `.env.example`)

## Run

**Option A — two terminals**

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — agent worker
npm run agent:dev
```

**Option B — single command**

```bash
npm run recovery:dev
```

Uses `concurrently` to run both `npm run dev` and `npm run agent:dev`.

## Verify it works

1. Open [http://localhost:3000/user/recovery](http://localhost:3000/user/recovery)
2. Accept consent and start the session
3. Send a chat message

**Agent terminal should show:**

```text
[AmityRecovery] [agent] joining room amity-SES-DEMO-001
[AmityRecovery] [agent] ready { voiceId: '...' }
[AmityRecovery] [agent] speak received { requestId: 1, ... }
[AmityRecovery] [agent] speak start
[AmityRecovery] [agent] speak done
```

**Browser console** (`[AmityRecovery]`): `publishData amity/speak` → `attaching avatar video` → `attaching avatar audio`.

## Environment

Loaded from `../.env.local` then `../.env`:

| Variable | Required |
|----------|----------|
| `LIVEKIT_URL` | Yes |
| `LIVEKIT_API_KEY` | Yes |
| `LIVEKIT_API_SECRET` | Yes |
| `BEYOND_PRESENCE_API_KEY` or `BEY_API_KEY` | Yes |
| `BEYOND_PRESENCE_AVATAR_ID` or `BEY_AVATAR_ID` | Recommended |
| `ELEVENLABS_API_KEY` | Yes |
| `ELEVENLABS_VOICE_ID` | Recommended (defaults in code if unset) |

## How it works

1. Browser calls `POST /api/recovery/avatar-livekit` with `phase: "connect"`.
2. Server creates room `amity-{sessionId}`, dispatches `amity-recovery-agent`.
3. This worker accepts the job, starts `bey.AvatarSession` **before** `voice.AgentSession.start()` (required for lip-sync routing).
4. Browser publishes coaching lines on data topic `amity/speak`.
5. Worker runs ElevenLabs TTS → Bey → `bey-avatar-agent` A/V tracks.

**This worker does not call Gemini/OpenRouter.** Coaching text is produced by Next.js `POST /api/agent/respond` (`docs/LLM_AND_RECOVERY_PIPELINE.md`).

See `docs/RECOVERY_AVATAR.md` for the full diagram.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Only `registered worker`, never `joining room` | Restart worker; check `LIVEKIT_*` match Next.js `.env.local` |
| Server: `agent already in room` but no speech | Stale dispatch — refresh page; server now clears stale jobs automatically |
| Video but no voice | Agent not running or speak not received — check agent logs |
| Response plays twice | Restart worker after pull; ensure single `speak start` per message |
| `agent worker join timeout` in UI | Run `npm run agent:dev` in a second terminal |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run agent:install` | Install worker `package.json` deps |
| `npm run agent:dev` | Dev worker (`tsx main.ts dev`) |
| `npm run agent:start` | Production start (`tsx main.ts start`) |
