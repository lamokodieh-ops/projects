import { cn } from "@/lib/cn";

export function Badge({
  children,
  variant = "dept",
  className,
}: {
  children: React.ReactNode;
  variant?: "verified" | "dept" | "status";
  className?: string;
}) {
  const variants = {
    verified: "text-gold-dark border border-gold-dark/40",
    dept: "text-navy/70 border border-navy/12",
    status: "text-muted border border-navy/8",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center text-[0.68rem] tracking-wide uppercase px-2 py-0.5",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
