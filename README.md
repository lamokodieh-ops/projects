# Projects

Portfolio of software projects by [lamokodieh-ops](https://github.com/lamokodieh-ops).

| Project | Type | Run locally | Live / display |
|---------|------|-------------|----------------|
| [InLumine](./inlumine) | Next.js alumni platform | `npm install && npm run db:setup && npm run dev` | Deploy to [Vercel](https://vercel.com) (see project README) |
| [FeedMe — Harvard Meal Planner](./harvard_meal_planner_website) | Flask + SQLite | `pip install -r requirements.txt && python app.py` | Deploy to [Render](https://render.com) · [Video demo](https://youtu.be/gQS6CYNJGTA) |
| [Event Management System](./event_management_system) | C terminal app | `make && ./event_manager` | See README (CLI — not a web app) |
| [Zen Finance](./archive/finance_web_app) *(archived)* | Flask stock portfolio | Inactive — see archived README | Not deployed |

## Clone

```bash
git clone https://github.com/lamokodieh-ops/projects.git
cd projects
```

Then open any project folder and follow its README.

## Gallery page

A static project gallery lives at [`docs/index.html`](./docs/index.html).  
To publish it on GitHub Pages:

1. Repo **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder: `/docs`

Then visit: `https://lamokodieh-ops.github.io/projects/`

## Notes

- Each active web app has its own `README.md` with install, demo accounts (where applicable), and deploy steps.
- Flask apps include a `Procfile` for Render / Railway / Heroku-style hosts.
- InLumine uses SQLite locally; use PostgreSQL for production (instructions in its README).
- Secrets (`.env`, session files, compiled binaries) are gitignored where relevant.
- Inactive projects live under [`archive/`](./archive). **Zen Finance** is archived there and is not part of the active portfolio.
