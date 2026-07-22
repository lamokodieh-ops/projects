from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    name = db.Column(db.String(120), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    cash_balance = db.Column(db.Float, nullable=False, default=10000.0)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    investments = db.relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    snapshots = db.relationship("PortfolioSnapshot", back_populates="user", cascade="all, delete-orphan")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "cash_balance": round(self.cash_balance, 2),
        }


class Investment(db.Model):
    __tablename__ = "investments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    symbol = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    shares = db.Column(db.Float, nullable=False)
    avg_cost = db.Column(db.Float, nullable=False)
    current_price = db.Column(db.Float, nullable=False)
    asset_class = db.Column(db.String(40), nullable=False, default="Equity")
    updated_at = db.Column(db.DateTime, nullable=False, default=utcnow, onupdate=utcnow)

    user = db.relationship("User", back_populates="investments")

    @property
    def market_value(self) -> float:
        return self.shares * self.current_price

    @property
    def cost_basis(self) -> float:
        return self.shares * self.avg_cost

    @property
    def unrealized_pl(self) -> float:
        return self.market_value - self.cost_basis

    @property
    def unrealized_pl_pct(self) -> float:
        basis = self.cost_basis
        if basis <= 0:
            return 0.0
        return (self.unrealized_pl / basis) * 100

    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol.upper(),
            "name": self.name,
            "shares": round(self.shares, 4),
            "avg_cost": round(self.avg_cost, 2),
            "current_price": round(self.current_price, 2),
            "asset_class": self.asset_class,
            "market_value": round(self.market_value, 2),
            "cost_basis": round(self.cost_basis, 2),
            "unrealized_pl": round(self.unrealized_pl, 2),
            "unrealized_pl_pct": round(self.unrealized_pl_pct, 2),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    kind = db.Column(db.String(20), nullable=False)  # income | expense | buy | sell | transfer
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(60), nullable=False, default="General")
    description = db.Column(db.String(255), nullable=False, default="")
    occurred_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)

    user = db.relationship("User", back_populates="transactions")

    def to_dict(self):
        return {
            "id": self.id,
            "kind": self.kind,
            "amount": round(self.amount, 2),
            "category": self.category,
            "description": self.description,
            "occurred_at": self.occurred_at.isoformat() if self.occurred_at else None,
        }


class PortfolioSnapshot(db.Model):
    __tablename__ = "portfolio_snapshots"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    total_value = db.Column(db.Float, nullable=False)
    invested_value = db.Column(db.Float, nullable=False)
    cash_balance = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, nullable=False, default=utcnow, index=True)

    user = db.relationship("User", back_populates="snapshots")

    def to_dict(self):
        return {
            "total_value": round(self.total_value, 2),
            "invested_value": round(self.invested_value, 2),
            "cash_balance": round(self.cash_balance, 2),
            "recorded_at": self.recorded_at.isoformat(),
        }