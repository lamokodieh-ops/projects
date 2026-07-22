# Fortis — Personal Wealth Management Platform

Full-stack personal finance app for tracking investments and transactions, with real-time trend visualization.

**Stack:** React (Vite) · Flask · SQL (SQLite / SQLAlchemy) · Recharts  
**Design:** UI system inspired by Figma wireframes (overview, holdings, cash flow)

## Features

- Auth (register / login) with JWT
- Investment portfolio with cost basis and unrealized P/L
- Income & expense transactions
- Dashboard charts: net-worth trend, allocation, spending by category
- Live price ticks every 8s (demo market simulation) so trends update in real time
- Indexed SQL queries on `user_id` / `recorded_at` for fast dashboard loads

## Quick start

### 1. Backend (port 5001)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux
python app.py
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173**

### Demo account

| Email | Password |
|-------|----------|
| `demo@fortis.app` | `Demo123!` |

Or register a new account (starts with $10,000 cash).

### Windows one-click

Double-click `run.bat` from this folder (starts API + Vite).

## Project layout

```
wealth_platform/
  backend/          Flask API + SQLAlchemy models
  frontend/         React SPA
  README.md
  run.bat
```

## API (selected)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Sign in |
| GET | `/api/dashboard` | Summary, holdings, recent tx |
| GET | `/api/trends` | Net-worth series + allocation |
| POST | `/api/prices/refresh` | Simulate live market tick |
| GET/POST | `/api/investments` | List / buy |
| GET/POST | `/api/transactions` | List / add |

## Deploy notes

- Frontend: Vercel / Netlify (`frontend` as root, build `npm run build`)
- Backend: Render / Railway (`backend` as root, `gunicorn app:app`)
- Point `VITE_API_URL` (optional) or proxy `/api` to the Flask host
- For production, switch `DATABASE_URL` to PostgreSQL

## Resume alignment

Built as a personal wealth management platform: React interfaces, Flask + SQL services, investment/transaction tracking, and real-time trend charts — designed for portfolio presentation (Figma → Cursor workflow).