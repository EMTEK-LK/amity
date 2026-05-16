# Amity — UI Plan

## Design System

| Token | Usage |
|-------|--------|
| Background | Deep slate / near-black (`slate-950`, `zinc-900`) |
| Cards | `slate-900/80`, border `slate-700/50`, `rounded-2xl` |
| Accent | Soft cyan or violet gradient (recovery, CTA) |
| Danger | Amber/red for high risk and crisis |
| Success | Emerald for stress reduction, calm state |
| Typography | System sans, clear hierarchy, `text-slate-100` / `text-slate-400` |

- Dark theme first
- Mobile-first → desktop multi-column
- Framer Motion: subtle enter transitions, pulse on risk change
- Lucide icons throughout

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Entry / role picker or redirect to portal |
| `/trigger-portal` | **Main demo** — triggers, twin, risk, timeline |
| `/recovery-room` | Beyond Presence session |
| `/summary` | Before/after recovery |
| `/dashboard` | Company anonymous analytics |
| `/crisis` | Crisis safety mode UI |

## Trigger Portal (hero screen)

### Mobile (single column)

1. Employee card
2. Trigger buttons (large, full width)
3. Smartwatch / wellness circle + HR + stress + emotion
4. Risk level + engine decision
5. Timeline
6. JSON payload preview (collapsible)
7. Start recovery CTA

### Desktop (3 columns)

| Left | Center | Right |
|------|--------|-------|
| Triggers, employee | Smartwatch twin, vitals | Risk engine, timeline, JSON |

## Component Map

```
components/
  layout/     AppShell, Nav, PageHeader
  dashboard/  StatCards, TrendCharts, TriggerBreakdown
  trigger/    EmployeeCard, TriggerGrid, WellnessRing, RiskPanel, Timeline, PayloadPreview
  recovery/   SessionPlayer, AgentBubble, VoiceIndicator
  crisis/     CrisisBanner, EmergencyOptions, HandoffCard
  ui/         Button, Card, Badge, Progress, Skeleton
```

## Key States (visual)

- **Stable:** cool colors, low stress ring
- **Triggered:** warm pulse, elevated HR, high risk badge
- **In session:** focus mode, minimal chrome
- **Post-summary:** before/after bars, delta stress
- **Crisis:** distinct red/amber shell, no coaching UI

## Accessibility

- Touch targets ≥ 44px on mobile
- Color not sole indicator (icons + labels)
- Crisis content readable without animation dependency

## Copy Guidelines

Use recovery / workplace wellbeing language only (see `PROJECT_PLAN.md`).
