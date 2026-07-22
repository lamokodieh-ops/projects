import os
import requests

from flask import redirect, render_template, session
from functools import wraps

# Simple in-memory cache for company names (saves Alpha Vantage quota)
_name_cache = {}


def apology(message, code=400):
    """Render message as an apology to user."""

    def escape(s):
        """
        Escape special characters.

        https://github.com/jacebrowning/memegen#special-characters
        """
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
    """
    Decorate routes to require login.

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators/
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


def _company_name(symbol, api_key):
    """Resolve a human-readable company name via Alpha Vantage SYMBOL_SEARCH."""
    if symbol in _name_cache:
        return _name_cache[symbol]

    try:
        response = requests.get(
            "https://www.alphavantage.co/query",
            params={
                "function": "SYMBOL_SEARCH",
                "keywords": symbol,
                "apikey": api_key,
            },
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        matches = data.get("bestMatches") or []
        for match in matches:
            if match.get("1. symbol", "").upper() == symbol:
                name = match.get("2. name") or symbol
                _name_cache[symbol] = name
                return name
        if matches:
            name = matches[0].get("2. name") or symbol
            _name_cache[symbol] = name
            return name
    except (requests.RequestException, KeyError, ValueError, TypeError) as e:
        print(f"Alpha Vantage name lookup error: {e}")

    _name_cache[symbol] = symbol
    return symbol


def _lookup_alpha_vantage(symbol, api_key):
    """Look up quote using Alpha Vantage GLOBAL_QUOTE."""
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

        # Rate-limit / error messages from Alpha Vantage
        if "Note" in data or "Information" in data:
            print(f"Alpha Vantage limit/info: {data.get('Note') or data.get('Information')}")
            return None
        if "Error Message" in data:
            print(f"Alpha Vantage error: {data['Error Message']}")
            return None

        quote = data.get("Global Quote") or {}
        price_raw = quote.get("05. price")
        if not price_raw:
            return None

        return {
            "name": _company_name(symbol, api_key),
            "price": float(price_raw),
            "symbol": symbol,
        }
    except requests.RequestException as e:
        print(f"Alpha Vantage request error: {e}")
    except (KeyError, ValueError, TypeError) as e:
        print(f"Alpha Vantage data parsing error: {e}")
    return None


def _lookup_cs50(symbol):
    """Fallback lookup via CS50 finance API (no key required)."""
    url = f"https://finance.cs50.io/quote?symbol={symbol}"
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        quote_data = response.json()
        return {
            "name": quote_data["companyName"],
            "price": quote_data["latestPrice"],
            "symbol": symbol,
        }
    except requests.RequestException as e:
        print(f"CS50 request error: {e}")
    except (KeyError, ValueError) as e:
        print(f"CS50 data parsing error: {e}")
    return None


def lookup(symbol):
    """Look up quote for symbol (Alpha Vantage if configured, else CS50)."""
    if not symbol:
        return None
    symbol = symbol.upper().strip()
    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "").strip()
    if api_key:
        return _lookup_alpha_vantage(symbol, api_key)
    return _lookup_cs50(symbol)


def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"
