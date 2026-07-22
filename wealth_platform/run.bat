@echo off
set ROOT=%~dp0
start "Fortis API" cmd /k "cd /d %ROOT%backend && if not exist .venv python -m venv .venv && call .venv\Scripts\activate.bat && pip install -r requirements.txt && if not exist .env copy .env.example .env && python app.py"
timeout /t 3 /nobreak >nul
start "Fortis UI" cmd /k "cd /d %ROOT%frontend && npm install && npm run dev"
echo Fortis starting — API :5001 · UI :5173
pause