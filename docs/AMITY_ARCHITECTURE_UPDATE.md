# Amity Architecture Update

## Real-Time Emotional Recovery System

This document defines the updated Amity architecture, future integration plan, project folder structure, and implementation roadmap. Use this file as the main architecture reference before connecting Gemini, ElevenLabs, Beyond Presence, face awareness, voice streaming, wearable APIs, workplace tools, and crisis escalation systems.

---

## 1. Product Summary

**Amity** is a company-focused, video-first emotional recovery system for employees.

It helps employees during high-pressure workplace moments by receiving emotional or stress-related signals, building a shared session context, calculating risk, and launching a private recovery session through a human-like avatar experience.

Amity uses:

- **Beyond Presence** for realistic AI video avatar recovery sessions
- **Gemini / Gemini Live** for emotional reasoning, conversation intelligence, safety classification, and summaries
- **ElevenLabs** for natural emotional voice output
- **Trigger Demo Portal** for the 24-hour MVP signal simulation
- **Optional browser-side facial awareness** for future visible cue support
- **Voice intelligence** for future real-time speech and tone-based session adaptation
- **Crisis Escalation Layer** for high-risk safety situations

Amity is **not** a medical or therapy product. It does not diagnose depression, anxiety, or mental illness. It provides workplace emotional recovery support and escalates critical cases to human support pathways.

---

## 2. Product Positioning

### Correct positioning

Use language such as:

- Emotional recovery
- High-pressure workplace signal
- Private reset
- Workplace wellbeing support
- AI recovery companion
- Recovery session
- Crisis escalation bridge
- Visible cue awareness
- Voice session awareness
- Privacy-safe wellbeing analytics

### Avoid language such as:

- Diagnose depression
- Detect mental illness with certainty
- Treat depression
- Cure anxiety
- Medical diagnosis
- Therapy replacement
- Psychiatric assistant

---

## 3. Core User Roles

Amity has two separate product experiences.

---

## 3.1 Company Admin Experience

The admin represents the company.

The admin can view:

- Company dashboard
- Employee wellbeing status overview
- Aggregated analytics
- Recovery session counts
- Department-level wellbeing trends
- Privacy-safe summaries
- Escalation configuration
- Integration settings
- Company settings

The admin must not view:

- Private employee conversations
- Full session transcripts
- Personal emotional disclosures
- Sensitive employee notes
- Medical labels
- Crisis message content unless explicitly required by a configured safety process

### Hardcoded demo admin

```json
{
  "id": "ADMIN-001",
  "name": "Admin User",
  "role": "Company Admin",
  "company": "Amity Demo Company",
  "email": "admin@amity.demo"
}
```

---

## 3.2 Employee Experience

The employee receives personal support.

The employee can access:

- Personal dashboard
- Trigger Demo
- Recovery Room
- Crisis Support
- Personal summary
- Profile
- Settings
- Emergency contact preferences
- Recovery preferences

### Hardcoded demo employee

```json
{
  "id": "EMP-001",
  "name": "Sarah Perera",
  "role": "Customer Support Agent",
  "department": "Customer Care",
  "company": "Amity Demo Company",
  "email": "sarah@amity.demo",
  "status": "Stable"
}
```

---

## 4. High-Level System Architecture

