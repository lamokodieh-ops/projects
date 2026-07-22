@echo off
set ROOT=%~dp0
start "Study API" cmd /k "cd /d %ROOT%backend && if not exist .venv python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && if not exist .env copy .env.example .env && python app.py"
timeout /t 3 /nobreak >nul
start "Study UI" cmd /k "cd /d %ROOT%frontend && npm install && if not exist .env.local copy .env.local.example .env.local && npm run dev"
echo AI Study Assistant — API :5002 · UI :3002
pause