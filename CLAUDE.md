# CLAUDE.md — KiT-Con-Man

This file provides guidance for AI assistants working in this repository.

## Project Overview

**KiT-Con-Man** (Keep in Touch Contact Manager) is a client-side React single-page application that helps users maintain personal relationships through a spaced repetition scheduling algorithm. It has no backend — all data lives in the browser's `localStorage`.

**Author:** Ted (teddexter0@gmail.com)
**License:** Proprietary — do not distribute or modify without permission.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.2.0 (Create React App / react-scripts 5.0.1) |
| Styling | Tailwind CSS via CDN + custom `App.css` |
| Icons | lucide-react 0.263.1 |
| Date utilities | date-fns 2.30.0 (available but not used in core code) |
| Storage | Browser `localStorage` (no backend) |
| State management | React hooks (`useState`, `useEffect`) only |
| Build tool | react-scripts (no ejected webpack config) |

---

## Directory Structure

```
KiT-CoN-MaN/
├── public/
│   └── index.html              # HTML shell; loads Tailwind via CDN
├── src/
│   ├── index.js                # React DOM entry point (StrictMode)
│   ├── App.js                  # Thin wrapper — renders <RelationshipTracker />
│   ├── components/
│   │   ├── RelationshipTracker.js  # Root component; owns ALL state (~340 lines)
│   │   ├── ContactCard.js          # Read-only display card for one contact (~155 lines)
│   │   └── ContactForm.js          # Add/edit form for a contact (~155 lines)
│   ├── styles/
│   │   └── App.css             # Animations, mobile overrides, focus styles
│   └── utils/
│       ├── dateUtils.js        # Scheduling algorithm, date helpers, scoring
│       └── storageUtils.js     # localStorage read/write/export helpers
├── assets/screenshots/         # PNG screenshots used in README
├── package.json
└── README.md
```

---

## Development Commands

```bash
npm install     # Install dependencies
npm start       # Start dev server on http://localhost:3000 (hot reload)
npm run build   # Production build to /build
npm test        # Run tests (currently none exist)
```

> **Note:** There is no test suite yet. `npm test` will open Jest in watch mode but find no test files.

---

## Architecture & Data Flow

### State ownership
All application state is held in `RelationshipTracker.js`. Child components receive data and callbacks via props — there is no context, Redux, or external state library.

```
RelationshipTracker (state owner)
├── ContactForm      — receives { contact, onSave, onCancel, isEditing }
└── ContactCard      — receives { contact, onContact, onEdit, onDelete, isDue }
```

### Persistence
- **Auto-save:** A `useEffect` in `RelationshipTracker` calls `saveContacts(contacts)` every time `contacts` changes.
- **Auto-load:** A one-time `useEffect` on mount calls `loadContacts()`.
- **Storage key:** `kitConManContacts`
- **Format:** `{ version: "1.0.0", timestamp: ISO string, contacts: Contact[] }`
- **Export:** `exportContacts()` (in `storageUtils.js`) triggers a browser JSON download.

### Contact data shape

```js
{
  id: number,               // Date.now() at creation
  name: string,             // Required
  contactType: 'estranged' | 'active',
  lastContact: 'YYYY-MM-DD',
  nextContact: Date,        // Calculated by calculateNextContactDate()
  location: string,
  pastConnection: string,   // e.g. "College roommate"
  notes: string,
  repCount: number,         // Total check-ins recorded
  totalContacts: number,    // Same as repCount (legacy field)
  relationshipScore: number,// Weighted sum of interaction weights
  lastMethod: 'message' | 'call' | 'meetup' | 'trip' | null,
  interactions: Interaction[], // Last 10 interactions kept
  createdDate: 'YYYY-MM-DD'
}

// Interaction shape
{ date: 'YYYY-MM-DD', method: string, weight: number }
```

---

## Core Business Logic

### Spaced Repetition Algorithm (`dateUtils.js`)

**Estranged contacts** use a "Gentle Reconnection" schedule:
```
Rep 0 → +1 day
Rep 1 → +7 days
Rep 2 → +14 days
Rep 3 → +21 days
Rep 4 → +30 days
Rep 5 → +45 days
Rep 6 → +60 days
Rep 7+ → +90 days (maintenance mode)
Total cycle: ~268 days
```

