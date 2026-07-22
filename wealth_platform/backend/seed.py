"""Seed demo portfolio data for Fortis."""

from datetime import timedelta
import random

from models import Investment, PortfolioSnapshot, Transaction, User, db, utcnow


DEMO_EMAIL = "demo@fortis.app"
DEMO_PASSWORD = "Demo123!"


def seed_demo_user():
    user = User(email=DEMO_EMAIL, name="Alex Meridian", cash_balance=18420.55)
    user.set_password(DEMO_PASSWORD)
    db.session.add(user)
    db.session.flush()

    holdings = [
        ("AAPL", "Apple Inc.", 42, 168.4, 214.2, "Equity"),
        ("MSFT", "Microsoft Corp.", 28, 310.0, 425.5, "Equity"),
        ("VTI", "Vanguard Total Stock", 65, 210.0, 268.3, "ETF"),
        ("BND", "Vanguard Total Bond", 80, 72.5, 74.1, "Fixed Income"),
        ("BTC", "Bitcoin", 0.35, 42000.0, 68500.0, "Crypto"),
        ("GLD", "SPDR Gold Shares", 20, 175.0, 228.4, "Commodity"),
    ]
    for symbol, name, shares, avg, price, klass in holdings:
        db.session.add(
            Investment(
                user_id=user.id,
                symbol=symbol,
                name=name,
                shares=shares,
                avg_cost=avg,
                current_price=price,
                asset_class=klass,
            )
        )

    now = utcnow()
    sample_tx = [
        ("income", 5200, "Salary", "March paycheck", 45),
        ("expense", 1850, "Housing", "Rent", 42),
        ("expense", 240, "Food", "Groceries", 38),
        ("expense", 89, "Transport", "Transit pass", 35),
        ("income", 420, "Dividends", "VTI dividend", 30),
        ("expense", 65, "Subscriptions", "Software tools", 28),
        ("buy", 2100, "Investing", "Added to VTI", 25),
        ("expense", 120, "Health", "Pharmacy", 20),
        ("expense", 310, "Food", "Dining out", 14),
        ("income", 200, "Transfers", "Side project", 10),
        ("expense", 55, "Entertainment", "Concert", 7),
        ("expense", 48, "Utilities", "Electric bill", 3),
    ]
    for kind, amount, category, desc, days_ago in sample_tx:
        db.session.add(
            Transaction(
                user_id=user.id,
                kind=kind,
                amount=amount,
                category=category,
                description=desc,
                occurred_at=now - timedelta(days=days_ago),
            )
        )

    # Historical net-worth curve (~90 days)
    invested_base = sum(s * p for _, _, s, _, p, _ in holdings)
    cash = user.cash_balance
    value = invested_base + cash
    for day in range(90, -1, -1):
        # Gentle upward drift with noise
        value *= 1 + random.uniform(-0.008, 0.012)
        cash_part = cash * (0.95 + random.random() * 0.1)
        invested_part = max(0, value - cash_part)
        db.session.add(
            PortfolioSnapshot(
                user_id=user.id,
                total_value=round(value, 2),
                invested_value=round(invested_part, 2),
                cash_balance=round(cash_part, 2),
                recorded_at=now - timedelta(days=day, hours=random.randint(0, 12)),
            )
        )

    db.session.commit()
    return user


if __name__ == "__main__":
    from app import create_app

    application = create_app()
    with application.app_context():
        existing = User.query.filter_by(email=DEMO_EMAIL).first()
        if existing:
            print(f"Demo user already exists: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        else:
            seed_demo_user()
            print(f"Seeded demo user: {DEMO_EMAIL} / {DEMO_PASSWORD}")