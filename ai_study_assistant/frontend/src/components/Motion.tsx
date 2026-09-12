"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { motionConfig } from "@/lib/motion-config";
import { springs } from "@/lib/motion-tokens";
import { useSafeMotion } from "@/hooks/use-reduced-motion";

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

export function StaggerList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!motionConfig.shouldAnimate() || !mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerContainer} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const safe = useSafeMotion();

  if (!motionConfig.shouldAnimate()) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: safe.initial,
        visible: { ...safe.animate, transition: springs.gentle },
      }}
    >
      {children}
    </motion.div>
  );
}
