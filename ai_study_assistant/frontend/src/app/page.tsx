"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import ModeBadge from "@/components/ModeBadge";
import { createMaterial, getHealth, listMaterials } from "@/lib/api";
import type { LlmStatus, Material } from "@/lib/types";

export default function HomePage() {
  const [status, setStatus] = useState<LlmStatus | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const [health, list] = await Promise.all([getHealth(), listMaterials()]);
    setStatus(health);
    setMaterials(list.materials);
  }

  useEffect(() => {
    refresh().catch((err: Error) => setError(err.message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await createMaterial({ title, text, file });
      setTitle("");
      setText("");
      setFile(null);
      window.location.href = `/materials/${res.material.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          AI Study <span>Assistant</span>
        </div>
        <ModeBadge status={status} />
      </header>

      <section className="hero">
        <h1>Study from your own materials — grounded, inspectable, fast.</h1>
        <p>
          Upload a PDF or paste notes. Retrieval-augmented generation produces explanations,
          quizzes, and summaries with visible source chunks to reduce hallucinations.
        </p>
      </section>

      <div className="grid">
        <section className="panel">
          <h2>Add course material</h2>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 3 — Photosynthesis"
              />
            </div>
            <div className="field">
              <label htmlFor="file">PDF or TXT upload</label>
              <input
                id="file"
                type="file"
                accept=".pdf,.txt,text/plain,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <div className="field">
              <label htmlFor="text">Or paste text</label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste lecture notes, readings, or slides text…"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Ingesting…" : "Ingest & open workspace"}
            </button>
          </form>
        </section>

        <section className="panel">
          <h2>Your library</h2>
          {materials.length === 0 ? (
            <p className="muted">No materials yet. Upload something to begin.</p>
          ) : (
            <div className="list">
              {materials.map((m) => (
                <Link key={m.id} href={`/materials/${m.id}`} className="card-link">
                  <strong>{m.title}</strong>
                  <div className="meta">
                    {m.source_type.toUpperCase()} · {m.chunk_count} chunks ·{" "}
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}