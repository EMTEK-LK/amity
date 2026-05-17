# Amity — Demo Script (5–7 min)

## Setup

- Open app on phone or laptop; dark mode
- Header **account dropdown** set to **Sarah Perera · Employee** — the employee primary CTA is **Start Recovery** (`/user/recovery`); **Trigger Simulation** (`/user/trigger-demo`) is a secondary demo tool in the nav
- Use the account dropdown to switch to **Admin User · Company Admin** for the company dashboard act (`/admin/dashboard`)
- Note: the account dropdown is demo-only (no real sign-in); role persists in `localStorage`
- On mobile, the account selector and nav live in the left-side hamburger drawer (slides left → right)

## Act 1 — Stable baseline (30s)

> "This is Sarah, an employee on a normal workday. Amity's emotional digital twin shows she's stable — normal heart rate, low stress."

- Point to employee card + wellness ring (green/calm)
- Risk: **Low** — no action needed

## Act 2 — Simulated trigger (90s)

> "In production, signals come from wearables and workplace tools. For the buildathon we use the Employee Trigger Demo — ten realistic scenarios."

- Open **Trigger Demo** (`/user/trigger-demo`)
- Show Sarah Perera context + connected signals (Watch, Work apps, Manual)
- Click **Manager Conflict** (Microsoft Teams) — stress 84, HR 118, risk high
- Point to emotional digital twin, risk decision, signal timeline
- After ~1s, Amity rings an **Incoming Recovery Call** ("Amity Recovery Guide is calling") with the scenario context and risk label
- Tap **Answer** → routes to the Recovery Room with the scenario preloaded
- (Optional) tap **Not now** to show the call can be dismissed; **Simulate incoming call** re-rings it

## Act 3 — Recovery session (90s)

> "Amity opens a private video recovery room — not therapy, a workplace emotional reset with a recovery companion."

**Before demo:** run `npm run dev` and `npm run agent:dev` (or `npm run recovery:dev`). Lip-sync requires the agent worker.

- Arrive from the answered **Incoming Recovery Call** — note the "Recovery call started from Manager conflict" banner and the context-aware welcome that references the scenario
- Accept consent → **Start live recovery session** (camera + mic together)
- **Large left** = lip-synced Beyond Presence avatar (LiveKit); badge **Lip-sync live**
- Requires LLM + LiveKit + Bey keys in `.env.local` (see README)
- Type or speak → one API turn → Gemini/OpenRouter reply (typically 2–6s with fast model) → avatar **speaks with lip-sync**
- Open **Gemini context preview** — shows summarized facial **labels** + transcript (not video)
- Try “I am not safe right now” → crisis (from **text**, not face) → Crisis Safety Flow

**Judge talking points:**
- Amity LLM (`buildRecoveryPrompt`) writes coaching JSON; agent worker + Bey deliver voice/video.
- Face-api runs locally; only labels like `sad` / `neutral` go to the LLM **per message**, not continuous video.
- Employee sessions stay private; company dashboard sees aggregates only.
- If Gemini credits are empty, OpenRouter fallback works (`AMITY_LLM_PROVIDER=auto`).

## Act 4 — Summary (45s)

> "Only Sarah sees this detail. The company never gets her private words."

- Before/after stress and emotion
- Session duration, trigger category
- Stress reduction delta

## Act 5 — Company dashboard (45s)

> "Leadership sees privacy-safe patterns, not confessions."

- Session count, avg stress reduction, trigger categories by department
- Explicitly state: no transcripts, no medical labels

## Act 6 — Crisis safety (60s) *(recommended)*

> "If someone signals immediate danger, Amity stops coaching and moves to Crisis Safety Mode."

- In the Recovery Room, type **"I am not safe right now"** and send
- **Crisis Safety Modal** opens immediately: emergency options — **119** (police), **1990** (emergency medical), wellbeing officer demo handoff, trusted contact placeholder
- Tap **Stay with Amity** → modal closes, **crisis banner** stays (normal coaching paused, chatbot still visible); "Show support options" reopens it
- Tap **Open Crisis Safety Flow** → `/user/crisis` (matching emergency cards, return / "I am safe now")
- Emergency numbers are configurable by company/country; human handoff is simulated
- "Amity is not an emergency service — we point you to real help, and never trigger crisis from a face alone."

## Closing line

> "Amity turns high-pressure workplace signals into private video recovery — with enterprise privacy and a real crisis escalation bridge."

## Backup / FAQ

- **Is this medical?** No — workplace emotional recovery support.
- **Real integrations?** Simulated today; architecture ready for wearables and chat tools.
- **Data privacy?** Employee-private sessions; company gets aggregates only.
