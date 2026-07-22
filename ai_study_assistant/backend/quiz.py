"""Interactive short-answer quiz: generate questions, then grade user answers."""

from __future__ import annotations

import json
import re

from llm_client import llm
from rag.prompts import format_sources


def build_quiz_questions(sources: list[dict], title: str) -> list[dict]:
    """Return list of {prompt, answer, hint?} — answers stay server-side."""
    if llm.mode == "live":
        return _live_questions(sources, title)
    return _mock_questions(sources, title)


def grade_answer(question: str, expected: str, user_answer: str, sources: list[dict]) -> dict:
    user = (user_answer or "").strip()
    if not user:
        return {
            "correct": False,
            "score": 0,
            "feedback": "No answer submitted.",
            "expected": expected,
        }

    if llm.mode == "live":
        return _live_grade(question, expected, user, sources)
    return _mock_grade(question, expected, user)


def _mock_questions(sources: list[dict], title: str) -> list[dict]:
    chunks = [s.get("text", "").strip() for s in sources if s.get("text")]
    questions: list[dict] = []

    # Prefer content-grounded prompts from retrieved chunks
    for chunk in chunks[:3]:
        sentence = _first_sentence(chunk)
        if len(sentence) < 40:
            continue
        # Ask student to recall a key idea from the passage
        questions.append(
            {
                "prompt": f"In your own words, what is the main idea of this passage?\n\n\"{sentence}\"",
                "answer": sentence,
                "hint": "Use the Sources panel if you need a reminder.",
            }
        )

    if len(questions) < 2:
        questions.extend(
            [
                {
                    "prompt": f"Name one key concept from “{title}”.",
                    "answer": title.replace("Demo - ", "").replace(" (placeholder)", ""),
                    "hint": "Look at the material title and sources.",
                },
                {
                    "prompt": "What is one fact from the retrieved sources that you should remember for an exam?",
                    "answer": _first_sentence(chunks[0]) if chunks else "See sources",
                    "hint": "Pull a concrete detail from Sources.",
                },
            ]
        )

    return questions[:3]


def _mock_grade(question: str, expected: str, user: str) -> dict:
    exp_tokens = _tokens(expected)
    user_tokens = _tokens(user)
    if not exp_tokens:
        overlap = 0.0
    else:
        overlap = len(exp_tokens & user_tokens) / len(exp_tokens)

    # Also reward substantial answers that share phrasing
    if expected.lower() in user.lower() or user.lower() in expected.lower():
        overlap = max(overlap, 0.85)

    correct = overlap >= 0.35 or len(user_tokens) >= 6 and overlap >= 0.2
    score = int(round(min(1.0, overlap) * 100))

    if correct:
        feedback = "Solid — your answer matches the key ideas in the source material."
    elif overlap > 0:
        feedback = "Partially on track. Compare your answer with the expected points below."
    else:
        feedback = "Not quite. Review the sources and try to capture the core idea."

    return {
        "correct": correct,
        "score": score,
        "feedback": feedback,
        "expected": expected,
    }


def _live_questions(sources: list[dict], title: str) -> list[dict]:
    src = format_sources(sources)
    messages = [
        {
            "role": "system",
            "content": (
                "You create short-answer study quizzes grounded ONLY in the sources. "
                "Return strict JSON: {\"questions\":[{\"prompt\":\"...\",\"answer\":\"...\",\"hint\":\"...\"}]}. "
                "Exactly 3 questions. Answers should be 1-2 sentences."
            ),
        },
        {
            "role": "user",
            "content": f"Material: {title}\n\nSources:\n{src}",
        },
    ]
    raw = llm.chat(messages, task="quiz")
    parsed = _extract_json(raw)
    items = (parsed or {}).get("questions") or []
    out = []
    for item in items:
        prompt = (item.get("prompt") or "").strip()
        answer = (item.get("answer") or "").strip()
        if prompt and answer:
            out.append(
                {
                    "prompt": prompt,
                    "answer": answer,
                    "hint": (item.get("hint") or "").strip() or None,
                }
            )
    return out[:3] or _mock_questions(sources, title)


def _live_grade(question: str, expected: str, user: str, sources: list[dict]) -> dict:
    src = format_sources(sources[:3])
    messages = [
        {
            "role": "system",
            "content": (
                "Grade a short student answer against the expected answer and sources. "
                "Return JSON: {\"correct\":bool,\"score\":0-100,\"feedback\":\"...\"}. "
                "Be fair to paraphrases. Do not invent facts beyond sources."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Question: {question}\n"
                f"Expected: {expected}\n"
                f"Student: {user}\n\n"
                f"Sources:\n{src}"
            ),
        },
    ]
    raw = llm.chat(messages, task="quiz")
    parsed = _extract_json(raw) or {}
    correct = bool(parsed.get("correct"))
    try:
        score = int(parsed.get("score", 100 if correct else 40))
    except (TypeError, ValueError):
        score = 100 if correct else 40
    feedback = (parsed.get("feedback") or "").strip() or (
        "Good work." if correct else "Review the expected answer."
    )
    return {
        "correct": correct,
        "score": max(0, min(100, score)),
        "feedback": feedback,
        "expected": expected,
    }


def _first_sentence(text: str) -> str:
    text = " ".join(text.split())
    parts = re.split(r"(?<=[.!?])\s+", text)
    return (parts[0] if parts else text)[:240]


def _tokens(text: str) -> set[str]:
    stop = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "of",
        "to",
        "in",
        "on",
        "for",
        "is",
        "are",
        "was",
        "were",
        "that",
        "this",
        "with",
        "as",
        "by",
        "from",
        "it",
        "be",
    }
    return {t for t in re.findall(r"[a-z0-9]+", text.lower()) if t not in stop and len(t) > 2}


def _extract_json(raw: str) -> dict | None:
    raw = raw.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", raw)
    if not match:
        return None
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return None