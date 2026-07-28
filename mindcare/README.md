# MindCare — Mental Health Services Website

A modern, responsive marketing and intake site for a mental health practice. Built with **React**, **Vite**, **React Router**, and **Tailwind CSS**.

MindCare presents services, practice information, FAQs, and contact options, and includes an appointment request form for prospective clients.

---

## At a glance

| | |
|---|---|
| **Stack** | React 18 · Vite · React Router · Tailwind CSS |
| **Pages** | Home, About, FAQ, Contact, Book Appointment |
| **Run** | `npm install && npm run dev` → http://localhost:5173 |
| **Deploy** | Static host (Vercel, Netlify, GitHub Pages, etc.) |

---

## Features

- **Home** — Full-bleed hero, practice stats, and an interactive services gallery (Individual, Couples, Family, Anxiety & Stress, Trauma-Informed, Life Transitions)
- **Service detail panels** — Expandable cards with overview, focus areas, approach, duration, format, and pricing
- **About** — Practice story and values
- **FAQ** — Common client questions
- **Contact** — Reach-out form and practice contact details
- **Book Appointment** — Intake form (name, contact, service type, preferred date/time, message)
- **Responsive navigation** — Desktop dropdown for services; mobile accordion menu
- **Scroll-to-top** on route changes; deep links to individual service sections via hash

> **Note:** Form submissions currently log to the console and show a confirmation alert. Wire them to an API, email service, or form backend before using in production.

---

## Prerequisites

- **Node.js** 16+ (18+ recommended)
- **npm** (bundled with Node)

---

## Installation and setup

### 1. Clone and enter the project

```bash
git clone https://github.com/lamokodieh-ops/projects.git
cd projects/mindcare
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open **http://localhost:5173**

### 4. Production build

```bash
npm run build
npm run preview
```

- `build` outputs static assets to `dist/`
- `preview` serves that build locally for a smoke check

---

## Project structure

```
mindcare/
├── public/                 # Static images (hero + service photos)
├── src/
│   ├── components/         # Header, Hero, Services, Footer, ScrollToTop, …
│   ├── pages/              # Home, About, FAQ, Contact, BookAppointment
│   ├── App.jsx             # Router + layout shell
│   ├── main.jsx            # React entry
│   └── index.css           # Tailwind + shared styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

### Routes

| Path | Page |
|------|------|
| `/` | Home (hero + services) |
| `/about` | About the practice |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |
| `/book-appointment` | Appointment request form |

Service deep links use hashes on the home page (e.g. `/#services-individual`).

---

## Customization

| What | Where |
|------|--------|
| Brand / colors | `tailwind.config.js` (`primary` palette) and `src/index.css` |
| Nav & CTAs | `src/components/Header.jsx` |
| Hero copy | `src/components/Hero.jsx` |
| Services list & pricing | `src/components/Services.jsx` |
| Appointment fields | `src/pages/BookAppointment.jsx` |
| Images | `public/` (`hero-image.png`, `individual.png`, …) |
| Page title | `index.html` |

---

## Deploy for display

This is a **static SPA** after `npm run build`. Any static host works.

### Vercel (recommended)

1. Import the `lamokodieh-ops/projects` repo (or a fork).
2. Set **Root Directory** to `mindcare`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

For client-side routing on refresh, ensure the host rewrites unknown paths to `index.html` (Vercel does this for Vite/React by default).

### Netlify

- Base directory: `mindcare`
- Build: `npm run build`
- Publish: `dist`
- Add a `_redirects` file in `public/` if needed:

```
/*    /index.html   200
```

### GitHub Pages (project site)

Build locally or in CI, then publish the `dist` folder. Configure the Vite `base` option if the site is served under a subpath (e.g. `/projects/mindcare/`).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production bundle → `dist/` |
| `npm run preview` | Preview the production build |

---

## Technologies

- [React 18](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- PostCSS + Autoprefixer

---

## License

Part of the [lamokodieh-ops/projects](https://github.com/lamokodieh-ops/projects) portfolio. Available for portfolio and educational use.
