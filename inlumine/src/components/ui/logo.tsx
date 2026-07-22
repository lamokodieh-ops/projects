import Link from "next/link";
import { cn } from "@/lib/cn";

type LogoProps = {
  size?: "sm" | "md" | "lg" | "hero";
  href?: string;
  className?: string;
  showLink?: boolean;
  variant?: "crest" | "lockup";
};

const sizes = {
  sm: "h-9 w-auto",
  md: "h-14 w-auto",
  lg: "h-20 w-auto",
  hero: "h-[180px] sm:h-[220px] w-auto",
};

export function Logo({
  size = "md",
  href = "/",
  className,
  showLink = true,
  variant = "crest",
}: LogoProps) {
  const src = variant === "lockup" ? "/presec-inlumine-logo.png" : "/presec-crest.png";
  const alt = variant === "lockup" ? "PRESEC InLumine" : "PRESEC";

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={cn(sizes[size], className)} />
  );

  if (!showLink) return img;

  return (
    <Link href={href} className="inline-flex shrink-0 items-center">
      {img}
    </Link>
  );
}
