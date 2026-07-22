import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, SectionTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConnectButton } from "@/components/connect-button";

export default async function AlumniProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const profile = await prisma.alumniProfile.findFirst({
    where: { userId: id },
    include: { user: true },
  });

  if (!profile) notFound();

  let connectionStatus: string | null = null;
  if (session?.user && session.user.role === "COLLEGE_MATE" && session.user.id !== id) {
    const conn = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: session.user.id, recipientId: id },
          { requesterId: id, recipientId: session.user.id },
        ],
      },
    });
    connectionStatus = conn?.status ?? null;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-start gap-6 mb-12 pb-12 border-b border-navy/[0.08]">
        <Avatar name={profile.user.fullName} photo={profile.user.profilePhoto} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <PageTitle className="mb-0">{profile.user.fullName}</PageTitle>
            {profile.isVerified && <Badge variant="verified">Verified</Badge>}
          </div>
          <p className="text-muted">
            Class of {profile.graduationYear} · {profile.department}
          </p>
          {profile.jobTitle && (
            <p className="text-sm text-muted mt-2">
              {profile.jobTitle}
              {profile.currentCompany ? ` · ${profile.currentCompany}` : ""}
            </p>
          )}
          {profile.location && <p className="text-xs text-muted/70 mt-2">{profile.location}</p>}
        </div>
        {session?.user?.role === "COLLEGE_MATE" && session.user.id !== id && (
          <ConnectButton recipientId={id} initialStatus={connectionStatus} />
        )}
      </div>

      {profile.bio && (
        <section className="mb-10">
          <SectionTitle>About</SectionTitle>
          <p className="text-[0.9rem] text-navy/80 leading-relaxed">{profile.bio}</p>
        </section>
      )}

      {(profile.industry || profile.degree || profile.linkedinUrl) && (
        <section>
          <SectionTitle>Details</SectionTitle>
          <dl className="space-y-4 text-sm">
            {profile.industry && (
              <div>
                <dt className="text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-1">Industry</dt>
                <dd className="text-navy">{profile.industry}</dd>
              </div>
            )}
            {profile.degree && (
              <div>
                <dt className="text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-1">Degree</dt>
                <dd className="text-navy">{profile.degree}</dd>
              </div>
            )}
            {profile.linkedinUrl && (
              <div>
                <dt className="text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-1">LinkedIn</dt>
                <dd>
                  <a href={profile.linkedinUrl} className="text-navy border-b border-gold/60 hover:border-navy transition-colors" target="_blank" rel="noreferrer">
                    View profile
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
