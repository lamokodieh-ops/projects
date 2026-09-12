import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center min-h-11 font-medium tracking-wide transition-[color,background-color,transform] duration-180 ease-out active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-[0.8125rem] px-6 py-2.5",
  };
  const variants = {
    primary: "bg-navy text-white hover:bg-navy-2",
    secondary: "bg-transparent text-navy border border-navy/20 hover:border-navy/40",
    ghost: "bg-transparent text-muted hover:text-navy px-0",
    danger: "bg-red text-white hover:bg-red/90",
  };

  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}) {
  const variants = {
    primary: "bg-navy text-white hover:bg-navy-2",
    secondary: "bg-transparent text-navy border border-navy/20 hover:border-navy/40",
    ghost: "bg-transparent text-muted hover:text-navy",
  };

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center min-h-11 font-medium text-[0.8125rem] tracking-wide px-6 py-2.5 transition-[color,background-color,transform] duration-180 ease-out active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