**Active relationships** use a gentler maintenance schedule:
```
Rep 0 → +14 days
Rep 1 → +30 days
Rep 2 → +45 days
Rep 3+ → +60 days (steady state)
```

### Interaction Types & Weights

| Method | Weight | Points toward score |
|--------|--------|-------------------|
| `message` | 0.5 | Low effort |
| `call` | 1 | Medium effort |
| `meetup` | 2 | High effort |
| `trip` | 3 | Very high effort |

### Relationship Strength Tiers

| Score | Stars | Label |
|-------|-------|-------|
| 0–4 | ★ | New |
| 5–9 | ★★ | Started |
| 10–14 | ★★★ | Building |
| 15–19 | ★★★★ | Strong |
| 20+ | ★★★★★ | Reconnected |

### Daily Workload Formula
```
dailyAverage = (estrangedCount × 8) / 268
Manageable threshold: ≤ 3 contacts/day
```

### Suggested Interaction (per repCount)
For estranged contacts: `message → message → call → meetup (rep 3+)`
For active contacts: `call` if ≥14 days since last contact, else `message`

### Reconnection Phases
| repCount | Phase label |
|----------|-------------|
| 0 | Initial reconnection |
| 1 | Follow-up phase |
| 2 | Deepening connection |
| 3+ | Building friendship |

---

## Styling Conventions

- **Tailwind first:** Use Tailwind utility classes for virtually all styling.
- **Custom CSS** (`src/styles/App.css`) is reserved for: CSS animations (`@keyframes slideIn`), mobile-specific overrides (`max-width: 768px`), and global transition defaults.
- **No CSS-in-JS**, no CSS Modules, no PostCSS build step (Tailwind is loaded from CDN in `public/index.html`).
- **Color system:** Component-level color is set via inline Tailwind class strings. Dynamic colors use template strings like `` `bg-${config.color}-100` `` — be careful when adding new colors as Tailwind CDN purging may not work correctly with dynamically constructed class names.
- **Responsive:** Mobile-first via Tailwind `md:` breakpoints. The background gradient uses an `attachment: fixed` fallback for mobile scroll.

---

## Code Conventions

### Naming
- **Components:** PascalCase (`RelationshipTracker`, `ContactCard`, `ContactForm`)
- **Functions/variables:** camelCase (`markAsContacted`, `repCount`)
- **Constants:** camelCase or `SCREAMING_SNAKE_CASE` for module-level constants (`STORAGE_KEY`, `APP_VERSION`)
- **File names:** Match the exported component name exactly

### React patterns
- Functional components only — no class components.
- Hooks: `useState` and `useEffect` only; no `useCallback`, `useMemo`, or custom hooks currently.
- Prop callbacks follow the `onEvent` pattern (`onSave`, `onCancel`, `onContact`, `onEdit`, `onDelete`).
- IDs are generated with `Date.now()` — single-user app, so collisions are not a concern.

### Error handling
- `try/catch` with `console.error` in storage utilities; functions return `false`/`[]` on failure.
- Destructive UI actions use `window.confirm` for confirmation.
- No global error boundaries currently exist.

### Imports
- React is always imported explicitly: `import React, { useState, useEffect } from 'react';`
- Lucide icons are imported individually by name.
- Utilities are imported by named export from their respective utils files.

---

## Known Gaps & Future Work

- **No tests:** No unit or integration tests exist. Adding React Testing Library tests is a natural next step.
- **No CI/CD:** No GitHub Actions or other pipelines are configured.
- **No backend:** All data is local to the browser. Adding cloud sync would require an auth layer and API.
- **No migration logic:** `storageUtils.js` logs a warning on version mismatch but does not migrate data.
- **Daily limit not persisted:** The `dailyLimit` state defaults to `2` on every page load; it is not saved to localStorage.
- **Dynamic Tailwind classes:** Template-literal class names (e.g., `` `bg-${color}-100` ``) may be purged incorrectly if Tailwind's CDN mode doesn't scan JS — test any new dynamic color additions carefully.
- **`date-fns` unused:** The library is installed but not imported anywhere in the current codebase.

---

## Git Workflow

- All commits go to the `claude/...` feature branch specified in session context, never directly to `master` or `main`.
- Commit messages follow an informal, lowercase style (matching the existing history).
- Always push with `git push -u origin <branch-name>`.
- This is a private repo accessed through a local proxy at `127.0.0.1:33224`.
