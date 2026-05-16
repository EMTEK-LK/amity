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

## Act 2 — Simulated trigger (90s)

> "In production, signals come from wearables and workplace tools. For the buildathon we use the Employee Trigger Demo — ten realistic scenarios."

- Open **Trigger Demo** (`/user/trigger-demo`)
- Show Sarah Perera context + connected signals (Watch, Work apps, Manual)
- Click **Manager Conflict** (Microsoft Teams) — stress 84, HR 118, risk high
- Point to emotional digital twin, risk engine reason, signal timeline
- Expand **JSON payload** — show future API shape for judges
- Optionally tap **Customer Escalation** or **Wake Word** to show variety
- CTA: **Open Recovery Room**

## Act 3 — Recovery session (90s)

> "Amity opens a private video recovery room — not therapy, a workplace emotional reset with a recovery companion."

- Open **Recovery Room** (`/user/recovery`) from Trigger Demo
- Accept consent → **Start live recovery session** (one action: camera + mic together)
- **Large left** = avatar output; **small** = local facial awareness signal (if camera on)
- Requires `GEMINI_API_KEY` in `.env.local` (no mock — without a key the panel shows a clear setup error)
- Speak naturally → final transcript **auto-sends** → **Gemini text response** (badge: Gemini real; voice disabled until Step 7)
- Or just type in the chatbot — same Gemini route; works even if camera/mic are off
- Open **Gemini context preview** to show judges the message source + summarized face + transcript payload
- Try “I am not safe right now” → crisis (from text, not face) → Open Crisis Safety Flow

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

- In Trigger Demo, select **Future Video Signal** or **Critical Self-Harm Risk**
- Twin shows Crisis Mode, risk score 100
- Copy: normal coaching paused, live handoff recommended
- CTA changes to **Open Crisis Safety Flow** → `/user/crisis`
- "The AI is not enough — we connect to real help."

## Closing line

> "Amity turns high-pressure workplace signals into private video recovery — with enterprise privacy and a real crisis escalation bridge."

## Backup / FAQ

- **Is this medical?** No — workplace emotional recovery support.
- **Real integrations?** Simulated today; architecture ready for wearables and chat tools.
- **Data privacy?** Employee-private sessions; company gets aggregates only.
