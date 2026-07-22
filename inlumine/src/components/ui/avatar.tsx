import { cn } from "@/lib/cn";
import { getInitials } from "@/lib/utils";

export function Avatar({
  name,
  photo,
  size = "md",
  className,
}: {
  name: string;
  photo?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "w-8 h-8 text-[0.65rem]", md: "w-11 h-11 text-xs", lg: "w-14 h-14 text-sm" };

  if (photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        className={cn("rounded-full object-cover shrink-0 ring-1 ring-navy/10", sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full shrink-0 flex items-center justify-center font-medium text-navy/60 bg-parchment-2 ring-1 ring-navy/10",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
