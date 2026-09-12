import sqlite3
from datetime import date, timedelta
from pathlib import Path

from werkzeug.security import generate_password_hash

db_path = Path(__file__).resolve().parent / "meal_planner.db"
conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

username = "gallerydemo"
password_hash = generate_password_hash("harvard1")
cur.execute("SELECT id FROM users WHERE username = ?", (username,))
row = cur.fetchone()
if row:
    user_id = row["id"]
else:
    cur.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (username, "gallery@example.com", password_hash),
    )
    user_id = cur.lastrowid

cur.execute("DELETE FROM meals WHERE user_id = ?", (user_id,))

today = date.today()
sunday = today - timedelta(days=(today.weekday() + 1) % 7)
meals = [
    (0, "breakfast", "Overnight oats", "Blueberries and honey", 1, 4, 1),
    (0, "lunch", "Annenberg grilled chicken", "From HUDS", 1, 5, 1),
    (1, "breakfast", "Egg sandwich", None, 0, 4, 1),
    (1, "lunch", "Pasta bar", "Pesto and vegetables", 1, 5, 1),
    (1, "dinner", "Salmon rice bowl", None, 0, 5, 0),
    (2, "breakfast", "Greek yogurt parfait", None, 0, 4, 1),
    (2, "lunch", "Turkey club", None, 0, 3, 1),
    (3, "lunch", "Stir fry tofu", "Annenberg station", 1, 4, 0),
    (3, "dinner", "Burger night", None, 0, 5, 0),
    (4, "breakfast", "Bagel and lox", None, 1, 5, 1),
    (4, "lunch", "HUDS salad bar", None, 0, 4, 0),
]
for offset, meal_type, name, description, fav, rating, eaten in meals:
    cur.execute(
        """
        INSERT INTO meals (user_id, meal_type, meal_name, meal_date, description, is_favorite, rating, is_eaten)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (user_id, meal_type, name, (sunday + timedelta(days=offset)).isoformat(), description, fav, rating, eaten),
    )

conn.commit()
conn.close()
print(f"seeded {len(meals)} meals for {username}")
