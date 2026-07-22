"""
Unified LLM + embedding client.

- Live: OpenAI chat + embeddings when OPENAI_API_KEY is set (or LLM_MODE=live)
- Mock: deterministic, clearly labeled placeholder content for demos without a key
- Embeddings: openai | local (sentence-transformers) | mock (hash vectors)
"""

from __future__ import annotations

import hashlib
import json
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
        user = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        context = ""
        if "Source materials:" in user:
            context = user.split("Source materials:", 1)[-1][:500].strip()
        topic = _guess_topic(user, context)

        if task == "quiz":
            text = _mock_quiz(topic, context)
        elif task == "summary":
            text = _mock_summary(topic, context)
        else:
            text = _mock_explanation(topic, context)

        # Simulate low-latency streaming
        for word in text.split(" "):
            yield word + " "
            time.sleep(0.012)


def _guess_topic(user: str, context: str) -> str:
    for line in (context or user).splitlines():
        line = line.strip(" #-")
        if 12 < len(line) < 80:
            return line
    return "the uploaded course material"


def _mock_explanation(topic: str, context: str) -> str:
    snippet = (context[:280] + "…") if len(context) > 280 else (context or "the provided excerpts")
    return f"""**[MOCK MODE — no OpenAI API key]**

## Explanation: {topic}

This explanation is grounded in the retrieved excerpts below (paraphrased for clarity).

### Plain-language overview
{topic} can be understood by breaking it into (1) the core idea, (2) why it matters in the course, and (3) a concrete example from your materials.

### From your materials
> {snippet}

### How to remember it
- Restate the idea in one sentence without jargon.
- Connect it to a prior concept from the same reading.
- Ask: what would change if this assumption were false?

### Quick check
If you can teach this back to a peer using only the source chunks shown in the sidebar, you have a solid grasp.

*Replace `OPENAI_API_KEY` in `backend/.env` and restart to generate live RAG answers.*
"""


def _mock_summary(topic: str, context: str) -> str:
    bullets = []
    for line in context.splitlines():
        line = line.strip()
        if len(line) > 40:
            bullets.append(line[:120])
        if len(bullets) >= 4:
            break
    if not bullets:
        bullets = [
            f"Key theme related to {topic}",
            "Supporting definition or claim from the reading",
            "Implication or application discussed in the material",
            "Open question or caveat to revisit before an exam",
        ]
    body = "\n".join(f"- {b}" for b in bullets)
    return f"""**[MOCK MODE — no OpenAI API key]**

## Summary: {topic}

{body}

### One-sentence takeaway
{topic} is best reviewed by pairing this summary with the cited source chunks.

*Live mode uses the same RAG pipeline with OpenAI for higher-quality synthesis.*
"""


def _mock_quiz(topic: str, context: str) -> str:
    return f"""**[MOCK MODE — no OpenAI API key]**

## Quiz: {topic}

**1.** Which statement best matches the retrieved material?
- A. The topic is unrelated to the uploaded reading
- B. The material introduces or develops ideas about {topic}
- C. The excerpt only contains bibliography entries
- D. No claims can be made without internet search

**Answer:** B  
**Why:** Retrieval selected passages discussing {topic}; a grounded answer should stay within those excerpts.

**2.** What is a good study move after reading the sources?
- A. Memorize the mock banner text
- B. Ignore citations and invent details
- C. Paraphrase each chunk, then self-test without looking
- D. Skip to another unrelated chapter

**Answer:** C  
**Why:** Active recall plus grounding in retrieved chunks reduces hallucination risk.

**3.** True or false: In this app, generated answers should cite the source chunks panel.
- A. True
- B. False

**Answer:** A  
**Why:** Showing retrieved context makes factual grounding inspectable (a fellowship evaluation criterion).

```json
{json.dumps({"questions": 3, "format": "mcq", "mode": "mock"}, indent=2)}
```
"""


llm = LLMClient()


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    denom = (np.linalg.norm(a) * np.linalg.norm(b)) or 1.0
    return float(np.dot(a, b) / denom)