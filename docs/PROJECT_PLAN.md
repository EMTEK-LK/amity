# Amity — Project Plan

## Vision

Amity is a **video-first AI emotional recovery system** for companies. It helps employees during high-pressure emotional moments by receiving stress or emotional trigger signals, calculating emotional risk, and launching a private AI video recovery session.

**Positioning:** Workplace wellbeing support and emotional recovery — not medical diagnosis or therapy.

## Buildathon Constraints

- 24-hour hackathon scope
- Demo via **Trigger Simulation Portal** (no real Apple Watch, WHOOP, Teams, Slack, HR integrations)
- Privacy-first: company sees aggregated analytics only
- Crisis safety layer required for high-risk language

## System Flow

```
Trigger Portal
  → Signal Engine
  → Risk Engine
  → Smartwatch Emotional Digital Twin
  → Session Orchestrator
  → Beyond Presence Recovery Room
  → Gemini Emotional Agent
  → ElevenLabs Voice
  → Recovery Summary
  → Privacy-safe Analytics
  → Crisis Escalation (if needed)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js App Router, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| Icons | Lucide React |
| Reasoning / safety / summaries | Gemini API |
| Voice | ElevenLabs API |
| Video avatar | Beyond Presence |
| Deploy | Vercel |

## Core Modules (build order)

1. **Foundation** — structure, types, docs, rules *(current)*
2. **App shell** — Next.js, Tailwind, layout, theme
3. **Demo store** — in-memory state for Sarah + triggers
4. **Signal + risk engines** — deterministic demo logic
5. **Trigger Portal UI** — main demo screen
6. **Recovery room** — Beyond Presence wrapper + session flow
7. **Gemini agent + safety** — responses + crisis classification
8. **ElevenLabs voice** — TTS for recovery lines
9. **Summary + analytics** — before/after + company dashboard
10. **Crisis mode** — escalation UI and handoff simulation

## Demo Persona

- **Employee:** Sarah Chen, stable baseline → triggered by demo operator → recovery → calmer state

## Privacy Principles

**Company may see:** session counts, avg stress reduction, trigger categories, department trends, high-level signals.

**Company must NOT see:** full transcripts, personal confessions, sensitive PII, medical labels.

## Safety Language Guidelines

**Avoid:** diagnose, treat mental illness, medical therapy, cure anxiety, detect depression with certainty.

**Use:** emotional recovery, high-pressure workplace signal, private reset, recovery companion, crisis escalation bridge.

## Success Criteria (demo)

1. Sarah stable → Manager Conflict trigger → vitals/stress change
2. Risk engine recommends recovery call
3. Beyond Presence room opens with supportive Gemini copy + ElevenLabs voice
4. Post-call summary shows before/after
5. Dashboard shows anonymous aggregates only
6. Crisis path demonstrable with escalation (no false “AI is enough” claims)