```txt
┌──────────────────────────────────────────────────────────────┐
│                        AMITY CLIENT                          │
│      Web App / Mobile WebView / Desktop Browser              │
│      Next.js + WebRTC-ready + Mobile-first UI                │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONSENT + SESSION GATE                    │
│   Camera permission | Microphone permission | Privacy notice  │
│   User controls: Start, Pause, Stop, Escalate                │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Trigger Signals │  │ Facial Awareness │  │ Voice Pipeline    │
│ Demo Portal     │  │ Optional browser │  │ Gemini Live / STT │
│ Wearables future│  │ face-api.js      │  │ User speech       │
│ Workplace future│  │                  │  │                  │
└─────────────────┘  └──────────────────┘  └──────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                 SHARED SESSION CONTEXT                       │
│ employeeId, role, trigger, stressScore, emotionSignal,        │
│ voiceState, engagement, sessionRisk, consentState             │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                 RISK + SAFETY ENGINE                         │
│ Rule-based MVP | Gemini safety classification | crisis rules  │
└──────────────────────────────────────────────────────────────┘
                 │                            │
                 ▼                            ▼
┌──────────────────────────────┐    ┌──────────────────────────┐
│ Recovery Orchestrator         │    │ Crisis Escalation Layer   │
│ Create recovery session       │    │ Stop coaching             │
│ Select recovery mode          │    │ Human handoff             │
│ Prepare BP avatar context     │    │ Emergency options         │
└──────────────────────────────┘    └──────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI RESPONSE LAYER                         │
│ Gemini Live / Gemini Agent                                    │
│ Context-aware reasoning | response generation | summaries     │
└──────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                    VOICE + AVATAR LAYER                      │
│ ElevenLabs emotional TTS → Beyond Presence avatar interface  │
│ Realistic voice + avatar presence + recovery interaction      │
└──────────────────────────────────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│                 SESSION OUTCOME + ANALYTICS                  │
│ Employee summary | private notes | company aggregated trends  │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Parallel Signal Pipeline Architecture

Amity separates the real-time recovery system into multiple pipelines. This helps with scalability, latency, reliability, and future integrations.

---

## 5.1 Trigger Signal Pipeline

### MVP source

For the buildathon, triggers are simulated through the employee-side Trigger Demo page.

### Future sources

Future trigger sources may include:

- Apple Watch
- WHOOP
- Microsoft Teams
- Slack
- WhatsApp
- Calendar tools
- HR systems
- Call center platforms
- CRM systems
- Incident management tools
- Internal wellbeing systems
- Manual employee request
- Wake word trigger
- Future BP video/audio session signals

### Example trigger payload

```json
{
  "employeeId": "EMP-001",
  "source": "microsoft_teams",
  "triggerType": "manager_conflict",
  "context": "Employee was blamed during a team review",
  "emotionSignal": "sad_overwhelmed",
  "stressScore": 84,
  "heartRate": 118,
  "voiceState": "shaky",
  "facialSignal": "sad",
  "engagement": "low",
  "riskLevel": "high",
  "recommendedAction": "start_recovery_session"
}
```

---

## 5.2 Optional Facial Awareness Pipeline

Facial awareness is an optional, consent-based browser-side signal layer.

### Future technology

- face-api.js or similar browser ML library
- Browser camera access
- Local inference where possible
- No diagnosis
- No emotional certainty claims

### What it may estimate

- Broad expression changes
- Visible engagement
- Attention level
- Face presence
- Signal quality

### What it must not claim

- It must not diagnose depression
- It must not diagnose anxiety
- It must not determine mental health status
- It must not be used as the only crisis source
- It must not be sent to the company as private employee data

### Example facial signal

```json
{
  "expression": "sad",
  "confidence": 0.68,
  "engagement": "low",
  "attention": "reduced",
  "signalQuality": "medium",
  "capturedAt": "2026-05-16T18:00:00+05:30"
}
```

---

## 5.3 Voice Conversation Pipeline

Voice intelligence is used during recovery sessions.

### MVP

- Text input or sample user messages
- Mock voice state
- Placeholder voice output panel

### Future

- Gemini Live audio streaming
- Speech-to-text
- Voice tone analysis
- Streaming response generation
- Real-time turn-taking
- Session-aware conversation management

### Example voice state

```json
{
  "transcript": "I feel overwhelmed after that meeting.",
  "voiceState": "shaky",
  "tone": "distressed",
  "confidence": 0.76,
  "streamingStatus": "active",
  "lastUtteranceAt": "2026-05-16T18:01:00+05:30"
}
```

---

## 6. Shared Session Context

The shared session context is the central state object that combines trigger signals, facial signals, voice signals, consent state, risk level, and recovery recommendation.

It allows Gemini, ElevenLabs, Beyond Presence, the risk engine, and crisis system to work from the same session state.

### Example shared session context

```json
{
  "sessionId": "SES-DEMO-001",
  "employeeId": "EMP-001",
  "role": "employee",
  "source": "trigger_demo",
  "consent": {
    "cameraEnabled": false,
    "microphoneEnabled": true,
    "facialAwarenessEnabled": false,
    "voiceAnalysisEnabled": true,
    "crisisEscalationEnabled": true,
    "analyticsConsent": true,
    "lastUpdatedAt": "2026-05-16T18:00:00+05:30"
  },
  "currentEmotion": "sad_overwhelmed",
  "stressLevel": 84,
  "heartRate": 118,
  "voiceState": "shaky",
  "facialSignal": "sad",
  "engagement": "low",
  "riskLevel": "high",
  "safetyLevel": "normal",
  "recommendedAction": "start_recovery_session",
  "lastUpdatedAt": "2026-05-16T18:00:00+05:30"
}
```

---

## 7. Consent Layer

Amity must clearly ask for and manage user consent before enabling sensitive session features.

### Consent fields

```json
{
  "cameraEnabled": false,
  "microphoneEnabled": true,
  "facialAwarenessEnabled": false,
  "voiceAnalysisEnabled": true,
  "crisisEscalationEnabled": true,
  "analyticsConsent": true,
  "lastUpdatedAt": "2026-05-16T18:00:00+05:30"
}
```

### Consent rules

- Facial awareness is optional
- Camera is optional
- Microphone is required only for voice conversation
- User can continue without camera
- User should be able to pause or stop the session
- Crisis escalation should be clearly explained
- Company must not receive private session content

---

## 8. Risk and Safety Engine

The Risk and Safety Engine calculates the response path.

### MVP risk model

Rule-based risk scoring.

Example:

```txt
Base risk = stressScore
Heart rate > 110 = +10
Manager conflict = +10
Customer escalation = +15
Panic trigger = +20
Manual help request = +20
Critical self-harm phrase = Crisis Mode
```

### Risk levels

```txt
0-30     Stable
31-60    Watch
61-80    Support Recommended
81-100   Recovery Needed
Critical Crisis Safety Mode
```

---

## 9. Crisis Escalation Layer

If crisis language, self-harm intent, violence risk, or immediate danger is identified, Amity must stop normal recovery coaching.

### Crisis triggers

- I want to die
- I am going to hurt myself
- I cannot continue
- I took pills
- I have a plan
- I am not safe
- I might hurt someone

### Crisis flow

```txt
Crisis signal detected
        ↓
