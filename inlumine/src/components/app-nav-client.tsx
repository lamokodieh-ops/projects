"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Logo } from "./ui/logo";
import { cn } from "@/lib/cn";

type NavLink = { href: string; label: string };

export function AppNavClient({ links, userName }: { links: NavLink[]; userName: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-sm border-b border-navy/[0.08]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 gap-6">
          <Link href="/dashboard" className="flex items-center gap-3 text-navy shrink-0">
            <Logo size="sm" showLink={false} />
            <span className="font-display text-[0.95rem] tracking-tight hidden sm:inline">InLumine</span>
          </Link>

          <div className="flex items-center gap-5 overflow-x-auto scrollbar-none">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[0.8125rem] whitespace-nowrap transition-colors pb-0.5 border-b",
                  pathname.startsWith(link.href)
                    ? "text-navy border-gold"
                    : "text-muted border-transparent hover:text-navy"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/profile"
              className="text-[0.8125rem] text-muted hover:text-navy hidden md:inline truncate max-w-[100px]"
            >
              {userName.split(" ")[0]}
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-[0.68rem] tracking-wide uppercase text-muted hover:text-navy transition-colors"
            >
              Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
