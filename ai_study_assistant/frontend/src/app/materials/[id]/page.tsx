"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ModeBadge from "@/components/ModeBadge";
import { getMaterial, streamGenerate } from "@/lib/api";
import type { Generation, LlmStatus, Material, SourceChunk, Task } from "@/lib/types";

export default function MaterialWorkspacePage() {
  const params = useParams<{ id: string }>();
  const materialId = Number(params.id);
  const [material, setMaterial] = useState<Material | null>(null);
  const [status, setStatus] = useState<LlmStatus | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [task, setTask] = useState<Task>("explain");
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!materialId) return;
    getMaterial(materialId)
      .then((data) => {
        setMaterial(data.material);
        setHistory(data.generations);
        setStatus(data);
      })
      .catch((err: Error) => setError(err.message));
  }, [materialId]);

  const canRun = useMemo(() => !!material && !busy, [material, busy]);

  async function run() {
    if (!material) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError("");
    setOutput("");
    setSources([]);
    try {
      await streamGenerate(
        {
          material_id: material.id,
          task,
          question: question.trim() || undefined,
        },
        {
          onMeta: (meta) => setStatus(meta),
          onSources: (chunks) => setSources(chunks),
          onToken: (text) => setOutput((prev) => prev + text),
          onDone: () => {
            getMaterial(material.id).then((data) => setHistory(data.generations));
          },
          onError: (message) => setError(message),
        },
        controller.signal,
      );
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Generation failed");
      }
    } finally {
      setBusy(false);
    }
  }

  if (!material && !error) {
    return (
      <main className="shell">
        <p className="muted">Loading material…</p>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          AI Study <span>Assistant</span>
        </Link>
        <ModeBadge status={status} />
      </header>

      <div className="workspace-head">
        <div>
          <h1 style={{ fontSize: "1.9rem" }}>{material?.title || "Material"}</h1>
          <p className="muted" style={{ margin: "0.4rem 0 0" }}>
            {material?.chunk_count} chunks indexed · {material?.source_type}
          </p>
        </div>
        <Link href="/" className="btn btn-ghost">
          ← Library
        </Link>
      </div>

      <div className="grid">
        <section className="panel">
          <h2>Generate</h2>
          <div className="modes">
            {(["explain", "quiz", "summary"] as Task[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-ghost ${task === t ? "active" : ""}`}
                onClick={() => setTask(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {task === "explain" && (
            <div className="field">
              <label htmlFor="q">Optional focus question</label>
              <input
                id="q"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Why does this mechanism matter?"
              />
            </div>
          )}
          <button className="btn btn-primary" type="button" disabled={!canRun} onClick={run}>
            {busy ? "Streaming…" : `Generate ${task}`}
          </button>
          {error && <p className="error" style={{ marginTop: "0.75rem" }}>{error}</p>}

          <h2 style={{ marginTop: "1.4rem" }}>Output</h2>
          <div className="stream">{output || <span className="muted">Response streams here…</span>}</div>

          {history.length > 0 && (
            <>
              <h2 style={{ marginTop: "1.4rem" }}>Recent for this material</h2>
              <div className="list">
                {history.slice(0, 5).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className="card-link"
                    style={{ width: "100%", textAlign: "left", cursor: "pointer", border: "none" }}
                    onClick={() => {
                      setOutput(g.output);
                      setSources(g.sources);
                      setTask(g.task as Task);
                    }}
                  >
                    <strong style={{ textTransform: "capitalize" }}>{g.task}</strong>
                    <div className="meta">{new Date(g.created_at).toLocaleString()} · {g.mode}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="panel">
          <h2>Sources used</h2>
          <p className="muted" style={{ marginTop: 0, marginBottom: "0.85rem", fontSize: "0.9rem" }}>
            Retrieved chunks grounding this answer — inspect them to judge factual support.
          </p>
          {sources.length === 0 ? (
            <p className="muted">Sources appear when you generate.</p>
          ) : (
            <div className="sources">
              {sources.map((s, i) => (
                <article key={`${s.id}-${i}`} className="source">
                  <div className="score">
                    [S{i + 1}] chunk {s.id} · score {s.score}
                  </div>
                  {s.text}
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}