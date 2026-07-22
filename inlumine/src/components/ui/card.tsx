import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}) {
  const paddings = { none: "", sm: "p-5", md: "p-6", lg: "p-8" };
  return (
    <div
      className={cn(
        "bg-surface border border-navy/[0.08]",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[0.68rem] tracking-[0.14em] uppercase text-muted mb-3", className)}>
      {children}
    </p>
  );
}

export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "font-display font-normal text-[clamp(1.75rem,3vw,2.25rem)] text-navy tracking-tight mb-3",
        className
      )}
    >
      {children}
    </h1>
  );
}

export function PageLede({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[0.95rem] text-muted max-w-xl mb-10 leading-relaxed", className)}>{children}</p>;
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("font-display text-[1.05rem] font-normal text-navy mb-5 tracking-tight", className)}>
      {children}
    </h2>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-20 px-8 border border-navy/[0.08] bg-surface">
      <h3 className="font-display text-navy text-base mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-sm mx-auto mb-8 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