Normal coaching stops
        ↓
Crisis Safety Mode activates
        ↓
Live human handoff prepared
        ↓
Emergency options shown
        ↓
Trusted contact or wellbeing officer pathway displayed
        ↓
User remains engaged until handoff
```

### Crisis response behavior

The AI should say something like:

```txt
I’m really sorry you’re feeling unsafe. I do not want you to handle this alone. Normal coaching is paused, and Amity is preparing human support options now.
```

Do not let the system continue normal productivity or motivational coaching in crisis mode.

---

## 10. Recovery Orchestrator

The Recovery Orchestrator prepares the recovery session based on the shared session context.

### Responsibilities

- Create recovery session
- Select recovery mode
- Prepare Gemini context
- Select ElevenLabs voice mode
- Prepare Beyond Presence avatar context
- Determine next route
- Route crisis cases to crisis safety flow

### Example orchestrator output

```json
{
  "sessionId": "SES-DEMO-001",
  "mode": "calm_reset",
  "geminiContextReady": true,
  "elevenLabsVoiceMode": "grounding_slow",
  "bpAvatarMode": "supportive_recovery",
  "nextRoute": "/user/recovery"
}
```

### Crisis orchestrator output

```json
{
  "sessionId": "SES-DEMO-CRISIS-001",
  "mode": "crisis_safety",
  "normalCoachingPaused": true,
  "handoffPrepared": true,
  "emergencyOptionsVisible": true,
  "nextRoute": "/user/crisis"
}
```

---

## 11. AI Response Layer

Gemini is responsible for:

- Emotional reasoning
- Safe response generation
- Context-aware conversation flow
- Crisis classification support
- Session summary generation
- Next action recommendation

### Gemini behavior rules

Gemini must:

- Speak calmly
- Keep responses short
- Avoid diagnosis
- Avoid therapy claims
- Ask permission before guiding
- Offer practical recovery steps
- Stop normal coaching during crisis
- Encourage human support where appropriate

---

## 12. ElevenLabs Voice Layer

ElevenLabs is responsible for natural emotional voice output.

### Voice modes

```txt
calm_supportive
warm_gentle
grounding_slow
firm_steady
crisis_serious
```

### Voice flow

```txt
Gemini response text
        ↓
