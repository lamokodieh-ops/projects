"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import ModeBadge from "@/components/ModeBadge";
import { StaggerItem, StaggerList } from "@/components/Motion";
import { createMaterial, getHealth, listMaterials } from "@/lib/api";
import type { LlmStatus, Material } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
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
      router.push(`/materials/${res.material.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="desk">
      <header className="mast">
        <div className="mark">
          <span className="mark-kicker">Study desk</span>
          <span className="mark-name">Cortex</span>
        </div>
        <ModeBadge status={status} />
      </header>

      <section className="hero">
        <h1>Read your notes under a lamp, not a chatbot window.</h1>
        <p>
          Drop a reading on the desk. Explanations, quizzes, and summaries come back with the
          passages they were pulled from sitting in the margin.
        </p>
      </section>

      <div className="grid">
        <section className="paper">
          <h2>New material</h2>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="title">Title</label>
              <input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Week 3 — Photosynthesis"
              />
            </div>
            <div className="field">
              <label htmlFor="file">PDF or TXT</label>
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
                placeholder="Lecture notes, readings…"
              />
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Working…" : "Open on the desk"}
            </button>
          </form>
        </section>

        <section className="margin">
          <h2>Library</h2>
          <p className="muted" style={{ margin: "0 0 0.85rem", fontSize: "0.88rem" }}>
            Index of materials on this desk.
          </p>
          {materials.length === 0 ? (
            <p className="muted">Nothing here yet.</p>
          ) : (
            <StaggerList className="list">
              {materials.map((m) => (
                <StaggerItem key={m.id}>
                  <Link href={`/materials/${m.id}`} className="card-link">
                    <strong>{m.title}</strong>
                    <div className="meta">
                      {m.chunk_count} chunks · {m.created_at.slice(0, 10)}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerList>
          )}
        </section>
      </div>
    </main>
  );
}
