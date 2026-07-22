import type { LlmStatus } from "@/lib/types";

export default function ModeBadge({ status }: { status?: LlmStatus | null }) {
  if (!status) return <span className="badge">Connecting…</span>;
  const live = status.mode === "live";
  return (
    <span className={`badge ${live ? "live" : "mock"}`}>
      {live ? "Live · OpenAI" : "Mock mode · no API key"}
    </span>
  );
}