import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("DATA_DIR", BASE_DIR / "data")).resolve()
UPLOAD_DIR = DATA_DIR / "uploads"
INDEX_DIR = DATA_DIR / "indexes"
DB_PATH = DATA_DIR / "study.db"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
LLM_MODE_ENV = os.getenv("LLM_MODE", "auto").strip().lower()
EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "auto").strip().lower()
OPENAI_CHAT_MODEL = os.getenv("OPENAI_CHAT_MODEL", "gpt-4o-mini")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBED_MODEL", "text-embedding-3-small")
SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-study-assistant-secret")

CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
TOP_K = 4


def resolve_llm_mode() -> str:
    if LLM_MODE_ENV in {"live", "mock"}:
        return LLM_MODE_ENV
    return "live" if OPENAI_API_KEY else "mock"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)