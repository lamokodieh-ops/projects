"""Live quotes: Yahoo (mark-to-market) → Polygon.io → stale cache."""

import os
import time

import requests

from models import QuoteCache, db

# Yahoo can refresh often; Polygon free /prev is delayed and rate-limited.
LIVE_TTL = int(os.getenv("EQUITY_QUOTE_TTL", "8"))
POLYGON_TTL = int(os.getenv("POLYGON_QUOTE_TTL", "120"))

CRYPTO_SYMBOLS = {
    "BTC": "Bitcoin",
    "ETH": "Ethereum",
    "SOL": "Solana",
    "DOGE": "Dogecoin",
    "XRP": "XRP",
    "ADA": "Cardano",
    "BNB": "BNB",
}

YAHOO_CRYPTO = {
    "BTC": "BTC-USD",
    "ETH": "ETH-USD",
    "SOL": "SOL-USD",
    "DOGE": "DOGE-USD",
    "XRP": "XRP-USD",
    "ADA": "ADA-USD",
    "BNB": "BNB-USD",
}

_SESSION = requests.Session()
_SESSION.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    }
)


def _api_key() -> str:
    return (
        os.environ.get("POLYGON_API_KEY", "").strip()
        or os.environ.get("ALPHA_VANTAGE_API_KEY", "").strip()
    )


def _ttl_for(symbol: str, source: str | None = None) -> int:
    if source and source.startswith("polygon"):
        return POLYGON_TTL
    return LIVE_TTL


def _cache_row(symbol: str):
    return QuoteCache.query.filter_by(symbol=symbol).first()


def _cache_get(symbol: str, ttl: int | None = None):
    row = _cache_row(symbol)
    if not row:
        return None
    age = int(time.time()) - int(row.fetched_at)
    limit = ttl if ttl is not None else _ttl_for(symbol, row.source)
    if age > limit:
        return None
    return {
        "name": row.name,
        "price": float(row.price),
        "symbol": symbol,
        "source": row.source,
        "cached": True,
        "age_seconds": age,
    }


def _cache_set(quote: dict, source: str) -> None:
    if not quote:
        return
    symbol = quote["symbol"]
    now = int(time.time())
    row = _cache_row(symbol)
    if row:
        row.name = quote["name"]
        row.price = quote["price"]
        row.source = source
        row.fetched_at = now
    else:
        db.session.add(
            QuoteCache(
                symbol=symbol,
                name=quote["name"],
                price=quote["price"],
                source=source,
                fetched_at=now,
            )
        )
    db.session.commit()


def _cache_delete(symbol: str) -> None:
    row = _cache_row(symbol)
    if row:
        db.session.delete(row)
        db.session.commit()


def _cache_age(symbol: str) -> int:
    row = _cache_row(symbol)
    if not row:
        return 10**9
    return int(time.time()) - int(row.fetched_at)


def _price_plausible(symbol: str, price: float, previous: float | None = None) -> bool:
    if price is None or price <= 0:
        return False
    if symbol in {"BTC", "ETH", "BNB", "SOL"} and price < 50:
        return False
    # Reject large jumps (bad/stale alternate feeds)
    if previous and previous > 0:
        change = abs(price - previous) / previous
        if change > 0.08:
            return False
    return True


def _lookup_yahoo(symbol: str):
    """Near–real-time last price from Yahoo chart meta (equities + crypto)."""
    yahoo_symbol = YAHOO_CRYPTO.get(symbol, symbol)
    try:
        response = _SESSION.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{yahoo_symbol}",
            params={"interval": "1m", "range": "1d"},
            timeout=8,
        )
        response.raise_for_status()
        result = (response.json().get("chart") or {}).get("result") or []
        if not result:
            return None
        meta = result[0].get("meta") or {}
        price = meta.get("regularMarketPrice")
        if price is None:
            return None
        name = CRYPTO_SYMBOLS.get(symbol) or meta.get("shortName") or meta.get("symbol") or symbol
        return {
            "name": name,
            "price": float(price),
            "symbol": symbol,
            "source": "live",
            "cached": False,
            "market_state": meta.get("marketState"),
            "prev_close": meta.get("chartPreviousClose") or meta.get("previousClose"),
        }
    except (requests.RequestException, KeyError, ValueError, TypeError, IndexError) as e:
        print(f"Live quote error ({symbol}): {e}")
    return None


def _polygon_ticker(symbol: str) -> str:
    if symbol in CRYPTO_SYMBOLS:
        return f"X:{symbol}USD"
    return symbol


