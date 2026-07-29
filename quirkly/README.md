# Quirkly — Personality-aware Habit Tracking

A calm, quirky habit companion for students and anyone rebuilding routine without the guilt spiral. Built with **React**, **Vite**, and **React Router**. Data stays in the browser via **`localStorage`** (no backend required).

Quirkly started as a capstone prototype (AtomicFlo) and was rebranded with a coral/ink visual system, honest marketing copy, and a richer demo seed.

---

## At a glance

| | |
|---|---|
| **Stack** | React 19 · Vite 8 · React Router 7 |
| **Persistence** | `localStorage` (`quirkly_state_v1`; migrates legacy AtomicFlo keys) |
| **Themes** | Ink (dark) · Cloud (light) · Pop (teal + citrus) |
| **Run** | `npm install && npm run dev` → http://localhost:5173 |
| **Live demo** | [Open on GitHub Pages](https://lamokodieh-ops.github.io/projects/quirkly/) — no install required |
| **Deploy** | Static host (GitHub Pages gallery, Vercel, Netlify, etc.) |

---

## Features

- **Landing** — Brand-first hero, honest feature copy (no fake metrics), Get Started / View Demo
- **Local auth** — Sign up stores name + email; sign in matches email on this device (passwords are **not** verified in this capstone build)
- **Onboarding quiz** — Four phases covering goals, challenges, schedule/energy/accountability, and starter habits (non-clinical productivity framing)
- **Personalization engine** — Quiz answers → archetype, challenges/strengths, simple-view / one-habit focus, starter-step sizing, encouragement tone
- **Dashboard** — Today’s focus card, complete / reschedule (snooze until tomorrow), habit list, adaptive insights, weekly completion chart
- **Habit CRUD** — Daily or weekly frequency, category, preferred time, micro-steps, optional progress targets
- **Focus mode** — 25-minute timer (Start / Pause / Resume / Reset), subtask checklist, mark today done
- **Insights** — 30-day consistency, weekly rhythm, time-aware greeting, per-habit history
- **Settings** — Themes, local reminder prefs (browser-only flags), JSON export/import, retake quiz, clear session
- **Gallery demo mode** — `VITE_DEMO=true` seeds Elena + 12 habits at varying progression stages and opens the dashboard immediately

> **Note:** Google OAuth, password reset, and push notifications are intentionally omitted. Reminder toggles are preference flags only.

---

## Prerequisites

- **Node.js** 18+ recommended
- **npm** (bundled with Node)

On Windows PowerShell, if `npm` fails with “running scripts is disabled”, use `npm.cmd` or set:

`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

---

## Installation and setup

### 1. Clone and enter the project

```bash
git clone https://github.com/lamokodieh-ops/projects.git
cd projects/quirkly
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open **http://localhost:5173** (or the port Vite prints).

### 4. Production build

```bash
npm run build
npm run preview
```

- `build` outputs static assets to `dist/` with base path `/projects/quirkly/` (gallery)
- `preview` serves that build locally for a smoke check

---

## Try the product flows

| Path | What to do |
|------|------------|
| **Gallery / Open demo** | Lands on dashboard as **Elena** with 12 seeded habits (hot streak, recovering, brand-new, weekly on/behind, snoozed, inactive archive) |
| **View Demo** (local landing) | Same seed, then jumps to dashboard |
| **Sign up → quiz → dashboard** | Full onboarding; habits seeded from quiz ideas if the list is empty |
| **Focus** | Pick a habit, start the timer, mark today done |
| **Reschedule** | From Today’s focus — hides the habit until tomorrow |
| **Settings** | Switch **Cloud** / **Pop**, export JSON, retake quiz |

Demo account (local View Demo / gallery): **Elena** · `elena@demo.quirkly`

---

## Project structure

```
quirkly/
├── public/                 # favicon
├── scripts/
│   └── publish-gallery.mjs # copies dist → ../docs/quirkly
├── src/
│   ├── brand.js            # Name, copy, theme ids, helpers
│   ├── demoData.js         # Gallery / View Demo seed + isDemo flag
│   ├── components/         # AppShell, WeekChart, ThemeBinder, UI kit
│   ├── context/            # QuirklyProvider (state + localStorage)
│   ├── engine/             # Personalization rules
│   ├── pages/              # Landing, auth, quiz, dashboard, focus, …
│   ├── utils/              # dates, streaks, storage (+ theme migration)
│   ├── App.jsx             # Router (basename from Vite BASE_URL)
│   ├── main.jsx
│   └── index.css           # Themes, layout, motion
├── .env.gallery            # VITE_DEMO=true for Pages builds
├── index.html
├── package.json
└── vite.config.js          # base `/projects/quirkly/` on build
```

### Routes

| Path | Screen |
|------|--------|
| `/` | Landing (gallery demo redirects to dashboard) |
| `/login`, `/signup` | Local auth shells |
| `/onboarding`, `/onboarding/results` | Quiz + derived profile |
| `/dashboard` | Today |
| `/dashboard/habit/new`, `.../:id/edit` | Habit form |
| `/focus`, `/focus/:habitId` | Focus session |
| `/insights` | Stats & history |
| `/quiz` | Retake entry |
| `/settings` | Profile, themes, data |

---

## Architecture notes

| Piece | Role |
|-------|------|
| `QuirklyProvider` | Profile, habits, theme, prefs; syncs to `localStorage` on change |
| `personalization.js` | Explainable quiz → UX flags, archetype, challenges/strengths, headlines |
| `WeekChart` | Weekly completion % bars (fixed-height track so percentages render) |
| Themes | `theme-ink` / `theme-cloud` / `theme-pop` classes on `<html>` via `ThemeBinder` |
| Storage | Migrates `atomicflo_state_v1` and legacy theme ids (`deep`→`ink`, etc.) |

---

## Customization

| What | Where |
|------|--------|
| Brand name & hero copy | `src/brand.js` |
| Colors / themes | `src/index.css` (`.theme-ink`, `.theme-cloud`, `.theme-pop`) |
| Demo habits | `src/demoData.js` |
| Quiz phases | `src/pages/OnboardingQuiz.jsx` |
| Personalization rules | `src/engine/personalization.js` |
| Page title / fonts | `index.html` |

---

## Live demo (GitHub Pages)

A no-setup demo is published with the portfolio gallery:

**https://lamokodieh-ops.github.io/projects/quirkly/**

From the [gallery](https://lamokodieh-ops.github.io/projects/), use **Open demo** (listed after Cortex). The gallery build sets `VITE_DEMO=true` so the app seeds sample data and opens the dashboard immediately—same idea as Fortis / Cortex browser demos.

### Republish after UI changes

From this folder (inside the `projects` monorepo):

```bash
npm run build:gallery
```

That builds with `/projects/quirkly/` base path and `VITE_DEMO=true`, then copies output into `../docs/quirkly/` (including a `404.html` SPA fallback). Commit and push the `docs/quirkly` update so Pages picks it up.

---

## Deploy elsewhere

This is a **static SPA** after `npm run build`. Any static host works.

> Production `vite build` uses `base: '/projects/quirkly/'` for the gallery. For a root-domain host (Vercel/Netlify at `/`), set `base: '/'` in `vite.config.js` (or pass `--base /`) and omit or unset `VITE_DEMO` unless you want the seeded demo.

### Vercel

1. Import the `lamokodieh-ops/projects` repo (or a fork).
2. Set **Root Directory** to `quirkly`.
3. Build command: `npm run build` (with `base: '/'` if deploying at domain root)
4. Output directory: `dist`
5. Deploy

### Netlify

- Base directory: `quirkly`
- Build: `npm run build` (with `base: '/'` for root deploy)
- Publish: `dist`
- SPA fallback (e.g. `_redirects` in `public/`):

```
/*    /index.html   200
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle → `dist/` (gallery base path) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run build:gallery` | Gallery-mode build + copy into `docs/quirkly` for GitHub Pages |

---

## Technologies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- CSS custom properties (Ink / Cloud / Pop themes)
- Syne + Outfit (Google Fonts)

---

## License

Part of the [lamokodieh-ops/projects](https://github.com/lamokodieh-ops/projects) portfolio. Available for portfolio and educational use.
