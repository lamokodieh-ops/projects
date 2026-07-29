# Projects

Portfolio of software projects by [lamokodieh-ops](https://github.com/lamokodieh-ops).

**Gallery (no setup):** https://lamokodieh-ops.github.io/projects/

| Project | Type | Run locally | Open without setup |
|---------|------|-------------|--------------------|
| [MindCare — Mental Health Services](./mindcare) | React + Vite + Tailwind | `npm install && npm run dev` | [Live demo](https://lamokodieh-ops.github.io/projects/mindcare/) |
| [Fortis — Wealth Platform](./wealth_platform) | React + Flask + SQL | Backend `python app.py` · Frontend `npm run dev` | [Live demo](https://lamokodieh-ops.github.io/projects/fortis/) (browser mock) |
| [InLumine](./inlumine) | Next.js alumni platform | `npm install && npm run db:setup && npm run dev` | [Demo notes](https://lamokodieh-ops.github.io/projects/inlumine/) (full app needs Vercel + DB) |
| [FeedMe — Harvard Meal Planner](./harvard_meal_planner_website) | Flask + SQLite | `pip install -r requirements.txt && python app.py` | [Video demo page](https://lamokodieh-ops.github.io/projects/feedme/) |
| [Cortex — AI Study Assistant](./ai_study_assistant) | Next.js + Flask + RAG | Backend `python app.py` · Frontend `npm run dev` | [Live demo](https://lamokodieh-ops.github.io/projects/cortex/) (browser mock) |
| [Quirkly — Personality-aware Habits](./quirkly) | React + Vite + Router | `npm install && npm run dev` | [Live demo](https://lamokodieh-ops.github.io/projects/quirkly/) (seeded demo) |
| [Event Management System](./event_management_system) | C terminal app | `make && ./event_manager` | [Browser CLI demo](https://lamokodieh-ops.github.io/projects/event_manager/) |

## Clone

```bash
git clone https://github.com/lamokodieh-ops/projects.git
cd projects
```

Then open any project folder and follow its README.

## Gallery page

A static project gallery lives at [`docs/index.html`](./docs/index.html).  
Published via GitHub Pages (`main` → `/docs`):

https://lamokodieh-ops.github.io/projects/

`docs/.nojekyll` is required so GitHub Pages does not strip Next.js `_next` asset folders.

### Republishing interactive demos

| Demo | Command |
|------|---------|
| MindCare | `cd mindcare && npm run build:gallery` |
| Fortis | `cd wealth_platform/frontend && npm run build:gallery` |
| Cortex | `cd ai_study_assistant/frontend && npm run build:gallery` |
| Quirkly | `cd quirkly && npm run build:gallery` |

Then commit the updated `docs/<name>` folder and push.

## Notes

- Each active web app has its own `README.md` with install, demo accounts (where applicable), and deploy steps.
- Gallery “Open demo” links avoid local setup: full static apps, in-browser mocks, a video embed, or a browser recreation of the CLI.
- InLumine cannot run fully on GitHub Pages (Prisma + NextAuth + API routes). Deploy to Vercel for a real hosted instance.
- Flask apps include a `Procfile` for Render / Railway / Heroku-style hosts.
- Secrets (`.env`, session files, compiled binaries) are gitignored where relevant.
