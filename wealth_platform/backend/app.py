import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from models import Investment, PortfolioSnapshot, Transaction, User, db, utcnow
from quotes import CRYPTO_SYMBOLS, lookup, lookup_live

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-change-me-fortis-32b")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-change-me-fortis-32bytes")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///wealth.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

    db.init_app(app)
    JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        db.create_all()
        _ensure_demo_user()

    register_routes(app)
    return app


def _ensure_demo_user():
    if User.query.filter_by(email="demo@fortis.app").first():
        return
    from seed import seed_demo_user

    seed_demo_user()


def portfolio_totals(user: User):
    invested = sum(inv.market_value for inv in user.investments)
    cash = user.cash_balance
    return {
        "invested_value": round(invested, 2),
        "cash_balance": round(cash, 2),
        "total_value": round(invested + cash, 2),
        "unrealized_pl": round(sum(inv.unrealized_pl for inv in user.investments), 2),
    }


def record_snapshot(user: User, *, force: bool = False):
    """Write a net-worth point. Throttle automatic price refreshes to once per 5 minutes."""
    totals = portfolio_totals(user)
    if not force:
        latest = (
            PortfolioSnapshot.query.filter_by(user_id=user.id)
            .order_by(PortfolioSnapshot.recorded_at.desc())
            .first()
        )
        if latest and latest.recorded_at:
            latest_at = latest.recorded_at
            if latest_at.tzinfo is None:
                latest_at = latest_at.replace(tzinfo=timezone.utc)
            age = (utcnow() - latest_at).total_seconds()
            if age < 300:
                return latest

    snap = PortfolioSnapshot(
        user_id=user.id,
        total_value=totals["total_value"],
        invested_value=totals["invested_value"],
        cash_balance=totals["cash_balance"],
        recorded_at=utcnow(),
    )
    db.session.add(snap)
    db.session.commit()
    return snap


