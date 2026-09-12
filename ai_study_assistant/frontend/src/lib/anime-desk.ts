export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isFinePointer() {
  return typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;
}

export function canAnimate() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  return true;
}

export function setAnimatable(target: object, name: string, value: number) {
  const fn = (target as Record<string, unknown>)[name];
  if (typeof fn === "function") (fn as (v: number) => void)(value);
}
