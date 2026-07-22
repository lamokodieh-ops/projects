# InLumine — PRESEC Alumni Management Platform

**InLumine** is the official alumni network for Presbyterian Boys' Senior High School, Legon (PRESEC). It connects administration, current students, and graduated alumni (Ɔdadeɛ) in one place: searchable directories, college mate networking, opportunities, and a social feed.

Built from the Alumni Management System use-case specification with role-based access for four actor types.

## Tech stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API routes
- **Database:** SQLite via Prisma (swap to PostgreSQL for production — see below)
- **Auth:** NextAuth.js (credentials provider, JWT sessions)

## Quick start

```bash
cd inlumine
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy for display (Vercel)

InLumine is a full-stack Next.js app (auth + database). **GitHub Pages cannot host it.**

1. Import `lamokodieh-ops/projects` into [Vercel](https://vercel.com).
2. Set **Root Directory** to `inlumine`.
3. Add a Postgres database (Vercel Postgres, Neon, or Supabase).
4. In `prisma/schema.prisma`, set `provider = "postgresql"`.
5. Environment variables:
   - `DATABASE_URL` — from your Postgres provider
   - `NEXTAUTH_SECRET` — long random string
   - `NEXTAUTH_URL` — your Vercel URL (e.g. `https://your-app.vercel.app`)
6. After first deploy, run seed once against the hosted DB:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

A `vercel.json` is included for Next.js build defaults.

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@inlumine.presec.edu.gh | Admin123! |
| System User | staff@inlumine.presec.edu.gh | Staff123! |
| Alumni (College Mate) | kwabena@example.com | Alumni123! |
| Student | student@example.com | Student123! |

Additional seeded alumni: abena@example.com, yaw@example.com, efua@example.com, kojo@example.com — all use **Alumni123!**

## Features by role

### Super Admin
- User & role management, alumni verification
- Full college data, social & opportunity moderation
- Analytics dashboard and audit log

### System User
- College announcements and departments
- Opportunity review and social moderation
- No access to user accounts or alumni master records

### College Mate (Alumni)
- Search/browse alumni directory
- Send/accept connection requests
- Post to social feed, browse/post opportunities
- Edit profile with visibility controls

### Student
- Search alumni by name, year, department, company, location
- Browse opportunities and college announcements
- Edit student profile

## Environment variables

Copy `.env.example` to `.env`:

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
```

For PostgreSQL, change `provider` in `prisma/schema.prisma` to `postgresql` and set `DATABASE_URL` accordingly.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:setup` | Push schema + seed demo data |
| `npm run db:seed` | Re-seed database |

## Assumptions

- **College Mate** maps to PRESEC alumni (Ɔdadeɛ); **Student** maps to currently enrolled students.
- **Super Admin** is a superset of System User permissions, per the use-case diagram analysis.
- SQLite is used for zero-config local demo; production deployments should use PostgreSQL.
- Profile photo upload and email delivery are stubbed (in-app notifications only).
- Opportunity postings by alumni require admin approval; admin postings auto-approve.

## Brand

Visual identity follows the InLumine brand guide: Presec Navy (#10203F), Torch Gold (#E3A542), Parchment backgrounds, Fraunces + Work Sans + IBM Plex Mono typography.
