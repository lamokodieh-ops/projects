import Link from "next/link";
import { Logo } from "./ui/logo";

export function PublicNav() {
  return (
    <nav className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-sm border-b border-navy/[0.08]">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-navy">
          <Logo size="sm" showLink={false} />
          <span className="font-display text-[0.95rem] tracking-tight">InLumine</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-[0.8125rem] text-muted hover:text-navy transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline text-[0.8125rem] font-medium text-navy border-b border-gold pb-0.5 hover:border-navy transition-colors"
          >
            Join
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-navy/[0.08] py-14 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
        <div className="flex items-end gap-4">
          <Logo size="md" showLink={false} />
          <div>
            <p className="font-display text-navy text-sm mb-1">InLumine</p>
            <p className="font-display italic text-muted text-sm">In lumine tuo videbimus lumen</p>
          </div>
        </div>
        <p className="text-[0.68rem] tracking-wide text-muted uppercase">
          PRESEC · Legon · Ghana
        </p>
      </div>
    </footer>
  );
}
