# Amity — Demo Script (5–7 min)

## Setup

- Open app on phone or laptop; dark mode
- Header **account dropdown** set to **Sarah Perera · Employee** — Trigger Demo is the employee primary CTA (`/user/trigger-demo`)
- Use the account dropdown to switch to **Admin User · Company Admin** for the company dashboard act (`/admin/dashboard`)
- Note: the account dropdown is demo-only (no real sign-in); role persists in `localStorage`
- On mobile, the account selector and nav live in the left-side hamburger drawer (slides left → right)

## Act 1 — Stable baseline (30s)

> "This is Sarah, an employee on a normal workday. Amity's emotional digital twin shows she's stable — normal heart rate, low stress."

- Point to employee card + wellness ring (green/calm)
- Risk: **Low** — no action needed

## Act 2 — Simulated trigger (60s)

> "In production, signals come from wearables and workplace tools. For the buildathon we use a Trigger Simulation Portal."

- Click **Manager Conflict**
- Watch HR, stress score, emotion label update
- Risk engine: **High** → recommends private recovery call
- Show timeline event + JSON payload (integration preview)

## Act 3 — Recovery session (90s)

> "Amity opens a private video recovery room — not therapy, a workplace emotional reset with a recovery companion."

- Tap **Start recovery call**
- Beyond Presence avatar appears
- Brief Gemini-generated supportive line; ElevenLabs voice
- Sarah's twin trends toward calmer (demo animation)

## Act 4 — Summary (45s)

> "Only Sarah sees this detail. The company never gets her private words."

- Before/after stress and emotion
- Session duration, trigger category
- Stress reduction delta

## Act 5 — Company dashboard (45s)

> "Leadership sees privacy-safe patterns, not confessions."

- Session count, avg stress reduction, trigger categories by department
- Explicitly state: no transcripts, no medical labels

## Act 6 — Crisis safety (60s) *(optional but recommended)*

> "If someone signals immediate danger, Amity stops coaching and moves to Crisis Safety Mode."

- Type or select crisis demo phrase (e.g. "I want to die")
- Normal coaching stops
- Emergency options, simulated human handoff, wellbeing officer escalation
- "The AI is not enough — we connect to real help."

## Closing line

> "Amity turns high-pressure workplace signals into private video recovery — with enterprise privacy and a real crisis escalation bridge."

## Backup / FAQ

- **Is this medical?** No — workplace emotional recovery support.
- **Real integrations?** Simulated today; architecture ready for wearables and chat tools.
- **Data privacy?** Employee-private sessions; company gets aggregates only.
