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

## Routes (role-based)

| Route | Role | Purpose |
|-------|------|---------|
| `/` | both | Role split entry — Admin vs Employee experience |
| `/admin/dashboard` | admin | Aggregated wellbeing KPIs |
| `/admin/employees` | admin | High-level status only |
| `/admin/analytics` | admin | Anonymized analytics |
| `/admin/summary` | admin | Company recap |
| `/admin/settings` | admin | Company / privacy / escalation / integration settings |
| `/user/dashboard` | employee | Personal wellbeing state |
| `/user/trigger-demo` | employee | **Main demo** — triggers, vitals, risk |
| `/user/recovery` | employee | Beyond Presence recovery session |
| `/user/summary` | employee | Private before/after recovery |
| `/user/crisis` | employee | Crisis safety mode UI |
| `/user/profile` | employee | Personal details + preferences |
| `/user/settings` | employee | Personal preferences |

Legacy routes (`/dashboard`, `/trigger-portal`, `/recovery-room`, `/crisis`) redirect into the new structure; `/summary` offers both summaries.

## Navigation behavior

- **One account dropdown** (identity name + role + `ChevronDown`) is the only role control — no separate Admin/Employee buttons, no duplicate role chips.
- **Desktop:** `Amity | role nav | [Account ▾] [Theme]`. Admin has **no primary CTA** (Dashboard is in nav). Employee has a single **Trigger Demo** primary CTA; Trigger Demo is **not** a nav item.
- **Mobile:** hamburger on the **left** + compact logo; theme toggle + compact profile icon on the right. Drawer **slides left → right** with brand, close, role/profile summary, account/role selector, role nav (active highlight), primary action (employee only), privacy footer. No duplicated desktop nav. Touch targets ≥ 44px; closes on item tap, `Esc`, or backdrop.
- Home is **role-aware**: admin = company overview (Open Company Dashboard); employee = personal recovery (Start Trigger Demo / Open My Dashboard). Employee home never promotes the admin panel.
- `/admin` while employee-selected → polished "switch to Company Admin" demo notice (not real auth).

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