def _lookup_polygon(symbol: str, api_key: str):
    """Polygon previous aggregate — secondary when live feed fails."""
    ticker = _polygon_ticker(symbol)
    try:
        response = _SESSION.get(
            f"https://api.polygon.io/v2/aggs/ticker/{ticker}/prev",
            params={"adjusted": "true", "apiKey": api_key},
            timeout=8,
        )
        if response.status_code in {403, 429}:
            print(f"Polygon {response.status_code} for {ticker}")
            return None
        response.raise_for_status()
        results = response.json().get("results") or []
        if not results:
            return None
        price = results[0].get("c") or results[0].get("vw")
        if price is None:
            return None
        return {
            "name": CRYPTO_SYMBOLS.get(symbol, symbol),
            "price": float(price),
            "symbol": symbol,
            "source": "polygon",
            "cached": False,
        }
    except (requests.RequestException, KeyError, ValueError, TypeError) as e:
        print(f"Polygon quote error ({symbol}): {e}")
    return None


def _stale_cache(symbol: str):
    row = _cache_row(symbol)
    if not row:
        return None
    if symbol in CRYPTO_SYMBOLS and float(row.price) < 100:
        _cache_delete(symbol)
        return None
    return {
        "name": row.name,
        "price": float(row.price),
        "symbol": symbol,
        "source": f"{row.source}-stale",
        "cached": True,
        "age_seconds": int(time.time()) - int(row.fetched_at),
    }


def _fetch_network(symbol: str, previous_price: float | None = None):
    """
    Live Yahoo first (accurate mark-to-market).
    Polygon second (user API key) if live feed fails.
    """
    result = _lookup_yahoo(symbol)

    if result is None:
        api_key = _api_key()
        if api_key:
            result = _lookup_polygon(symbol, api_key)

    if result is None:
        return None

    if not _price_plausible(symbol, result["price"], previous_price):
        print(
            f"Rejecting implausible quote for {symbol}: "
            f"{result['price']} (prev={previous_price})"
        )
        return None

    _cache_set(result, result.get("source", "unknown"))
    return result


def lookup(symbol: str, previous_price: float | None = None, *, allow_network: bool = True):
    if not symbol:
        return None
    symbol = symbol.upper().strip()

    cached = _cache_get(symbol)
    if cached is not None and _price_plausible(symbol, cached["price"], previous_price):
        return cached

    if not allow_network:
        return _stale_cache(symbol) or (
            {
                "name": CRYPTO_SYMBOLS.get(symbol, symbol),
                "price": previous_price,
                "symbol": symbol,
                "source": "previous",
                "cached": True,
            }
            if previous_price
            else None
        )

    result = _fetch_network(symbol, previous_price)
    if result:
        return result

    return _stale_cache(symbol) or (
        {
            "name": CRYPTO_SYMBOLS.get(symbol, symbol),
            "price": previous_price,
            "symbol": symbol,
            "source": "previous",
            "cached": True,
        }
        if previous_price
        else None
    )


def lookup_live(holdings: list[tuple[str, float]], max_network_calls: int = 3):
    """Refresh portfolio; network-fetch the stalest symbols first."""
    prepared = []
    for symbol, prev in holdings:
        symbol = symbol.upper().strip()
        ttl = LIVE_TTL
        cached = _cache_get(symbol, ttl=ttl)
        prepared.append(
            {
                "symbol": symbol,
                "previous": prev,
                "cached": cached,
                "needs_network": cached is None,
                "age": _cache_age(symbol),
            }
        )

    to_fetch = sorted(
        [p for p in prepared if p["needs_network"]],
        key=lambda p: -p["age"],
    )[:max_network_calls]
    fetch_set = {p["symbol"] for p in to_fetch}
    results = {}

    for p in prepared:
        symbol = p["symbol"]
        if symbol in fetch_set:
            quote = _fetch_network(symbol, p["previous"])
            if quote is None:
                quote = p["cached"] or _stale_cache(symbol)
                if quote is None and p["previous"]:
                    quote = {
                        "name": CRYPTO_SYMBOLS.get(symbol, symbol),
                        "price": p["previous"],
                        "symbol": symbol,
                        "source": "previous",
                        "cached": True,
                    }
        else:
            quote = p["cached"] or _stale_cache(symbol)
            if quote is None and p["previous"]:
                quote = {
                    "name": CRYPTO_SYMBOLS.get(symbol, symbol),
                    "price": p["previous"],
                    "symbol": symbol,
                    "source": "previous",
                    "cached": True,
                }
        if quote:
            results[symbol] = quote

    return results
