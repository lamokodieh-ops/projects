# Project Instructions

@.ai-style-rules.md

Portfolio of independent apps (InLumine, Fortis, Cortex, FeedMe, MindCare, Quirkly, Kairos, Merit). Gallery: `docs/` → GitHub Pages.

## Stacks

- InLumine: Next.js 15 + Prisma + NextAuth + Zod
- Fortis / Cortex / FeedMe: Flask APIs or server-rendered Flask
- MindCare / Quirkly: Vite + React (static gallery builds)
- Kairos: C11 · Merit: C++17

## Code style

Follow the golden file for that project. Do not mix Next.js patterns into Flask apps or vice versa.

## Testing

- FeedMe: `python -m unittest` in `harvard_meal_planner_website`
- Fortis: `python -m unittest` in `wealth_platform/backend`
- Cortex: `python -m unittest` in `ai_study_assistant/backend`
- InLumine: `npm test` (rbac)
- Native: `make` in `event_management_system` and `merit`

## Run

See each project README. Production Flask apps require a non-default secret (`SECRET_KEY` / `FLASK_SECRET_KEY` / `JWT_SECRET_KEY`) when `FLASK_ENV=production` or Render/Railway is set.

## Conventions

- Commits: conventional (`feat`, `fix`, `docs`, `test`, `chore`)
- Do not commit `.env`, `*.db`, `credentials.bin`, or compiled binaries