def register_routes(app: Flask):
    @app.get("/api/health")
    def health():
        return jsonify({"ok": True, "service": "fortis-api"})

    @app.post("/api/auth/register")
    def register():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        name = (data.get("name") or "").strip()
        password = data.get("password") or ""

        if not email or not name or len(password) < 6:
            return jsonify({"error": "Name, email, and password (6+ chars) are required."}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already registered."}), 409

        user = User(email=email, name=name, cash_balance=10000.0)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        record_snapshot(user, force=True)

        token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": token, "user": user.to_dict()}), 201

    @app.post("/api/auth/login")
    def login():
        data = request.get_json(silent=True) or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid email or password."}), 401
        token = create_access_token(identity=str(user.id))
        return jsonify({"access_token": token, "user": user.to_dict()})

    @app.get("/api/auth/me")
    @jwt_required()
    def me():
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({"error": "User not found."}), 404
        return jsonify({"user": user.to_dict()})

    @app.get("/api/dashboard")
    @jwt_required()
    def dashboard():
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({"error": "User not found."}), 404

        totals = portfolio_totals(user)
        recent_tx = (
            Transaction.query.filter_by(user_id=user.id)
            .order_by(Transaction.occurred_at.desc())
            .limit(8)
            .all()
        )
        holdings = sorted(user.investments, key=lambda i: i.market_value, reverse=True)

        return jsonify(
            {
                "summary": totals,
                "holdings": [h.to_dict() for h in holdings],
                "recent_transactions": [t.to_dict() for t in recent_tx],
            }
        )

    @app.get("/api/trends")
    @jwt_required()
    def trends():
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({"error": "User not found."}), 404

        since = utcnow() - timedelta(days=90)
        snapshots = (
            PortfolioSnapshot.query.filter(
                PortfolioSnapshot.user_id == user.id,
                PortfolioSnapshot.recorded_at >= since,
            )
            .order_by(PortfolioSnapshot.recorded_at.asc())
            .all()
        )

        # Spending by category (expenses in last 90 days)
        expenses = Transaction.query.filter(
            Transaction.user_id == user.id,
            Transaction.kind == "expense",
            Transaction.occurred_at >= since,
        ).all()
        by_category = {}
        for tx in expenses:
            by_category[tx.category] = by_category.get(tx.category, 0) + abs(tx.amount)

        allocation = {}
        for inv in user.investments:
            allocation[inv.asset_class] = allocation.get(inv.asset_class, 0) + inv.market_value

        return jsonify(
            {
                "net_worth": [s.to_dict() for s in snapshots],
                "spending_by_category": [
                    {"category": k, "amount": round(v, 2)} for k, v in sorted(by_category.items())
                ],
                "allocation": [
                    {"asset_class": k, "amount": round(v, 2)} for k, v in sorted(allocation.items())
                ],
            }
        )

    @app.post("/api/prices/refresh")
    @jwt_required()
    def refresh_prices():
        """Live tick: refresh stale quotes (Yahoo mark-to-market, Polygon backup)."""
        user = User.query.get(int(get_jwt_identity()))
        if not user:
            return jsonify({"error": "User not found."}), 404

        # Allow burst on first paint; steady live mode uses 2 network calls/tick
        try:
            max_calls = int(request.args.get("max_calls", 2))
        except ValueError:
            max_calls = 2
        max_calls = max(1, min(max_calls, 6))

        quotes = lookup_live(
            [(inv.symbol, inv.current_price) for inv in user.investments],
            max_network_calls=max_calls,
        )

        updated = 0
        sources = {}
        for inv in user.investments:
            quote = quotes.get(inv.symbol.upper())
            if not quote:
                continue
            new_price = float(quote["price"])
            if abs(new_price - inv.current_price) > 1e-6:
                updated += 1
            inv.current_price = new_price
            qname = (quote.get("name") or "").strip()
            if qname and qname.upper() != inv.symbol and len(qname) > 4:
                if inv.symbol in CRYPTO_SYMBOLS or inv.name == inv.symbol:
                    inv.name = qname
            inv.updated_at = utcnow()
            sources[inv.symbol] = quote.get("source", "unknown")

        db.session.commit()
        snap = record_snapshot(user)
        totals = portfolio_totals(user)
        holdings = sorted(user.investments, key=lambda i: i.market_value, reverse=True)
        allocation = {}
        for inv in holdings:
            allocation[inv.asset_class] = allocation.get(inv.asset_class, 0) + inv.market_value

        return jsonify(
            {
                "summary": totals,
                "holdings": [h.to_dict() for h in holdings],
                "snapshot": snap.to_dict(),
                "allocation": [
                    {"asset_class": k, "amount": round(v, 2)} for k, v in sorted(allocation.items())
                ],
                "updated": updated,
                "sources": sources,
                "server_time": utcnow().isoformat(),
            }
        )

    @app.get("/api/investments")
    @jwt_required()
    def list_investments():
        user_id = int(get_jwt_identity())
        items = Investment.query.filter_by(user_id=user_id).order_by(Investment.symbol).all()
        return jsonify({"investments": [i.to_dict() for i in items]})

    @app.post("/api/investments")
    @jwt_required()
    def create_investment():
        user = User.query.get(int(get_jwt_identity()))
        data = request.get_json(silent=True) or {}
        try:
            symbol = (data.get("symbol") or "").strip().upper()
            name = (data.get("name") or symbol).strip()
            shares = float(data.get("shares", 0))
            avg_cost = float(data.get("avg_cost", 0))
            price_raw = data.get("current_price")
            current_price = float(price_raw) if price_raw not in (None, "") else 0.0
            asset_class = (data.get("asset_class") or "Equity").strip()
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid investment payload."}), 400

        if not symbol or shares <= 0 or avg_cost <= 0:
            return jsonify({"error": "Symbol, shares, and avg_cost are required."}), 400

        quote = lookup(symbol)
        if quote:
            if current_price <= 0:
                current_price = float(quote["price"])
            if not data.get("name"):
                name = quote.get("name") or name
        elif current_price <= 0:
            current_price = avg_cost

        cost = shares * avg_cost
        if cost > user.cash_balance:
            return jsonify({"error": "Insufficient cash balance."}), 400

        existing = Investment.query.filter_by(user_id=user.id, symbol=symbol).first()
        if existing:
            total_shares = existing.shares + shares
            existing.avg_cost = (
                (existing.shares * existing.avg_cost) + (shares * avg_cost)
            ) / total_shares
            existing.shares = total_shares
            existing.current_price = current_price
            existing.asset_class = asset_class
            inv = existing
        else:
            inv = Investment(
                user_id=user.id,
                symbol=symbol,
                name=name,
                shares=shares,
                avg_cost=avg_cost,
                current_price=current_price,
                asset_class=asset_class,
            )
            db.session.add(inv)

        user.cash_balance -= cost
        db.session.add(
            Transaction(
                user_id=user.id,
                kind="buy",
                amount=cost,
                category="Investing",
                description=f"Bought {shares} {symbol}",
                occurred_at=utcnow(),
            )
        )
        db.session.commit()
        record_snapshot(user, force=True)
        return jsonify({"investment": inv.to_dict(), "cash_balance": round(user.cash_balance, 2)}), 201

    @app.delete("/api/investments/<int:inv_id>")
    @jwt_required()
    def delete_investment(inv_id):
        user = User.query.get(int(get_jwt_identity()))
        inv = Investment.query.filter_by(id=inv_id, user_id=user.id).first()
        if not inv:
            return jsonify({"error": "Investment not found."}), 404

        proceeds = inv.market_value
        user.cash_balance += proceeds
        db.session.add(
            Transaction(
                user_id=user.id,
                kind="sell",
                amount=proceeds,
                category="Investing",
                description=f"Sold {inv.shares} {inv.symbol}",
                occurred_at=utcnow(),
            )
        )
        db.session.delete(inv)
        db.session.commit()
        record_snapshot(user, force=True)
        return jsonify({"ok": True, "cash_balance": round(user.cash_balance, 2)})

    @app.get("/api/transactions")
    @jwt_required()
    def list_transactions():
        user_id = int(get_jwt_identity())
        items = (
            Transaction.query.filter_by(user_id=user_id)
            .order_by(Transaction.occurred_at.desc())
            .limit(200)
            .all()
        )
        return jsonify({"transactions": [t.to_dict() for t in items]})

    @app.post("/api/transactions")
    @jwt_required()
    def create_transaction():
        user = User.query.get(int(get_jwt_identity()))
        data = request.get_json(silent=True) or {}
        kind = (data.get("kind") or "").strip().lower()
        category = (data.get("category") or "General").strip()
        description = (data.get("description") or "").strip()
        try:
            amount = abs(float(data.get("amount", 0)))
        except (TypeError, ValueError):
            return jsonify({"error": "Invalid amount."}), 400

        if kind not in {"income", "expense", "transfer"} or amount <= 0:
            return jsonify({"error": "Kind must be income, expense, or transfer with amount > 0."}), 400

        occurred_raw = data.get("occurred_at")
        if occurred_raw:
            try:
                occurred_at = datetime.fromisoformat(occurred_raw.replace("Z", "+00:00"))
            except ValueError:
                return jsonify({"error": "Invalid date format."}), 400
        else:
            occurred_at = utcnow()

        if kind == "income":
            user.cash_balance += amount
        elif kind == "expense":
            if amount > user.cash_balance:
                return jsonify({"error": "Insufficient cash for this expense."}), 400
            user.cash_balance -= amount
        # transfer: cash-neutral demo record

        tx = Transaction(
            user_id=user.id,
            kind=kind,
            amount=amount,
            category=category,
            description=description,
            occurred_at=occurred_at,
        )
        db.session.add(tx)
        db.session.commit()
        record_snapshot(user, force=True)
        return jsonify({"transaction": tx.to_dict(), "cash_balance": round(user.cash_balance, 2)}), 201

    @app.delete("/api/transactions/<int:tx_id>")
    @jwt_required()
    def delete_transaction(tx_id):
        user = User.query.get(int(get_jwt_identity()))
        tx = Transaction.query.filter_by(id=tx_id, user_id=user.id).first()
        if not tx:
            return jsonify({"error": "Transaction not found."}), 404
        db.session.delete(tx)
        db.session.commit()
        return jsonify({"ok": True})


app = create_app()

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001, debug=True)