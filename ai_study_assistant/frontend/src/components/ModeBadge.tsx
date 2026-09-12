import type { LlmStatus } from "@/lib/types";

export default function ModeBadge({ status }: { status?: LlmStatus | null }) {
  if (!status) return <span className="lamp-badge">…</span>;
  const live = status.mode === "live";
  return (
    <span className={`lamp-badge ${live ? "on" : ""}`}>
      <span className="lamp-dot" aria-hidden />
      {live ? "Lamp on · live" : "Lamp dim · mock"}
    </span>
  );
}
