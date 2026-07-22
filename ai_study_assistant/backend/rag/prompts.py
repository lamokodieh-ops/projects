from __future__ import annotations


SYSTEM = (
    "You are an AI Study Assistant for university learners. "
    "Answer ONLY using the provided source excerpts. "
    "If the sources are insufficient, say what is missing. "
    "Be clear, structured, and cite sources as [S1], [S2], etc. "
    "Do not invent facts beyond the excerpts."
)


def format_sources(chunks: list[dict]) -> str:
    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        blocks.append(f"[S{i}] (chunk {chunk['id']}, score={chunk.get('score', 0)})\n{chunk['text']}")
    return "\n\n".join(blocks) if blocks else "(no chunks retrieved)"


def build_messages(task: str, chunks: list[dict], question: str | None = None) -> list[dict]:
    sources = format_sources(chunks)
    if task == "quiz":
        instruction = (
            "Create a short multiple-choice quiz (3–5 questions) with answer key and brief why. "
            "Ground every question in the sources. Use [S#] citations."
        )
    elif task == "summary":
        instruction = (
            "Write a concise study summary with bullet key points and a one-sentence takeaway. "
            "Cite sources with [S#]."
        )
    else:
        instruction = (
            "Explain the material in plain language for a student. "
            "Use short sections and cite sources with [S#]."
        )
        if question:
            instruction += f"\nFocus on this learner question: {question}"

    user = f"""Task: {task}

{instruction}

Source materials:
{sources}
"""
    return [
        {"role": "system", "content": SYSTEM},
        {"role": "user", "content": user},
    ]