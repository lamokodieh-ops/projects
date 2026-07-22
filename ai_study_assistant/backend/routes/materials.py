from __future__ import annotations

import os
from pathlib import Path

from flask import Blueprint, jsonify, request

from config import UPLOAD_DIR, ensure_dirs
from db import create_material, get_material, list_generations, list_materials
from llm_client import llm
from rag.ingest import chunk_text, extract_text_from_pdf, normalize_text
from rag.store import MaterialStore

materials_bp = Blueprint("materials", __name__)


@materials_bp.get("/api/materials")
def api_list_materials():
    return jsonify({"materials": list_materials(), **llm.status()})


@materials_bp.get("/api/materials/<int:material_id>")
def api_get_material(material_id: int):
    material = get_material(material_id)
    if not material:
        return jsonify({"error": "Material not found"}), 404
    return jsonify(
        {
            "material": material,
            "generations": list_generations(material_id),
            **llm.status(),
        }
    )


@materials_bp.post("/api/materials")
def api_create_material():
    ensure_dirs()
    title = None
    text = None
    source_type = "text"
    filename = None

    if request.content_type and "multipart/form-data" in request.content_type:
        file = request.files.get("file")
        title = (request.form.get("title") or "").strip() or None
        if file and file.filename:
            filename = Path(file.filename).name
            raw = file.read()
            suffix = Path(filename).suffix.lower()
            if suffix == ".pdf":
                source_type = "pdf"
                text = extract_text_from_pdf(raw)
            else:
                source_type = "text"
                text = raw.decode("utf-8", errors="ignore")
            dest = UPLOAD_DIR / filename
            # avoid overwrite collisions
            stem, ext = dest.stem, dest.suffix
            i = 1
            while dest.exists():
                dest = UPLOAD_DIR / f"{stem}_{i}{ext}"
                i += 1
            dest.write_bytes(raw)
            filename = dest.name
            if not title:
                title = stem.replace("_", " ").strip() or "Uploaded material"
        else:
            pasted = (request.form.get("text") or "").strip()
            if pasted:
                text = pasted
                title = title or (request.form.get("title") or "Pasted notes").strip()
    else:
        data = request.get_json(silent=True) or {}
        text = (data.get("text") or "").strip()
        title = (data.get("title") or "Pasted notes").strip()
        source_type = "text"

    text = normalize_text(text or "")
    if not text:
        return jsonify({"error": "No text extracted. Upload a PDF/TXT or paste content."}), 400
    if not title:
        title = "Untitled material"

    chunks = chunk_text(text)
    if not chunks:
        return jsonify({"error": "Could not chunk material."}), 400

    material = create_material(
        title=title,
        source_type=source_type,
        filename=filename,
        char_count=len(text),
        chunk_count=len(chunks),
    )

    vectors = llm.embed(chunks)
    MaterialStore(material["id"]).save(chunks, vectors)

    # update chunk_count already set; return with llm status
    return jsonify({"material": material, **llm.status()}), 201