import type { Generation, LlmStatus, Material } from "./types";

// Hit Flask directly so SSE streaming is not buffered by the Next rewrite proxy.
const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:5002";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export function getHealth() {
  return request<{ ok: boolean } & LlmStatus>("/api/health");
}

export function listMaterials() {
  return request<{ materials: Material[] } & LlmStatus>("/api/materials");
}

export function getMaterial(id: number) {
  return request<{ material: Material; generations: Generation[] } & LlmStatus>(
    `/api/materials/${id}`,
  );
}

export async function createMaterial(input: {
  title?: string;
  text?: string;
  file?: File | null;
}) {
  if (input.file) {
    const form = new FormData();
    form.append("file", input.file);
    if (input.title) form.append("title", input.title);
    return request<{ material: Material } & LlmStatus>("/api/materials", {
      method: "POST",
      body: form,
    });
  }
  return request<{ material: Material } & LlmStatus>("/api/materials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title || "Pasted notes", text: input.text || "" }),
  });
}

export type StreamHandlers = {
  onMeta?: (data: LlmStatus & { task: string; material_id: number }) => void;
  onSources?: (sources: import("./types").SourceChunk[]) => void;
  onToken?: (text: string) => void;
  onDone?: (data: { generation_id: number; output: string }) => void;
  onError?: (message: string) => void;
};

export function startQuiz(materialId: number) {
  return request<{
    session_id: number;
    questions: { index: number; prompt: string; hint?: string | null }[];
    sources: import("./types").SourceChunk[];
    total: number;
  } & LlmStatus>("/api/quiz/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ material_id: materialId }),
  });
}

export function gradeQuizAnswer(body: { session_id: number; index: number; answer: string }) {
  return request<
    {
      index: number;
      correct: boolean;
      score: number;
      feedback: string;
      expected: string;
    } & LlmStatus
  >("/api/quiz/grade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function streamGenerate(
  body: { material_id: number; task: string; question?: string },
  handlers: StreamHandlers,
  signal?: AbortSignal,
) {
  const res = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Generate failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() || "";
    for (const part of parts) {
      const lines = part.split("\n");
      let event = "message";
      const dataLines: string[] = [];
      for (const line of lines) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (!dataLines.length) continue;
      const payload = JSON.parse(dataLines.join("\n"));
      if (event === "meta") handlers.onMeta?.(payload);
      if (event === "sources") handlers.onSources?.(payload.sources || []);
      if (event === "token") handlers.onToken?.(payload.text || "");
      if (event === "done") handlers.onDone?.(payload);
      if (event === "error") handlers.onError?.(payload.error || "Stream error");
    }
  }
}