# Zen Finance *(archived / inactive)*

> **Status: inactive.** This project lives under `archive/finance_web_app` and is not part of the active portfolio. Kept for reference; not maintained or deployed.

CS50-style Flask stock-trading web app. Quote prices, buy/sell shares, and track a portfolio with cash balance.

## Quick start (local)

### Windows (easiest)

Double-click `run.bat`, or in a terminal:

```bash
cd archive/finance_web_app
.\run.bat
```

### Manual setup

```bash
cd archive/finance_web_app
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows — then add your Alpha Vantage key
# cp .env.example .env   # macOS / Linux
flask --app app.py run
```

Open **http://127.0.0.1:5000** and register a new account (or use the existing SQLite DB if present).

## Stock quotes (Alpha Vantage)

Quotes use [Alpha Vantage](https://www.alphavantage.co/) when `ALPHA_VANTAGE_API_KEY` is set in `.env`.

```env
ALPHA_VANTAGE_API_KEY=your-key-here
SECRET_KEY=any-long-random-string
QUOTE_CACHE_TTL=300
```

Lookup order: **SQLite cache (TTL)** → Alpha Vantage → CS50 fallback → stale cache.

**Free-tier note:** Alpha Vantage free keys are limited (about **25 requests per day**). Caching (default 5 minutes) and CS50 fallback keep the app usable.

## Sprint 1 upgrades

- Dark fintech UI theme (Bootstrap + custom CSS tokens)
- Portfolio summary cards + holdings table
- Unrealized gain/loss (avg cost basis vs live price)
- Quote cache table `quote_cache`
- Flash confirmations for buy / sell / deposit / login

## Requirements

- Python 3.9+
- Internet access for stock quotes
- Alpha Vantage API key (recommended)

## Deploy for display (Render)

This app needs a Python host (not GitHub Pages).

1. Push this repo to GitHub (already done).
2. Create a free [Render](https://render.com) **Web Service**.
3. Connect `lamokodieh-ops/projects`.
4. Settings:
   - **Root Directory:** `archive/finance_web_app`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Environment variables:
   - `SECRET_KEY` — any long random string
   - `ALPHA_VANTAGE_API_KEY` — your Alpha Vantage key
   - `FLASK_ENV` — `production` (optional)

Alternatively use the included [`render.yaml`](./render.yaml) Blueprint.

## Project layout

```
archive/finance_web_app/
  app.py              # routes
  helpers.py          # login_required, lookup, usd
  finance.db          # SQLite (demo data may be included)
  requirements.txt
  templates/
  static/
  Procfile
  render.yaml
```

## Notes

- Quotes prefer Alpha Vantage (`GLOBAL_QUOTE` + `SYMBOL_SEARCH`); CS50 is used only if no key is set.
- Never commit `.env` — it is gitignored. Use `.env.example` as a template.
- `flask_session/` is runtime state and is gitignored.
- For a portfolio showcase without hosting, record a short Loom of login → quote → buy → portfolio.
