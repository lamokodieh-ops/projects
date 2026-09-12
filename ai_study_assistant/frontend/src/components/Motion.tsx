"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { canAnimate } from "@/lib/anime-desk";

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || !canAnimate()) return;
    const items = root.querySelectorAll(":scope > *");
    if (!items.length) return;
    animate(items, {
      opacity: [0, 1],
      y: [16, 0],
      delay: stagger(75, { from: "first" }),
      duration: 620,
      ease: "out(3)",
      composition: "blend",
    });
  }, [children]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
