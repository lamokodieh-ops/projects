# AI Study Assistant

Next.js + Flask study tool that generates **explanations**, **quizzes**, and **summaries** from your course materials using **retrieval-augmented generation (RAG)** and **streaming** responses.

Built to mirror a fellowship evaluation lens: grounded generation, inspectable sources, low-latency interaction.

## Stack

- **Frontend:** Next.js (App Router)
- **Backend:** Flask
- **LLM:** OpenAI API (optional) via `backend/llm_client.py`
- **RAG:** chunk → embed → local NumPy/FAISS index → retrieve → prompt
- **DB:** SQLite material + generation history

## Quick start (mock mode — no API key)

### 1. Backend (port 5002)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
copy .env.example .env
python app.py
```

### 2. Frontend (port 3002)

```bash
cd frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Open **http://127.0.0.1:3002**

You’ll see a **Mock mode** badge. Uploads, retrieval, and streamed outputs work without OpenAI.

## Live mode (with OpenAI key)

In `backend/.env`:

```env
OPENAI_API_KEY=sk-...
LLM_MODE=auto
EMBEDDING_PROVIDER=auto
```

Restart Flask. Health/`ModeBadge` should show **Live · OpenAI**.

Optional local embeddings (no OpenAI embeds):

```bash
pip install sentence-transformers
# EMBEDDING_PROVIDER=local
```

Optional FAISS acceleration:

```bash
pip install faiss-cpu
```

(The app falls back to NumPy cosine search if FAISS is unavailable.)

## Features

- Upload PDF / TXT or paste notes
- Generate: explanation, MCQ quiz (+ answers), summary
- Streamed tokens (SSE)
- Retrieved source chunks shown beside the answer
- Material + generation history (SQLite)

## API

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/health` | `{ mode, embedding_provider }` |
| GET/POST | `/api/materials` | list / ingest |
| GET | `/api/materials/:id` | material + history |
| POST | `/api/generate` | SSE: `meta`, `sources`, `token`, `done` |

## Project layout

```
ai_study_assistant/
  backend/
    llm_client.py      # OpenAI + mock abstraction
    rag/               # ingest, store, retrieve, prompts
    routes/            # materials + generate
    app.py
  frontend/            # Next.js UI
  README.md
```

## Stretch (not in v1)

- Quiz difficulty levels
- Spaced-repetition review
- Multi-document retrieval
- Confidence indicator from retrieval scores

## Deploy / host

### Gallery (GitHub Pages)

Listed on the monorepo gallery after push: `docs/index.html` →  
https://lamokodieh-ops.github.io/projects/

### Backend (Render)

1. Create a **Web Service** from `lamokodieh-ops/projects`
2. Root directory: `ai_study_assistant/backend`
3. Build: `pip install -r requirements.txt`
4. Start: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
5. Env: `FLASK_SECRET_KEY`, optional `OPENAI_API_KEY`, `LLM_MODE=auto`

Or use the included [`backend/render.yaml`](./backend/render.yaml) Blueprint.

### Frontend (Vercel)

1. Import the same repo on [Vercel](https://vercel.com)
2. Root directory: `ai_study_assistant/frontend`
3. Env: `NEXT_PUBLIC_API_BASE=https://<your-render-service>.onrender.com`
4. Deploy

Without `OPENAI_API_KEY`, production still runs in **mock mode** (fully demoable).

## Notes

- Mock embeddings are deterministic hash vectors (good for demos, not semantic quality).
- Live quality depends on chunking + your materials; always inspect **Sources used**.
- Do not commit `.env` or `backend/data/`.