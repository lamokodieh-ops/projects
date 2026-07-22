import { PublicNav, PublicFooter } from "@/components/public-nav";
import { Logo } from "@/components/ui/logo";
import { ButtonLink } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      <header className="flex-1 flex flex-col justify-center px-6 pt-12 pb-20 md:pt-16 md:pb-28">
        <div className="max-w-2xl mx-auto text-center">
          <Logo size="hero" showLink={false} className="mx-auto mb-8" />
          <p className="font-display text-[clamp(1.75rem,4vw,2.5rem)] text-navy tracking-tight mb-2">
            InLumine
          </p>
          <p className="text-[0.68rem] tracking-[0.16em] uppercase text-muted mb-6">
            Presbyterian Boys&apos; Senior High School · Legon
          </p>
          <p className="font-display italic text-muted text-lg md:text-xl mb-4">
            In thy light we shall see light
          </p>
          <p className="text-[0.9rem] text-muted leading-relaxed max-w-md mx-auto mb-12">
            The alumni network for PRESEC — where Ɔdadeɛ past and present stay connected.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ButtonLink href="/register">Join the network</ButtonLink>
            <ButtonLink href="/login" variant="secondary">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="border-t border-navy/[0.08] py-20 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-12 md:gap-8">
          {[
            { title: "Directory", body: "Find alumni by year, department, or company." },
            { title: "Connections", body: "Stay in touch with classmates across graduating classes." },
            { title: "Opportunities", body: "Jobs, internships, and mentorship from Ɔdadeɛ." },
          ].map((item) => (
            <article key={item.title}>
              <h2 className="font-display text-navy text-base mb-2">{item.title}</h2>
              <p className="text-sm text-muted leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
