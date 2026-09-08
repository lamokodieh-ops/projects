"""Resolve Flask/JWT secrets without shipping default keys to production."""

DEV_SECRET_DEFAULT = "dev-secret-change-me-fortis-32b"
DEV_JWT_DEFAULT = "dev-jwt-change-me-fortis-32bytes"
DEFAULT_CORS_ORIGINS = "http://127.0.0.1:5173,http://localhost:5173"


def is_production_env(environ):
    if str(environ.get("FLASK_ENV", "")).lower() == "production":
        return True
    return bool(environ.get("RENDER") or environ.get("RAILWAY_ENVIRONMENT"))


def resolve_secret(environ, *, name, default):
    value = str(environ.get(name) or "").strip()
    if is_production_env(environ) and (not value or value == default):
        raise RuntimeError(f"{name} must be set to a non-default value in production")
    return value or default


def cors_origins(environ, default):
    raw = str(environ.get("CORS_ORIGINS") or default)
    origins = [part.strip() for part in raw.split(",") if part.strip()]
    if origins:
        return origins
    return [part.strip() for part in default.split(",") if part.strip()]
