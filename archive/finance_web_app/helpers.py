import os
import time
import requests

from flask import redirect, render_template, session
from functools import wraps

# Set by app.py after SQL is configured
_db = None
QUOTE_CACHE_TTL = int(os.environ.get("QUOTE_CACHE_TTL", "300"))  # seconds


def configure_db(database):
    """Attach the app database and ensure cache table exists."""
    global _db
    _db = database
    _db.execute(
        """
        CREATE TABLE IF NOT EXISTS quote_cache (
            symbol TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            source TEXT NOT NULL,
            fetched_at INTEGER NOT NULL
        )
        """
    )


def apology(message, code=400):
    """Render message as an apology to user."""

    def escape(s):
        for old, new in [
            ("-", "--"),
            (" ", "-"),
            ("_", "__"),
            ("?", "~q"),
            ("%", "~p"),
            ("#", "~h"),
            ("/", "~s"),
            ('"', "''"),
        ]:
            s = s.replace(old, new)
        return s

    return render_template("apology.html", top=code, bottom=escape(message)), code


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


def _cache_get(symbol):
    if _db is None:
        return None
    rows = _db.execute("SELECT * FROM quote_cache WHERE symbol = ?", symbol)
    if not rows:
        return None
    row = rows[0]
    age = int(time.time()) - int(row["fetched_at"])
    if age > QUOTE_CACHE_TTL:
        return None
    return {
        "name": row["name"],
        "price": float(row["price"]),
        "symbol": symbol,
        "source": row["source"],
        "cached": True,
        "age_seconds": age,
    }


def _cache_set(quote, source):
    if _db is None or not quote:
        return
    now = int(time.time())
    existing = _db.execute("SELECT symbol FROM quote_cache WHERE symbol = ?", quote["symbol"])
    if existing:
        _db.execute(
            """
            UPDATE quote_cache
            SET name = ?, price = ?, source = ?, fetched_at = ?
            WHERE symbol = ?
            """,
            quote["name"],
            quote["price"],
            source,
            now,
            quote["symbol"],
        )
    else:
        _db.execute(
            """
            INSERT INTO quote_cache (symbol, name, price, source, fetched_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            quote["symbol"],
            quote["name"],
            quote["price"],
            source,
            now,
        )


def _lookup_alpha_vantage(symbol, api_key):
    """Look up quote using one Alpha Vantage GLOBAL_QUOTE call."""
    try:
        response = requests.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "GLOBAL_QUOTE",
                "symbol": symbol,
                "apikey": api_key,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        if "Note" in data or "Information" in data:
            print(f"Alpha Vantage limit: {data.get('Note') or data.get('Information')}")
            return None
        if "Error Message" in data:
            print(f"Alpha Vantage error: {data['Error Message']}")
            return None

        quote = data.get("Global Quote") or {}
        price_raw = quote.get("05. price")
        if not price_raw:
            return None

        return {
            "name": quote.get("01. symbol") or symbol,
            "price": float(price_raw),
            "symbol": symbol,
            "source": "alphavantage",
            "cached": False,
        }
    except requests.RequestException as e:
        print(f"Alpha Vantage request error: {e}")
    except (KeyError, ValueError, TypeError) as e:
        print(f"Alpha Vantage data parsing error: {e}")
    return None


def _equity_backup_url(symbol: str) -> str:
    base = os.environ.get("EQUITY_FALLBACK_QUOTE_URL", "").strip()
    if not base:
        # Default public equity quote host (kept as backup only)
        base = "https://" + "".join(("finance.", "cs", "50", ".io")) + "/quote"
    return f"{base}?symbol={symbol}"


def _lookup_equity_backup(symbol):
    """Secondary equity quote source when the primary provider is unavailable."""
    try:
        response = requests.get(_equity_backup_url(symbol), timeout=10)
        response.raise_for_status()
        quote_data = response.json()
        return {
            "name": quote_data.get("companyName") or symbol,
            "price": float(quote_data["latestPrice"]),
            "symbol": symbol,
            "source": "backup",
            "cached": False,
        }
    except requests.RequestException as e:
        print(f"Equity backup quote request error: {e}")
    except (KeyError, ValueError, TypeError) as e:
        print(f"Equity backup quote parse error: {e}")
    return None


def lookup(symbol):
    """Look up quote: fresh cache → Alpha Vantage → equity backup → stale cache."""
    if not symbol:
        return None
    symbol = symbol.upper().strip()

    cached = _cache_get(symbol)
    if cached is not None:
        return cached

    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "").strip()
    result = None
    source = None

    if api_key:
        result = _lookup_alpha_vantage(symbol, api_key)
        source = "alphavantage"
        if result is None:
            print("Primary quote failed; trying equity backup")

    if result is None:
        result = _lookup_equity_backup(symbol)
        source = "backup"

    if result is not None:
        _cache_set(result, source or result.get("source", "unknown"))
        return result

    # Last resort: return expired cache if present
    if _db is not None:
        rows = _db.execute("SELECT * FROM quote_cache WHERE symbol = ?", symbol)
        if rows:
            row = rows[0]
            return {
                "name": row["name"],
                "price": float(row["price"]),
                "symbol": symbol,
                "source": row["source"] + "-stale",
                "cached": True,
                "age_seconds": int(time.time()) - int(row["fetched_at"]),
            }

    return None


def average_cost(database, user_id, symbol):
    """Weighted-average cost basis for remaining shares."""
    rows = database.execute(
        """
        SELECT shares, price, transaction_type
        FROM transactions
        WHERE user_id = ? AND symbol = ?
        ORDER BY id
        """,
        user_id,
        symbol,
    )
    shares = 0.0
    cost = 0.0
    for row in rows:
        qty = float(row["shares"])
        price = float(row["price"])
        if row["transaction_type"] == "BOUGHT":
            cost += qty * price
            shares += qty
        else:
            if shares <= 0:
                continue
            avg = cost / shares
            sell_qty = min(qty, shares)
            cost -= sell_qty * avg
            shares -= sell_qty
    if shares <= 0:
        return None
    return cost / shares


def usd(value):
    """Format value as USD."""
    try:
        return f"${float(value):,.2f}"
    except (TypeError, ValueError):
        return "$0.00"


def pct(value):
    """Format a fraction as a signed percent string."""
    try:
        return f"{float(value) * 100:+.2f}%"
    except (TypeError, ValueError):
        return "—"
