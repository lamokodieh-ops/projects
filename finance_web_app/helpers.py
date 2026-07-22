import os
import requests

from flask import redirect, render_template, session
from functools import wraps


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

    https://flask.palletsprojects.com/en/latest/patterns/viewdecorators.html
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            return redirect("/login")
        return f(*args, **kwargs)

    return decorated_function


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

        # Free-tier rate limit / premium upsell messages
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

        # Use one API call only — free keys are limited (~25/day)
        return {
            "name": quote.get("01. symbol") or symbol,
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
            "name": quote_data.get("companyName") or symbol,
            "price": float(quote_data["latestPrice"]),
            "symbol": symbol,
        }
    except requests.RequestException as e:
        print(f"CS50 request error: {e}")
    except (KeyError, ValueError, TypeError) as e:
        print(f"CS50 data parsing error: {e}")
    return None


def lookup(symbol):
    """
    Look up quote for symbol.

    Prefers Alpha Vantage when ALPHA_VANTAGE_API_KEY is set.
    Falls back to CS50 if Alpha Vantage fails or is rate-limited.
    """
    if not symbol:
        return None
    symbol = symbol.upper().strip()

    api_key = os.environ.get("ALPHA_VANTAGE_API_KEY", "").strip()
    if api_key:
        result = _lookup_alpha_vantage(symbol, api_key)
        if result is not None:
            return result
        print("Falling back to CS50 quote API")

    return _lookup_cs50(symbol)


def usd(value):
    """Format value as USD."""
    return f"${value:,.2f}"
