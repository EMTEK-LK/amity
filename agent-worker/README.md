# Amity LiveKit Agent (Beyond Presence lip-sync)

Runs **beside** `npm run dev`. Without this worker, Recovery Room shows *"agent join timeout"* and no avatar video.

## Setup (once)

```bash
npm run agent:install
```

## Run

**Terminal 1:** `npm run dev`  
**Terminal 2:** `npm run agent:dev`

Wait for: `registered worker` and (when you open Recovery Room) `joining room amity-SES-DEMO-001`.

Uses keys from `../.env.local`: `LIVEKIT_*`, `BEYOND_PRESENCE_API_KEY`, `ELEVENLABS_API_KEY`.