Voice mode selected
        ↓
ElevenLabs TTS
        ↓
Audio output
        ↓
Beyond Presence avatar or Recovery Room audio player
```

---

## 13. Beyond Presence Avatar Layer

Beyond Presence is the video avatar interface.

### MVP

- Avatar placeholder frame
- Session context card
- Demo status indicators
- Future integration copy

### Future production

- Real BP avatar session
- Real-time avatar presence
- Audio input/output routing
- Possible lip-sync integration
- Recovery session handoff
- Avatar personalization

### BP avatar context example

```json
{
  "employeeName": "Sarah Perera",
  "triggerType": "manager_conflict",
  "emotionState": "sad_overwhelmed",
  "riskLevel": "high",
  "goal": "Help the employee calm down and prepare one next step.",
  "mode": "calm_reset"
}
```

---

## 14. MVP vs Future Scope

## 14.1 24-Hour MVP Scope

Build now:

- Role-based admin and employee shell
- Employee Trigger Demo
- Simulated trigger scenarios
- Shared session context object
- Rule-based risk engine
- Recovery Room UI
- Consent gate
- BP avatar placeholder
- Gemini response placeholder
- ElevenLabs voice placeholder
- Crisis mode simulation
- Employee summary page
- Company dashboard placeholders
- Privacy-safe analytics placeholders

Do not build now:

- Real Apple Watch integration
- Real WHOOP integration
- Real Teams/Slack/WhatsApp integration
- Real HR integration
- Real BP API integration unless simple and safe
- Real Gemini Live streaming
- Real face-api.js inference
- Real WebRTC
- Real emergency calling
- Real authentication

---

## 14.2 Future Production Scope

Build later:

- Real wearable integrations
- Real Microsoft Teams / Slack / WhatsApp event triggers
- Real calendar and call center integrations
- Gemini Live streaming
- Real ElevenLabs audio streaming
- Real Beyond Presence session integration
- Browser-side facial awareness with consent
- Enterprise role-based authentication
- Production database
- Audit logs
- Human handoff system
- Escalation workflow
- Admin policy controls
- Employee privacy controls
- Enterprise compliance controls

---

## 15. Recommended Folder Structure

```txt
amity/
│
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── analytics/
│   │   ├── summary/
│   │   └── settings/
│   │
│   ├── user/
│   │   ├── dashboard/
│   │   ├── recovery/
│   │   ├── trigger-demo/
│   │   ├── crisis/
│   │   ├── summary/
│   │   ├── profile/
│   │   └── settings/
│   │
│   └── api/
│       ├── triggers/
│       ├── recovery-sessions/
│       ├── agent/
│       ├── voice/
│       ├── safety/
│       ├── crisis/
│       └── analytics/
│
├── components/
│   ├── layout/
│   ├── ui/
│   ├── trigger/
│   ├── recovery/
│   ├── crisis/
│   └── analytics/
│
├── lib/
│   ├── demo-identities.ts
│   ├── demo-trigger-scenarios.ts
│   ├── demo-store.ts
│   ├── session-context.ts
│   ├── consent-manager.ts
│   ├── facial-awareness.ts
│   ├── voice-session.ts
│   ├── signal-engine.ts
│   ├── risk-engine.ts
│   ├── safety-classifier.ts
│   ├── recovery-orchestrator.ts
│   ├── gemini.ts
│   ├── elevenlabs.ts
│   ├── beyond-presence.ts
│   └── crisis-escalation.ts
│
├── types/
│   ├── identity.ts
│   ├── employee.ts
│   ├── trigger.ts
│   ├── emotion.ts
│   ├── consent.ts
│   ├── session-context.ts
│   ├── facial-awareness.ts
│   ├── voice.ts
│   ├── session.ts
│   ├── crisis.ts
│   └── analytics.ts
│
└── docs/
    ├── PROJECT_PLAN.md
    ├── API_PLAN.md
    ├── UI_PLAN.md
    ├── DEMO_SCRIPT.md
    ├── CURSOR_TASKS.md
    └── BUILD_PROGRESS.md
