import type { Generation, LlmStatus, Material, SourceChunk } from "./types";

const DEMO_STATUS: LlmStatus = {
  mode: "mock",
  embedding_provider: "demo-hash",
  chat_model: "demo-stream",
  embed_model: "demo-embed",
};

const SAMPLE_TEXT = `Photosynthesis converts light energy into chemical energy.
Chloroplasts contain chlorophyll that absorbs sunlight.
The light-dependent reactions occur in the thylakoid membrane and produce ATP and NADPH.
The Calvin cycle (light-independent reactions) fixes carbon dioxide into sugars in the stroma.
Overall equation: 6CO2 + 6H2O + light → C6H12O6 + 6O2.
Stomata regulate gas exchange. Water is split during photolysis, releasing oxygen.`;

function chunkText(text: string): SourceChunk[] {
  return text
    .split(/(?<=\.)\s+/)
    .filter(Boolean)
    .map((t, i) => ({ id: i + 1, text: t.trim(), score: Math.max(0.5, 0.95 - i * 0.08) }));
}

type Store = {
  materials: Material[];
  generations: Record<number, Generation[]>;
  texts: Record<number, string>;
  nextId: number;
  nextGenId: number;
  quizSessions: Record<
    number,
    { material_id: number; questions: { index: number; prompt: string; expected: string; hint?: string }[] }
  >;
  nextSession: number;
};

function createStore(): Store {
  const id = 1;
  return {
    materials: [
      {
        id,
        title: "Week 3 — Photosynthesis",
        source_type: "text",
        filename: null,
        char_count: SAMPLE_TEXT.length,
        chunk_count: chunkText(SAMPLE_TEXT).length,
        created_at: new Date().toISOString(),
      },
    ],
    generations: { [id]: [] },
    texts: { [id]: SAMPLE_TEXT },
    nextId: 2,
    nextGenId: 1,
    quizSessions: {},
    nextSession: 1,
  };
}

let store = createStore();

function delay(ms = 60) {
  return new Promise((r) => setTimeout(r, ms));
}

function cannedOutput(task: string, question?: string, title?: string): string {
  if (task === "summary") {
    return (
      `**Summary of ${title || "your notes"}**\n\n` +
      `Photosynthesis turns light into chemical energy. Light reactions in thylakoids make ATP/NADPH; ` +
      `the Calvin cycle in the stroma fixes CO₂ into sugar. Water splitting releases O₂.`
    );
  }
  if (task === "explain" && question) {
    return (
      `**${question}**\n\n` +
      `Based on your notes: chloroplasts absorb light via chlorophyll; ATP and NADPH from the light reactions ` +
      `power carbon fixation in the Calvin cycle. The overall reaction balances CO₂, water, sugar, and oxygen.`
    );
  }
  return (
    `**Explanation**\n\n` +
    `Your material describes photosynthesis as converting light energy into chemical energy. ` +
    `Chlorophyll in chloroplasts drives light-dependent reactions (ATP, NADPH, O₂) and the Calvin cycle builds sugars from CO₂.`
  );
}

export const isDemo = process.env.NEXT_PUBLIC_DEMO === "true";

