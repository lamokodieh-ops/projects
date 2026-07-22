"""
Unified LLM + embedding client.

- Live: OpenAI chat + embeddings when OPENAI_API_KEY is set (or LLM_MODE=live)
- Mock: deterministic, clearly labeled placeholder content for demos without a key
- Embeddings: openai | local (sentence-transformers) | mock (hash vectors)
"""

from __future__ import annotations

import hashlib
import math
import re
import time
from typing import Iterator

import numpy as np

from config import (
    EMBEDDING_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_CHAT_MODEL,
    OPENAI_EMBED_MODEL,
    resolve_llm_mode,
)

EMBED_DIM = 384


class LLMClient:
    def __init__(self) -> None:
        self.mode = resolve_llm_mode()
        self.embed_provider = self._resolve_embed_provider()
        self._openai = None
        self._local_model = None
        if self.mode == "live" and not OPENAI_API_KEY:
            raise RuntimeError("LLM_MODE=live but OPENAI_API_KEY is missing")

    def _resolve_embed_provider(self) -> str:
        if EMBEDDING_PROVIDER in {"openai", "local", "mock"}:
            if EMBEDDING_PROVIDER == "openai" and not OPENAI_API_KEY:
                return "mock"
            return EMBEDDING_PROVIDER
        if OPENAI_API_KEY and self.mode == "live":
            return "openai"
        try:
            import sentence_transformers  # noqa: F401

            return "local"
        except ImportError:
            return "mock"

    def _openai_client(self):
        if self._openai is None:
            from openai import OpenAI

            self._openai = OpenAI(api_key=OPENAI_API_KEY)
        return self._openai

    def status(self) -> dict:
        return {
            "mode": self.mode,
            "embedding_provider": self.embed_provider,
            "chat_model": OPENAI_CHAT_MODEL if self.mode == "live" else "mock",
            "embed_model": OPENAI_EMBED_MODEL
            if self.embed_provider == "openai"
            else self.embed_provider,
        }

    # ----- embeddings -----

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        if self.embed_provider == "openai":
            return self._embed_openai(texts)
        if self.embed_provider == "local":
            return self._embed_local(texts)
        return [self._embed_mock(t) for t in texts]

    def _embed_openai(self, texts: list[str]) -> list[list[float]]:
        client = self._openai_client()
        response = client.embeddings.create(model=OPENAI_EMBED_MODEL, input=texts)
        return [row.embedding for row in response.data]

    def _embed_local(self, texts: list[str]) -> list[list[float]]:
        if self._local_model is None:
            from sentence_transformers import SentenceTransformer

            self._local_model = SentenceTransformer("all-MiniLM-L6-v2")
        vectors = self._local_model.encode(texts, normalize_embeddings=True)
        return [v.tolist() for v in vectors]

    def _embed_mock(self, text: str) -> list[float]:
        """Deterministic pseudo-embedding for offline demos (not semantic)."""
        vec = np.zeros(EMBED_DIM, dtype=np.float32)
        tokens = re.findall(r"[a-z0-9]+", text.lower()) or ["empty"]
        for tok in tokens:
            digest = hashlib.sha256(tok.encode()).digest()
            for i in range(0, min(len(digest), 32)):
                idx = (digest[i] * (i + 1) + len(tok)) % EMBED_DIM
                vec[idx] += 1.0
        norm = float(np.linalg.norm(vec)) or 1.0
        return (vec / norm).tolist()

    # ----- chat -----

    def stream_chat(self, messages: list[dict], *, task: str = "explain") -> Iterator[str]:
        if self.mode == "live":
            yield from self._stream_openai(messages)
        else:
            yield from self._stream_mock(messages, task=task)

    def chat(self, messages: list[dict], *, task: str = "explain") -> str:
        return "".join(self.stream_chat(messages, task=task))

    def _stream_openai(self, messages: list[dict]) -> Iterator[str]:
        client = self._openai_client()
        stream = client.chat.completions.create(
            model=OPENAI_CHAT_MODEL,
            messages=messages,
            stream=True,
            temperature=0.3,
        )
        for event in stream:
            delta = event.choices[0].delta.content
            if delta:
                yield delta

    def _stream_mock(self, messages: list[dict], *, task: str) -> Iterator[str]:
        text = _mock_placeholder(task)
        for word in text.split(" "):
            yield word + " "
            time.sleep(0.008)


def _mock_placeholder(task: str) -> str:
    label = {"explain": "Explanation", "quiz": "Quiz", "summary": "Summary"}.get(task, task.title())
    return (
        f"[Mock mode - {label} placeholder]\n\n"
        "Generated study content is disabled without an API key.\n\n"
        "The Sources panel still shows the passages this app would ground on "
        "(retrieval works in mock mode). Add OPENAI_API_KEY to backend/.env "
        "and restart the server for live explanations, quizzes, and summaries."
    )


llm = LLMClient()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1.0
    return float(np.dot(a, b) / denom)