```

---

## 16. Files to Create or Update

### New or updated lib files

```txt
lib/session-context.ts
lib/consent-manager.ts
lib/facial-awareness.ts
lib/voice-session.ts
lib/recovery-orchestrator.ts
lib/crisis-escalation.ts
lib/demo-trigger-scenarios.ts
lib/demo-identities.ts
lib/safety-classifier.ts
lib/risk-engine.ts
lib/signal-engine.ts
```

### New or updated type files

```txt
types/consent.ts
types/session-context.ts
types/facial-awareness.ts
types/voice.ts
types/analytics.ts
types/identity.ts
types/trigger.ts
types/emotion.ts
types/session.ts
types/crisis.ts
```

### Recovery UI components to build

```txt
components/recovery/ConsentGate.tsx
components/recovery/AvatarSessionPanel.tsx
components/recovery/ConversationPanel.tsx
components/recovery/VoiceOutputPanel.tsx
components/recovery/SharedContextPanel.tsx
components/recovery/SignalStatusPanel.tsx
components/recovery/SafetyStatusPanel.tsx
components/recovery/SessionControls.tsx
```

---

## 17. Trigger Demo Scenarios

The employee Trigger Demo should include:

```txt
manager_conflict
customer_escalation
workload_spike
panic_before_presentation
late_night_burnout
sales_rejection
manual_help_request
wake_word
future_video_signal
critical_self_harm_risk
```

Each scenario should include:

- id
- label
- source
- sourceType
- context
- emotionSignal
- stressScore
- heartRate
- voiceState
- facialSignal
- engagement
- riskLevel
- recommendedAction
- timeline
- payload

---

## 18. API Planning

### MVP API routes

```txt
GET  /api/employees
POST /api/triggers
GET  /api/employees/:id/state
POST /api/recovery-sessions
POST /api/agent/respond
POST /api/voice/generate
POST /api/safety/classify
POST /api/crisis/incidents
POST /api/crisis/handoff
GET  /api/analytics
```

### Future API routes

```txt
POST /api/integrations/wearables/apple-watch
POST /api/integrations/wearables/whoop
POST /api/integrations/workplace/teams
POST /api/integrations/workplace/slack
POST /api/integrations/workplace/whatsapp
POST /api/integrations/call-center/events
POST /api/session/facial-signal
POST /api/session/voice-signal
POST /api/session/context/update
POST /api/session/context/:sessionId
POST /api/beyond-presence/session
POST /api/gemini/live-session
POST /api/elevenlabs/stream
POST /api/crisis/escalate
```

---

## 19. Recovery Room Requirements

The Recovery Room should include:

- Consent Gate
- Beyond Presence avatar placeholder
- Conversation panel
- Gemini response placeholder
- ElevenLabs voice placeholder
- Shared session context panel
- Signal status panel
- Safety status panel
- Session controls
- Crisis route if needed

### Recovery Room flow

```txt
User opens /user/recovery
        ↓
Consent gate appears
        ↓
User starts private recovery session
        ↓
Avatar session panel appears
        ↓
User sends or selects message
        ↓
Safety classifier checks message
        ↓
Normal response or crisis mode
        ↓
Voice placeholder updates
        ↓
