@echo off
cd /d "%~dp0"
if not exist .venv (
  python -m venv .venv
  .\.venv\Scripts\pip.exe install -r requirements.txt
)
if not exist .env (
  copy .env.example .env
  echo Created .env — add your ALPHA_VANTAGE_API_KEY if you have one.
)
echo Starting Zen Finance at http://127.0.0.1:5000
.\.venv\Scripts\python.exe -m flask --app app.py run --host 127.0.0.1 --port 5000
