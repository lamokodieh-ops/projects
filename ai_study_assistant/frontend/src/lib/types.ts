export type LlmStatus = {
  mode: "live" | "mock";
  embedding_provider: string;
  chat_model: string;
  embed_model: string;
};

export type Material = {
  id: number;
  title: string;
  source_type: string;
  filename?: string | null;
  char_count: number;
  chunk_count: number;
  created_at: string;
};

export type SourceChunk = {
  id: number;
  text: string;
  score: number;
};

export type Generation = {
  id: number;
  material_id: number;
  task: string;
  question?: string | null;
  output: string;
  sources: SourceChunk[];
  mode: string;
  created_at: string;
};

export type Task = "explain" | "quiz" | "summary";