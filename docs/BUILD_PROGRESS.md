# Amity — Build Progress

> **Source of truth** for hackathon build status. Update after every completed task.

## Current Status

**Phase:** Role-based navigation & shell corrected  
**Overall:** One professional account/role dropdown drives navigation, home, and primary action. Admin and employee experiences are fully separated. Mobile uses a clean left drawer. APIs/integrations still pending.

## Completed Tasks

- [x] Repository folder structure, types, lib placeholders
- [x] Light/dark theme system + sun/moon toggle + no-flash script
- [x] Reusable UI components (`components/ui/`)
- [x] Full production-quality UI for every screen (web + mobile)
- [x] Role-based admin/employee architecture, hardcoded identities
- [x] Role switcher redesigned as **one professional account dropdown** (`AccountMenu`)
- [x] Separate Admin/Employee header buttons and duplicate role chips removed
- [x] Employee **Trigger Demo moved out of nav** into a single primary CTA only
- [x] Extra "Open Dashboard" CTA removed from admin header (Dashboard is in nav)
- [x] Home page made **role-aware** (admin = company overview; employee = personal recovery)
- [x] Employee home no longer promotes the admin panel as a main action
- [x] Mobile navigation fixed: left hamburger, drawer slides left → right, no duplicated desktop nav
- [x] Drawer holds account/role selector, role nav, primary action, privacy footer
- [x] Optional `/admin` demo gate — polished "switch to Company Admin" notice
- [x] Demo identities centralized (`lib/demo-identities.ts`: `getDemoIdentityByRole`, `ROLE_LABELS`)
- [x] Profile/settings placeholders (user + admin)
- [x] Future video/audio crisis automation documented
- [x] Legacy routes still redirect (compatibility)
- [x] README and docs updated

## Current Task

**None** — Step 3.3 complete. Ready for Step 4.

## Next Task

**Step 4: Build full professional landing page with role-aware sections and demo CTAs**

## Issues / Blockers

None.

## Testing Status

| Check | Status |
|-------|--------|
| `npm run dev` | Pass |
| `npm run lint` | Pass (warnings in `lib/` engine placeholders only) |
| `npm run build` | Pass (23 routes) |
| Admin mode shows only admin nav | Pass |
| Employee mode shows only employee nav | Pass |
| One account dropdown (no separate role buttons) | Pass |
| Employee nav excludes Trigger Demo; CTA present | Pass |
| Admin header has no extra "Open Dashboard" | Pass |
| Home changes by selected role | Pass |
| Mobile: left hamburger, left → right drawer, no duplicate nav | Pass |
| Theme toggle visible (desktop + mobile) | Pass |
| Legacy routes redirect, app not broken | Pass |
| Mobile ~360px layout | Manual check recommended |

## Notes

- Role persisted in `localStorage` (`amity-role`), default `employee`.
- Admin areas expose aggregated/privacy-safe data only.
- Future in-call video/audio analysis → automatic Crisis Safety Mode is documented, not implemented.

---

*Last updated: Step 3.3 — Role navigation correction (2026-05-16)*
