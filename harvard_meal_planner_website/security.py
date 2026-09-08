"""Resolve Flask secrets without shipping default keys to production."""

DEV_SECRET_DEFAULT = "dev-only-change-me"


def is_production_env(environ):
    if str(environ.get("FLASK_ENV", "")).lower() == "production":
        return True
    return bool(environ.get("RENDER") or environ.get("RAILWAY_ENVIRONMENT"))


def resolve_secret(environ, *, name, default):
    value = str(environ.get(name) or "").strip()
    if is_production_env(environ) and (not value or value == default):
        raise RuntimeError(f"{name} must be set to a non-default value in production")
    return value or default