export const demoApi = {
  async getHealth() {
    await delay();
    return { ok: true as const, ...DEMO_STATUS };
  },

  async listMaterials() {
    await delay();
    return { materials: [...store.materials], ...DEMO_STATUS };
  },

  async getMaterial(id: number) {
    await delay();
    const material = store.materials.find((m) => m.id === id);
    if (!material) throw new Error("Material not found");
    return {
      material,
      generations: [...(store.generations[id] || [])],
      ...DEMO_STATUS,
    };
  },

  async createMaterial(input: { title?: string; text?: string; file?: File | null }) {
    await delay(120);
    let text = (input.text || "").trim();
    let filename: string | null = null;
    let source_type = "text";
    if (input.file) {
      filename = input.file.name;
      source_type = input.file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "text";
      text = text || (await input.file.text().catch(() => SAMPLE_TEXT));
      if (!text || text.includes("%PDF")) text = SAMPLE_TEXT;
    }
    if (!text) text = SAMPLE_TEXT;
    const id = store.nextId++;
    if (id > 20) {
      // Keep within statically exported route ids
      store.nextId = 2;
    }
    const material: Material = {
      id: Math.min(id, 20),
      title: input.title || filename || "Pasted notes",
      source_type,
      filename,
      char_count: text.length,
      chunk_count: chunkText(text).length,
      created_at: new Date().toISOString(),
    };
    // Prefer updating slot if we wrapped
    const existing = store.materials.findIndex((m) => m.id === material.id);
    if (existing >= 0) store.materials[existing] = material;
    else store.materials.unshift(material);
    store.texts[material.id] = text;
    store.generations[material.id] = store.generations[material.id] || [];
    return { material, ...DEMO_STATUS };
  },

  async startQuiz(materialId: number) {
    await delay();
    const session_id = store.nextSession++;
    const questions = [
      {
        index: 0,
        prompt: "Where do the light-dependent reactions occur?",
        expected: "thylakoid",
        hint: "Think membrane stacks inside the chloroplast.",
      },
      {
        index: 1,
        prompt: "What gas is released when water is split?",
        expected: "oxygen",
        hint: "Photolysis byproduct.",
      },
      {
        index: 2,
        prompt: "Which cycle fixes carbon dioxide into sugars?",
        expected: "calvin",
        hint: "Also called the light-independent reactions.",
      },
    ];
    store.quizSessions[session_id] = { material_id: materialId, questions };
    return {
      session_id,
      questions: questions.map(({ index, prompt, hint }) => ({ index, prompt, hint })),
      sources: chunkText(store.texts[materialId] || SAMPLE_TEXT).slice(0, 3),
      total: questions.length,
      ...DEMO_STATUS,
    };
  },

  async gradeQuizAnswer(body: { session_id: number; index: number; answer: string }) {
    await delay(100);
    const session = store.quizSessions[body.session_id];
    if (!session) throw new Error("Quiz session not found");
    const q = session.questions.find((x) => x.index === body.index);
    if (!q) throw new Error("Question not found");
    const answer = (body.answer || "").toLowerCase();
    const correct = answer.includes(q.expected.toLowerCase());
    return {
      index: body.index,
      correct,
      score: correct ? 1 : 0,
      feedback: correct
        ? "Correct — grounded in your notes."
        : `Not quite. Look for “${q.expected}” in the source passages.`,
      expected: q.expected,
      ...DEMO_STATUS,
    };
  },

  async streamGenerate(
    body: { material_id: number; task: string; question?: string },
    handlers: {
      onMeta?: (data: LlmStatus & { task: string; material_id: number }) => void;
      onSources?: (sources: SourceChunk[]) => void;
      onToken?: (text: string) => void;
      onDone?: (data: { generation_id: number; output: string }) => void;
      onError?: (message: string) => void;
    },
    signal?: AbortSignal,
  ) {
    const material = store.materials.find((m) => m.id === body.material_id);
    if (!material) {
      handlers.onError?.("Material not found");
      return;
    }
    handlers.onMeta?.({ ...DEMO_STATUS, task: body.task, material_id: body.material_id });
    const sources = chunkText(store.texts[body.material_id] || SAMPLE_TEXT).slice(0, 4);
    handlers.onSources?.(sources);

    const output = cannedOutput(body.task, body.question, material.title);
    const words = output.split(/(\s+)/);
    for (const part of words) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      handlers.onToken?.(part);
      await delay(18);
    }
    const generation_id = store.nextGenId++;
    const gen: Generation = {
      id: generation_id,
      material_id: body.material_id,
      task: body.task,
      question: body.question || null,
      output,
      sources,
      mode: "mock",
      created_at: new Date().toISOString(),
    };
    store.generations[body.material_id] = [gen, ...(store.generations[body.material_id] || [])];
    handlers.onDone?.({ generation_id, output });
  },
};
