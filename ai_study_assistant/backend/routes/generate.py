from __future__ import annotations

import json

from flask import Blueprint, Response, jsonify, request, stream_with_context

from db import (
    create_quiz_session,
    get_material,
    get_quiz_session,
    list_generations,
    save_generation,
)
from llm_client import llm
from quiz import build_quiz_questions, grade_answer
from rag.prompts import build_messages
from rag.retrieve import retrieve_chunks
from rag.store import store_exists

generate_bp = Blueprint("generate", __name__)


@generate_bp.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "ai-study-assistant", **llm.status()})


@generate_bp.get("/api/materials/<int:material_id>/generations")
def api_generations(material_id: int):
    if not get_material(material_id):
        return jsonify({"error": "Material not found"}), 404
    return jsonify({"generations": list_generations(material_id)})


@generate_bp.post("/api/quiz/start")
def api_quiz_start():
    data = request.get_json(silent=True) or {}
    try:
        material_id = int(data.get("material_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "material_id is required"}), 400

    material = get_material(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    if not store_exists(material_id):
        return jsonify({"error": "Vector index missing for this material. Re-upload."}), 400

    sources = retrieve_chunks(material_id, f"quiz {material['title']}")
    questions = build_quiz_questions(sources, material["title"])
    if not questions:
        return jsonify({"error": "Could not build quiz questions from this material."}), 400

    session = create_quiz_session(material_id, questions, sources, llm.mode)
    public_questions = [
        {"index": i, "prompt": q["prompt"], "hint": q.get("hint")}
        for i, q in enumerate(questions)
    ]
    return jsonify(
        {
            "session_id": session["id"],
            "questions": public_questions,
            "sources": sources,
            "total": len(public_questions),
            **llm.status(),
        }
    )


@generate_bp.post("/api/quiz/grade")
def api_quiz_grade():
    data = request.get_json(silent=True) or {}
    try:
        session_id = int(data.get("session_id"))
        index = int(data.get("index"))
    except (TypeError, ValueError):
        return jsonify({"error": "session_id and index are required"}), 400

    user_answer = (data.get("answer") or "").strip()
    session = get_quiz_session(session_id)
    if not session:
        return jsonify({"error": "Quiz session not found"}), 404

    questions = session["questions"]
    if index < 0 or index >= len(questions):
        return jsonify({"error": "Invalid question index"}), 400

    q = questions[index]
    result = grade_answer(
        question=q["prompt"],
        expected=q["answer"],
        user_answer=user_answer,
        sources=session["sources"],
    )

    save_generation(
        material_id=session["material_id"],
        task="quiz",
        question=q["prompt"],
        output=json.dumps(
            {
                "user_answer": user_answer,
                "correct": result["correct"],
                "score": result["score"],
                "feedback": result["feedback"],
            }
        ),
        sources=session["sources"],
        mode=session["mode"],
    )

    return jsonify({"index": index, **result, **llm.status()})


@generate_bp.post("/api/generate")
def api_generate():
    data = request.get_json(silent=True) or {}
    material_id = data.get("material_id")
    task = (data.get("task") or "explain").strip().lower()
    question = (data.get("question") or "").strip() or None

    if task not in {"explain", "summary"}:
        return jsonify(
            {"error": "Use /api/quiz/start for quizzes. task must be explain or summary."}
        ), 400
    try:
        material_id = int(material_id)
    except (TypeError, ValueError):
        return jsonify({"error": "material_id is required"}), 400

    material = get_material(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    if not store_exists(material_id):
        return jsonify({"error": "Vector index missing for this material. Re-upload."}), 400

    query = question or f"{task} {material['title']}"
    sources = retrieve_chunks(material_id, query)
    messages = build_messages(task, sources, question=question)

    @stream_with_context
    def event_stream():
        yield _sse("meta", {"task": task, "material_id": material_id, **llm.status()})
        yield _sse("sources", {"sources": sources})

        parts: list[str] = []
        try:
            for token in llm.stream_chat(messages, task=task):
                parts.append(token)
                yield _sse("token", {"text": token})
            output = "".join(parts).strip()
            saved = save_generation(
                material_id=material_id,
                task=task,
                question=question,
                output=output,
                sources=sources,
                mode=llm.mode,
            )
            yield _sse("done", {"generation_id": saved["id"], "output": output})
        except Exception as exc:  # noqa: BLE001 — stream boundary
            yield _sse("error", {"error": str(exc)})

    return Response(
        event_stream(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"