"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { canAnimate } from "@/lib/anime-desk";
import type { LlmStatus } from "@/lib/types";

export default function ModeBadge({ status }: { status?: LlmStatus | null }) {
  const dotRef = useRef<HTMLSpanElement>(null);
  const live = status?.mode === "live";

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot || !live || !canAnimate()) return;
    const pulse = animate(dot, {
      scale: [1, 1.35, 1],
      opacity: [1, 0.55, 1],
      duration: 1600,
      ease: "inOutSine",
      loop: true,
    });
    return () => {
      pulse.pause();
    };
  }, [live]);

  if (!status) return <span className="lamp-badge">…</span>;
  return (
    <span className={`lamp-badge ${live ? "on" : ""}`}>
      <span className="lamp-dot" ref={dotRef} aria-hidden />
      {live ? "Lamp on · live" : "Lamp dim · mock"}
    </span>
  );
}
