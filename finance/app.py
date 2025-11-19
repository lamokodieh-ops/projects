import os

from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import apology, login_required, lookup, usd

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Configure CS50 Library to use SQLite database
db = SQL("sqlite:///finance.db")


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
@login_required
def index():
    """Show portfolio of stocks"""

    # Get user id from session
    user_id = session["user_id"]

    # Get symbols of stocks transacted
    symbols = db.execute(
        "SELECT symbol FROM transactions WHERE user_id = ? GROUP BY symbol", user_id)

    portfolio = []
    total_stock_value = 0

    # Iterate through the transactions symbol by symbol
    for row in symbols:
        symbol = row["symbol"]

        # Find shares owned per stock
        shares_bought = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'BOUGHT'", user_id, symbol)[0]["SUM(shares)"]

        shares_sold = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'SOLD'", user_id, symbol)[0]["SUM(shares)"]

        if shares_bought is None:
            shares_bought = 0
        if shares_sold is None:
            shares_sold = 0

        shares_owned = shares_bought - shares_sold

        # If the user has no shares, go to next symbol
        if shares_owned == 0:
            continue

        # Find current value of shares owned
        quote = lookup(symbol)
        current_price = quote["price"]
        stock_value = shares_owned * current_price

        # Add towards total value of all stocks owned
        total_stock_value += stock_value

        # Add info on stocks owned to the portfolio
        portfolio.append({
            "symbol": symbol,
            "shares": shares_owned,
            "price": current_price,
            "stock_value": stock_value
        })

    # Get cash balance from the users database
    cash_balance = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]

    # Calculate total value of account
    total_balance = cash_balance + total_stock_value

    # Show the portfolio of the user
    return render_template("index.html", portfolio=portfolio, total_stock_value=total_stock_value, cash_balance=cash_balance, total_balance=total_balance)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""

    # Check uf the method is POST
    if request.method == "POST":

        # Get symbol and shares form the form
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        # Check if symbol was inputted
        if not symbol:
            return apology("must provide stock symbol", 400)

        # Check if shares were inputted
        elif not shares:
            return apology("must provide number of shares", 400)

        # Convert shares to integer
        try:
            shares = int(shares)
        except ValueError:
            return apology("invalid number of shares", 400)

        if shares <= 0:
            return apology("invalid number of shares", 400)

        # Look up stock corresponding to the symbol
        symbol = symbol.upper()
        stock = lookup(symbol)

        # Check if stock exists
        if stock is None:
            return apology("invalid stock requested", 400)

        # Get user id from session
        user_id = session["user_id"]

        # Get current balance from database
        current_balance = db.execute("SELECT cash FROM users WHERE id = ?", user_id)[0]["cash"]

        # Find total price of shares
        price = stock["price"]
        total_price = shares * price

        # Check if user has enough money to buy shares
        if current_balance < total_price:
            return apology("insufficient funds", 403)
        else:
            # Buy shares if money is enough by altering the database
            transaction_type = "BOUGHT"
            db.execute("INSERT INTO transactions (user_id,symbol,shares,price, transaction_type) VALUES (?, ?, ?, ?, ?)",
                       user_id, symbol, shares, price, transaction_type)
            db.execute("UPDATE users SET cash = cash - ? WHERE id = ?", total_price, user_id)

        # Go to the homepage to show updated portfolio
        return redirect("/")

    # Show the buy form if the method is GET
    return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    # Get user id from session
    user_id = session["user_id"]

    # Show all transactions for  the user
    transactions = db.execute("SELECT * FROM transactions WHERE user_id = ?", user_id)
    return render_template("history.html", transactions=transactions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute(
            "SELECT * FROM users WHERE username = ?", request.form.get("username")
        )

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(
            rows[0]["hash"], request.form.get("password")
        ):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]

        # Redirect user to home page
        return redirect("/")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote"""

    # Check if method is POST
    if request.method == "POST":

        # Get symbol from form
        symbol = request.form.get("symbol")

        # Check is symbol was inputted by user
        if not symbol:
            return apology("must provide a stock symbol", 400)

        # Look up stock for the symbol
        stock = lookup(symbol.upper())

        # Check if the stock exists
        if stock is None:
            return apology("invalid stock requested", 400)

        # Show the quote if the stock exists
        return render_template("quoted.html", stock=stock)

    # If the method is GET, show the page to request a quote
    return render_template("quote.html")


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    # Check if the method is POST
    if request.method == "POST":

        # Get needed values from the register form
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmation")

        # Check if username was submitted
        if not username:
            return apology("must provide username", 400)

        # Check if password was submitted
        elif not password:
            return apology("must provide password", 400)

        # Check if the password matches its confirmation
        elif password != confirmation:
            return apology("password does not match", 400)

        # Add username and password to database if username is not taken
        else:
            try:
                rows = db.execute(
                    "INSERT INTO users (username, hash) VALUES (?, ?)", username, generate_password_hash(
                        password)
                )

            except ValueError:
                return apology("Username Already Taken", 400)

        # Automatically login after registering
        return login()

    # Show registration form if the method is GET
    return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""

    # Get user id from the session
    user_id = session["user_id"]

    # Check if the method is POST
    if request.method == "POST":
        symbol = request.form.get("symbol")
        shares = request.form.get("shares")

        # Check if a symbol was selected
        if not symbol:
            return apology("must provide stock symbol", 400)

        # Check if the number of shares was selected
        if not shares:
            return apology("must provide number of shares", 400)

        # Convert shares to an integer
        try:
            shares = int(shares)
        except ValueError:
            return apology("invalid number of shares", 400)

        if shares <= 0:
            return apology("invalid number of shares", 400)

        # Look up the symbol
        symbol = symbol.upper()
        quote = lookup(symbol)

        # Check if symbol exists
        if quote is None:
            return apology("invalid stock requested", 400)

        # Get the price of the stock requested
        price = quote["price"]
        total_price = shares*price

        # Get the number of shares owned
        shares_bought = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'BOUGHT'", user_id, symbol)[0]["SUM(shares)"]

        shares_sold = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'SOLD'", user_id, symbol)[0]["SUM(shares)"]

        if shares_bought is None:
            shares_bought = 0
        if shares_sold is None:
            shares_sold = 0

        shares_owned = shares_bought - shares_sold

        # Check to see if the users shas enough shares to sell
        if shares > shares_owned:
            return apology("insufficient shares owned", 400)

        # Reflect sale on the database
        db.execute("INSERT INTO transactions (user_id,symbol,shares,price, transaction_type) VALUES (?, ?, ?, ?, ?)",
                   user_id, symbol, shares, price, "SOLD")
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", total_price, user_id)

        # Go to homepage to show portfolio
        return redirect("/")

    # If the method is GET
    portfolio = []

    # Get the stocks transacted by the user
    symbols = db.execute(
        "SELECT symbol FROM transactions WHERE user_id = ? GROUP BY symbol", user_id)

    # Iterate through the transactions to get the stocks owned
    for row in symbols:
        symbol = row["symbol"]

        shares_bought = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'BOUGHT'", user_id, symbol)[0]["SUM(shares)"]

        shares_sold = db.execute(
            "SELECT SUM(shares) FROM transactions WHERE user_id = ? AND symbol= ? AND transaction_type = 'SOLD'", user_id, symbol)[0]["SUM(shares)"]

        if shares_bought is None:
            shares_bought = 0
        if shares_sold is None:
            shares_sold = 0

        shares_owned = shares_bought - shares_sold

        # Create a portfolio (list of dictionaries) of stocks owned
        if shares_owned > 0:
            portfolio.append({
                "symbol": symbol,
                "shares": shares_owned,
            })

    # Send portfolio into sell.html to get the stocks that are selectable
    return render_template("sell.html", portfolio=portfolio)


# Allow users to add additional cash to their account
@app.route("/deposit", methods=["GET", "POST"])
@login_required
def deposit():
    if request.method == "POST":
        deposit = request.form.get("deposit")

        # Check if user has input a value and convert it to an integer
        if not deposit:
            return apology("must provide deposit amount", 400)
        try:
            deposit = int(deposit)
        except ValueError:
            return apology("invalid deposit amount", 400)

        # Get user id saved in the session
        user_id = session["user_id"]

        # Add the deposit amount to the database
        db.execute("UPDATE users SET cash = cash + ? WHERE id = ?", deposit, user_id)
        return redirect("/")

    return render_template("deposit.html")
