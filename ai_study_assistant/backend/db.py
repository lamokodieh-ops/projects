import json
import sqlite3
from datetime import datetime, timezone
from typing import Any

from config import DB_PATH, ensure_dirs


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    ensure_dirs()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                source_type TEXT NOT NULL,
                filename TEXT,
                char_count INTEGER NOT NULL DEFAULT 0,
                chunk_count INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS generations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                task TEXT NOT NULL,
                question TEXT,
                output TEXT NOT NULL,
                sources_json TEXT NOT NULL,
                mode TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (material_id) REFERENCES materials(id)
            );

            CREATE TABLE IF NOT EXISTS quiz_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                material_id INTEGER NOT NULL,
                questions_json TEXT NOT NULL,
                sources_json TEXT NOT NULL,
                mode TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (material_id) REFERENCES materials(id)
            );
            """
        )


def create_quiz_session(material_id: int, questions: list[dict], sources: list[dict], mode: str) -> dict:
    created = utcnow()
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO quiz_sessions (material_id, questions_json, sources_json, mode, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (material_id, json.dumps(questions), json.dumps(sources), mode, created),
        )
        sid = cur.lastrowid
    return get_quiz_session(sid)


def get_quiz_session(session_id: int) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM quiz_sessions WHERE id = ?", (session_id,)).fetchone()
    if not row:
        return None
    data = dict(row)
    data["questions"] = json.loads(data.pop("questions_json"))
    data["sources"] = json.loads(data.pop("sources_json"))
    return data


def create_material(title: str, source_type: str, filename: str | None, char_count: int, chunk_count: int) -> dict:
    created = utcnow()
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO materials (title, source_type, filename, char_count, chunk_count, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (title, source_type, filename, char_count, chunk_count, created),
        )
        mid = cur.lastrowid
    return get_material(mid)


def get_material(material_id: int) -> dict | None:
    with connect() as conn:
        row = conn.execute("SELECT * FROM materials WHERE id = ?", (material_id,)).fetchone()
    return dict(row) if row else None


def list_materials() -> list[dict]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM materials ORDER BY id DESC").fetchall()
    return [dict(r) for r in rows]


def save_generation(
    material_id: int,
    task: str,
    question: str | None,
    output: str,
    sources: list[dict],
    mode: str,
) -> dict:
    created = utcnow()
    with connect() as conn:
        cur = conn.execute(
            """
            INSERT INTO generations (material_id, task, question, output, sources_json, mode, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (material_id, task, question, output, json.dumps(sources), mode, created),
        )
        gid = cur.lastrowid
        row = conn.execute("SELECT * FROM generations WHERE id = ?", (gid,)).fetchone()
    data = dict(row)
    data["sources"] = json.loads(data.pop("sources_json"))
    return data


def list_generations(material_id: int) -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute(
            """
            SELECT id, material_id, task, question, output, sources_json, mode, created_at
            FROM generations WHERE material_id = ? ORDER BY id DESC LIMIT 50
            """,
            (material_id,),
        ).fetchall()
    out = []
    for row in rows:
        item = dict(row)
        item["sources"] = json.loads(item.pop("sources_json"))
        out.append(item)
    return out