import hmac
import os
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*_args, **_kwargs):
        return False

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
DEV_SECRET_DEFAULT = "dev-study-assistant-secret"
DEV_API_KEY_DEFAULT = "dev-cortex-local-key"
DEFAULT_CORS_ORIGINS = "http://127.0.0.1:3002,http://localhost:3002"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
CHUNK_SIZE = 900
CHUNK_OVERLAP = 150
TOP_K = 4


def is_production_env(environ=None) -> bool:
    env = os.environ if environ is None else environ
    if str(env.get("FLASK_ENV", "")).lower() == "production":
        return True
    return bool(env.get("RENDER") or env.get("RAILWAY_ENVIRONMENT"))


def resolve_secret(environ=None, *, name: str = "FLASK_SECRET_KEY", default: str = DEV_SECRET_DEFAULT) -> str:
    env = os.environ if environ is None else environ
    value = str(env.get(name) or "").strip()
    if is_production_env(env) and (not value or value == default):
        raise RuntimeError(f"{name} must be set to a non-default value in production")
    return value or default


def upload_too_large(size_bytes: int) -> bool:
    return size_bytes > MAX_UPLOAD_BYTES


def cors_origins(environ=None, default: str = DEFAULT_CORS_ORIGINS) -> list[str]:
    env = os.environ if environ is None else environ
    raw = str(env.get("CORS_ORIGINS") or default)
    origins = [part.strip() for part in raw.split(",") if part.strip()]
    if origins:
        return origins
    return [part.strip() for part in default.split(",") if part.strip()]


def api_key_provided(environ=None) -> str:
    return resolve_secret(environ, name="CORTEX_API_KEY", default=DEV_API_KEY_DEFAULT)


def api_key_matches(environ, provided: str) -> bool:
    expected = api_key_provided(environ)
    given = (provided or "").strip()
    if not expected or not given:
        return False
    return hmac.compare_digest(given, expected)


def is_public_api_path(path: str) -> bool:
    normalized = (path or "").rstrip("/") or "/"
    return normalized == "/api/health"


SECRET_KEY = resolve_secret()
CORTEX_API_KEY = api_key_provided()


def resolve_llm_mode() -> str:
    if LLM_MODE_ENV in {"live", "mock"}:
        return LLM_MODE_ENV
    return "live" if OPENAI_API_KEY else "mock"


def ensure_dirs() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    INDEX_DIR.mkdir(parents=True, exist_ok=True)