Session can complete to summary
```

---

## 20. Privacy Boundary

### Employee private data

The following should remain private:

- Conversation transcript
- Personal emotional details
- Sensitive session notes
- Crisis phrases
- Individual recovery notes
- Facial awareness output
- Voice transcript unless explicitly required for safety process

### Company-visible data

Company admin should only see:

- Recovery session count
- Aggregated stress trends
- Department-level statistics
- Trigger category counts
- Average recovery completion
- Escalation count without sensitive details
- Anonymous wellbeing insights

---

## 21. Safety and Crisis Rules

If crisis is identified:

```txt
Normal coaching stops
Crisis Safety Mode activates
Human handoff is prepared
Emergency options appear
The user remains engaged
Company receives only what is allowed by safety policy
```

Amity must not act as the final crisis support provider.

It should be positioned as:

```txt
A bridge to immediate human support.
```

---

## 22. Future Integration Notes

### Apple Watch / WHOOP

Future use:

- Heart rate
- HRV
- sleep signals
- stress indicators
- recovery score

### Microsoft Teams / Slack / WhatsApp

Future use:

- user-triggered keywords
- meeting overload context
- escalation event signals
- private support notifications

### Call center platforms

Future use:

- angry customer event
- call duration
- escalation level
- post-call recovery trigger

### Beyond Presence

Future use:

- video avatar session
- voice/avatar response
- lip-sync if supported
- session handoff

### Gemini Live

Future use:

- streaming conversation
- real-time STT
- reasoning
- safety classification
- response generation

### ElevenLabs

Future use:

- natural emotional voice
- voice styles by emotion
- crisis-serious voice
- multilingual support

### face-api.js

Future use:

- optional browser-side visible cue awareness
- broad expression estimation
- engagement estimation
- never diagnosis
- consent required

---

## 23. Implementation Roadmap

### Completed or current

```txt
Step 1 Foundation, docs, rules, placeholders
Step 2 Next.js app shell
Step 3 Design system
Step 3.2 Role-based admin and employee shell
Step 3.4 Product realism pass
Step 4 Architecture update for shared session context
Step 5 Recovery Room UI
```

### Next recommended steps

```txt
Step 6 Mock API routes and demo store
Step 7 Recovery summary flow
Step 8 Crisis Safety Flow UI polish
Step 9 Gemini basic integration
Step 10 ElevenLabs basic integration
Step 11 Beyond Presence adapter integration
Step 12 Final demo flow and pitch polish
```

---

## 24. Environment Variables

```env
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
BEYOND_PRESENCE_API_KEY=
BEYOND_PRESENCE_AGENT_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Future:

```env
GEMINI_LIVE_MODEL=
FACE_AWARENESS_ENABLED=false
WEBRTC_ENABLED=false
CRISIS_ESCALATION_PROVIDER=
TEAMS_WEBHOOK_URL=
SLACK_WEBHOOK_URL=
WHATSAPP_PROVIDER_API_KEY=
```

---

## 25. Key Engineering Principles

- Keep MVP and future scope separate
- Keep admin and employee views separate
- Do not expose private employee content to admin
- Use typed session context
- Keep integrations behind service wrappers
- Use placeholders safely before real APIs
- Avoid throwing stubs if UI imports them
- Avoid medical claims
- Crisis mode must stop normal coaching
- Mobile must feel like an app
- Desktop must feel like real SaaS
- Keep UI calm and professional

---

## 26. Final Architecture Summary

```txt
Signal Sources
    ↓
Consent + Session Gate
    ↓
Shared Session Context
    ↓
Risk + Safety Engine
    ↓
Recovery Orchestrator
    ↓
Gemini Reasoning Layer
    ↓
ElevenLabs Voice Layer
    ↓
Beyond Presence Avatar Interface
    ↓
Recovery Summary
    ↓
Privacy-Safe Analytics
    ↓
Crisis Escalation if needed
```

Amity should be built as a modular emotional recovery system where every signal source, AI layer, voice layer, avatar layer, and crisis layer can be replaced or improved later without changing the whole product.
