from __future__ import annotations

from config import TOP_K
from llm_client import llm
from rag.store import MaterialStore


def retrieve_chunks(material_id: int, query: str, top_k: int = TOP_K) -> list[dict]:
    store = MaterialStore(material_id)
    vectors = llm.embed([query])
    if not vectors:
        return []
    hits = store.search(vectors[0], top_k=top_k)
    # Serialize scores for JSON/SSE
    return [
        {
            "id": h["id"],
            "text": h["text"],
            "score": round(float(h.get("score", 0.0)), 4),
        }
        for h in hits
    ]