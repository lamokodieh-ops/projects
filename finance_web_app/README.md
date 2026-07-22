# Zen Finance

CS50-style Flask stock-trading web app. Quote prices, buy/sell shares, and track a portfolio with cash balance.

## Quick start (local)

```bash
cd finance_web_app
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
flask --app app.py run
```

Open **http://127.0.0.1:5000** and register a new account (or use the existing SQLite DB if present).

## Requirements

- Python 3.9+
- Internet access for stock quotes (`finance.cs50.io`)

## Deploy for display (Render)

This app needs a Python host (not GitHub Pages).

1. Push this repo to GitHub (already done).
2. Create a free [Render](https://render.com) **Web Service**.
3. Connect `lamokodieh-ops/projects`.
4. Settings:
   - **Root Directory:** `finance_web_app`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Environment variables:
   - `SECRET_KEY` — any long random string
   - `FLASK_ENV` — `production` (optional)

Alternatively use the included [`render.yaml`](./render.yaml) Blueprint.

## Project layout

```
finance_web_app/
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

- Quotes come from the public CS50 finance API — the app will not quote stocks offline.
- `flask_session/` is runtime state and is gitignored.
- For a portfolio showcase without hosting, record a short Loom of login → quote → buy → portfolio.
