# Habit Tracker Pro (Frontend-only)

A modern, responsive Daily Habit Tracker React SPA that stores everything locally (IndexedDB with graceful fallback to localStorage). Includes streaks, analytics, reminders, exports, offline support, and a demo data generator.

## Quick start

```bash
npm install
npm start
```

Open http://localhost:3000

## Features

- Habits: create, edit, delete, archive/restore
- Categories + color labels
- Daily check-ins with:
  - current streak and best streak
  - completion rates (7/30 day windows)
- Dashboard summary cards:
  - total habits, active habits, today completion, best streak
- Analytics:
  - weekly/monthly completion charts (lightweight SVG)
  - habit heatmap for last ~12 weeks
- Gamification:
  - XP and levels computed from completed check-ins
  - badges for streak milestones
- Exports:
  - CSV export (habits + history)
  - PDF export via a lightweight print view (“Save as PDF”)
- Notifications:
  - best-effort daily reminders (Notifications API + timers while tab is open)
- Offline/PWA:
  - custom service worker for offline caching
  - manifest configured

## Storage

- Preferred: IndexedDB
- Fallback: localStorage
- Basic schema versioning is included.

## Feature flags

Controlled via `REACT_APP_FEATURE_FLAGS` (comma-separated). If empty/unset, features default ON.

Flags:
- `notifications`
- `export_csv`
- `export_pdf`
- `analytics`
- `gamification`
- `pwa`
- `demo_data`

## Notes

- Reminder scheduling is best-effort: browsers may throttle timers in background tabs.
- PDF export uses the browser print dialog to avoid bundling a heavy PDF library.
