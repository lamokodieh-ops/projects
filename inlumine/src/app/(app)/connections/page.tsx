import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, EmptyState, SectionTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { ConnectionActions } from "@/components/connection-actions";

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const userId = session.user.id;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    include: {
      requester: {
        select: { id: true, fullName: true, profilePhoto: true, alumniProfile: true },
      },
      recipient: {
        select: { id: true, fullName: true, profilePhoto: true, alumniProfile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = connections.filter((c) => c.status === "PENDING" && c.recipientId === userId);
  const accepted = connections.filter((c) => c.status === "ACCEPTED");
  const sent = connections.filter((c) => c.status === "PENDING" && c.requesterId === userId);

  return (
    <div>
      <PageTitle>Network</PageTitle>
      <PageLede>
        {session.user.role === "STUDENT"
          ? "Browse alumni profiles from the directory."
          : "Your connections with fellow PRESEC alumni."}
      </PageLede>

      {session.user.role === "COLLEGE_MATE" && pending.length > 0 && (
        <section className="mb-14">
          <SectionTitle>Pending</SectionTitle>
          <ul className="divide-y divide-navy/[0.08]">
            {pending.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div className="flex items-center gap-4">
                  <Avatar name={c.requester.fullName} photo={c.requester.profilePhoto} />
                  <div>
                    <Link href={`/directory/${c.requester.id}`} className="text-navy hover:opacity-70 transition-opacity">
                      {c.requester.fullName}
                    </Link>
                    {c.requester.alumniProfile && (
                      <p className="text-sm text-muted">Class of {c.requester.alumniProfile.graduationYear}</p>
                    )}
                  </div>
                </div>
                <ConnectionActions connectionId={c.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {session.user.role === "COLLEGE_MATE" && (
        <section>
          <SectionTitle>Connections ({accepted.length})</SectionTitle>
          {accepted.length === 0 ? (
            <EmptyState
              title="No connections yet"
              description="Find classmates in the directory and send a connection request."
              action={<ButtonLink href="/directory">Browse directory</ButtonLink>}
            />
          ) : (
            <ul className="divide-y divide-navy/[0.08]">
              {accepted.map((c) => {
                const other = c.requesterId === userId ? c.recipient : c.requester;
                return (
                  <li key={c.id}>
                    <Link
                      href={`/directory/${other.id}`}
                      className="flex items-center gap-4 py-5 hover:bg-parchment/50 -mx-4 px-4 transition-colors"
                    >
                      <Avatar name={other.fullName} photo={other.profilePhoto} />
                      <div>
                        <p className="text-navy">{other.fullName}</p>
                        {other.alumniProfile && (
                          <p className="text-sm text-muted">
                            {other.alumniProfile.graduationYear} · {other.alumniProfile.department}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {sent.length > 0 && (
            <p className="text-sm text-muted mt-8">
              {sent.length} sent request{sent.length !== 1 ? "s" : ""} pending
            </p>
          )}
        </section>
      )}

      {session.user.role === "STUDENT" && (
        <EmptyState
          title="Browse the directory"
          description="Search alumni by year, department, or company."
          action={<ButtonLink href="/directory">Search alumni</ButtonLink>}
        />
      )}
    </div>
  );
}
