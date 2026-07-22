"""Local vector store: NumPy cosine index + JSON chunk sidecar (FAISS-compatible shape)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from config import INDEX_DIR

try:
    import faiss  # type: ignore

    HAS_FAISS = True
except Exception:
    HAS_FAISS = False


class MaterialStore:
    def __init__(self, material_id: int):
        self.material_id = material_id
        self.dir = INDEX_DIR / str(material_id)
        self.meta_path = self.dir / "chunks.json"
        self.vectors_path = self.dir / "vectors.npy"
        self.faiss_path = self.dir / "index.faiss"

    def save(self, chunks: list[str], vectors: list[list[float]]) -> None:
        self.dir.mkdir(parents=True, exist_ok=True)
        payload = [{"id": i, "text": chunk} for i, chunk in enumerate(chunks)]
        self.meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        arr = np.asarray(vectors, dtype=np.float32)
        # normalize for cosine via inner product
        norms = np.linalg.norm(arr, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        arr = arr / norms
        np.save(self.vectors_path, arr)

        if HAS_FAISS and len(arr):
            index = faiss.IndexFlatIP(arr.shape[1])
            index.add(arr)
            faiss.write_index(index, str(self.faiss_path))

    def load_chunks(self) -> list[dict]:
        if not self.meta_path.exists():
            return []
        return json.loads(self.meta_path.read_text(encoding="utf-8"))

    def search(self, query_vec: list[float], top_k: int = 4) -> list[dict]:
        chunks = self.load_chunks()
        if not chunks or not self.vectors_path.exists():
            return []

        q = np.asarray(query_vec, dtype=np.float32)
        q = q / (np.linalg.norm(q) or 1.0)
        mat = np.load(self.vectors_path)

        if HAS_FAISS and self.faiss_path.exists():
            index = faiss.read_index(str(self.faiss_path))
            scores, idxs = index.search(q.reshape(1, -1), min(top_k, len(chunks)))
            hits = []
            for score, idx in zip(scores[0], idxs[0]):
                if idx < 0:
                    continue
                hits.append({**chunks[int(idx)], "score": float(score)})
            return hits

        scores = mat @ q
        top = np.argsort(-scores)[:top_k]
        return [{**chunks[int(i)], "score": float(scores[int(i)])} for i in top]


def store_exists(material_id: int) -> bool:
    return (INDEX_DIR / str(material_id) / "chunks.json").exists()