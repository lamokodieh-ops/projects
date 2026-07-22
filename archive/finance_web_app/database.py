"""Minimal SQLite helper compatible with the old execute(...) call style."""

from __future__ import annotations

import sqlite3
from pathlib import Path


class SQL:
    def __init__(self, uri: str):
        # Accept sqlite:///relative/or/absolute.db
        path = uri.replace("sqlite:///", "", 1)
        self.path = str(Path(path))

    def execute(self, query: str, *args):
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        try:
            cur = conn.execute(query, args)
            leading = query.lstrip().split(None, 1)[0].upper() if query.strip() else ""
            if leading in {"SELECT", "PRAGMA", "WITH"}:
                rows = [dict(row) for row in cur.fetchall()]
            else:
                rows = []
            conn.commit()
            return rows
        finally:
            conn.close()
