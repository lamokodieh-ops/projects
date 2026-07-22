import os

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, average_cost, configure_db, login_required, lookup, pct, usd

# Configure application
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-only-change-me")

# Custom filters
app.jinja_env.filters["usd"] = usd
app.jinja_env.filters["pct"] = pct

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")
configure_db(db)


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


def build_portfolio(user_id):
    """Return holdings list with live prices and unrealized P/L."""
    symbols = db.execute(
        "SELECT symbol FROM transactions WHERE user_id = ? GROUP BY symbol", user_id
    )

    portfolio = []
    total_stock_value = 0.0
    total_cost_basis = 0.0

    for row in symbols:
        symbol = row["symbol"]

        shares_bought = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol = ? AND transaction_type = 'BOUGHT'",
            user_id,
            symbol,
        )[0]["SUM(shares)"]
        shares_sold = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol = ? AND transaction_type = 'SOLD'",
            user_id,
            symbol,
        )[0]["SUM(shares)"]

        shares_bought = shares_bought or 0
        shares_sold = shares_sold or 0
        shares_owned = shares_bought - shares_sold
        if shares_owned <= 0:
            continue

        avg = average_cost(db, user_id, symbol) or 0.0
        cost_basis = avg * shares_owned

        quote = lookup(symbol)
        if quote is None:
            portfolio.append(
                {
                    "symbol": symbol,
                    "name": symbol,
                    "shares": shares_owned,
                    "avg_cost": avg,
                    "price": None,
                    "stock_value": None,
                    "cost_basis": cost_basis,
                    "unrealized": None,
                    "unrealized_pct": None,
                    "source": None,
                }
            )
            total_cost_basis += cost_basis
            continue

        current_price = quote["price"]
        stock_value = shares_owned * current_price
        unrealized = stock_value - cost_basis
        unrealized_pct = (unrealized / cost_basis) if cost_basis else 0.0

        total_stock_value += stock_value
        total_cost_basis += cost_basis

        portfolio.append(
            {
                "symbol": symbol,
                "name": quote.get("name") or symbol,
                "shares": shares_owned,
                "avg_cost": avg,
                "price": current_price,
                "stock_value": stock_value,
                "cost_basis": cost_basis,
                "unrealized": unrealized,
                "unrealized_pct": unrealized_pct,
                "source": quote.get("source"),
                "cached": quote.get("cached", False),
            }
        )

    return portfolio, total_stock_value, total_cost_basis


@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""
    user_id = session["user_id"]
    portfolio, total_stock_value, total_cost_basis = build_portfolio(user_id)
    cash_balance = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]
    total_balance = cash_balance + total_stock_value
    total_unrealized = total_stock_value - total_cost_basis
    total_unrealized_pct = (total_unrealized / total_cost_basis) if total_cost_basis else 0.0

    return render_template(
        "index.html",
        portfolio=portfolio,
        total_stock_value=total_stock_value,
        cash_balance=cash_balance,
        total_balance=total_balance,
        total_cost_basis=total_cost_basis,
        total_unrealized=total_unrealized,
        total_unrealized_pct=total_unrealized_pct,
    )


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        if not symbol:
            return apology("must provide stock symbol", 400)
        elif not shares:
            return apology("must provide number of shares", 400)

        try:
            shares = int(shares)
        except ValueError:
            return apology("invalid number of shares", 400)

        if shares <= 0:
            return apology("invalid number of shares", 400)

        symbol = symbol.upper()
        stock = lookup(symbol)
        if stock is None:
            return apology("invalid stock requested", 400)

        user_id = session["user_id"]
        current_balance = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]
        price = stock["price"]
        total_price = shares * price

        if current_balance < total_price:
            return apology("insufficient funds", 403)

        db.execute(
            "INSERT INTO transactions (user_id,symbol,shares,price, transaction_type) VALUES (?, ?, ?, ?, ?)",
            user_id,
            symbol,
            shares,
            price,
            "BOUGHT",
        )
        db.execute("UPDATE users SET cash = cash - ? WHERE id = ?", total_price, user_id)
        flash(f"Bought {shares} share(s) of {symbol} at {usd(price)} · Total {usd(total_price)}")
        return redirect("/")

    return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    user_id = session["user_id"]
    transactions = db.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC", user_id
    )
    return render_template("history.html", transactions=transactions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""
    session.clear()

    if request.method == "POST":
        if not request.form.get("username"):
            return apology("must provide username", 403)
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        session["user_id"] = rows[0]["id"]
        flash(f"Welcome back, {rows[0]['username']}.")
        return redirect("/")

    return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""
    session.clear()
    flash("Signed out.")
    return redirect("/login")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote"""
    if request.method == "POST":
        symbol = request.form.get("symbol")
        if not symbol:
            return apology("must provide a stock symbol", 400)

        stock = lookup(symbol.upper())
        if stock is None:
            return apology("invalid stock requested", 400)

        return render_template("quoted.html", stock=stock)

    return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        if not username:
            return apology("must provide username", 400)
        elif not password:
            return apology("must provide password", 400)
        elif password != confirmation:
            return apology("password does not match", 400)

        try:
            db.execute(
                "INSERT INTO users (username, hash) VALUES (?, ?)",
                username,
                generate_password_hash(password),
            )
        except ValueError:
            return apology("Username Already Taken", 400)

        flash("Account created. Please log in.")
        return redirect("/login")

    return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""
    user_id = session["user_id"]

    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        if not symbol:
            return apology("must provide stock symbol", 400)
        if not shares:
            return apology("must provide number of shares", 400)

        try:
            shares = int(shares)
        except ValueError:
            return apology("invalid number of shares", 400)

        if shares <= 0:
            return apology("invalid number of shares", 400)

        symbol = symbol.upper()
        quote_data = lookup(symbol)
        if quote_data is None:
            return apology("invalid stock requested", 400)

        price = quote_data["price"]
        total_price = shares * price

        shares_bought = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol = ? AND transaction_type = 'BOUGHT'",
            user_id,
            symbol,
        )[0]["SUM(shares)"]
        shares_sold = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol = ? AND transaction_type = 'SOLD'",
            user_id,
            symbol,
        )[0]["SUM(shares)"]

        shares_owned = (shares_bought or 0) - (shares_sold or 0)
        if shares > shares_owned:
            return apology("insufficient shares owned", 400)

        db.execute(
            "INSERT INTO transactions (user_id,symbol,shares,price, transaction_type) VALUES (?, ?, ?, ?, ?)",
            user_id,
            symbol,
            shares,
            price,
            "SOLD",
        )
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", total_price, user_id)
        flash(f"Sold {shares} share(s) of {symbol} at {usd(price)} · Proceeds {usd(total_price)}")
        return redirect("/")

    portfolio, _, _ = build_portfolio(user_id)
    return render_template("sell.html", portfolio=portfolio)


@app.route("/deposit", methods=["GET", "POST"])
@login_required
def deposit():
    if request.method == "POST":
        deposit_amt = request.form.get("deposit")

        if not deposit_amt:
            return apology("must provide deposit amount", 400)
        try:
            deposit_amt = int(deposit_amt)
        except ValueError:
            return apology("invalid deposit amount", 400)

        if deposit_amt <= 0:
            return apology("deposit must be positive", 400)

        user_id = session["user_id"]
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", deposit_amt, user_id)
        flash(f"Deposited {usd(deposit_amt)} into your account.")
        return redirect("/")

    return render_template("deposit.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
