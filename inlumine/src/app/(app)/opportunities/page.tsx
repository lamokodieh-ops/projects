import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, EmptyState } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";
import type { Role } from "@prisma/client";

const TYPE_LABELS: Record<string, string> = {
  JOB: "Job",
  INTERNSHIP: "Internship",
  MENTORSHIP: "Mentorship",
  EVENT: "Event",
};

export default async function OpportunitiesPage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role as Role | undefined;

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: role === "SUPER_ADMIN" || role === "SYSTEM_USER" ? undefined : "APPROVED",
    },
    include: { poster: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const canPost = role && hasPermission(role, "postOpportunity");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-3">
        <PageTitle className="mb-0">Opportunities</PageTitle>
        {canPost && <ButtonLink href="/opportunities/new">Post</ButtonLink>}
      </div>
      <PageLede>Jobs, internships, mentorships, and events from the PRESEC community.</PageLede>

      {opportunities.length === 0 ? (
        <EmptyState
          title="Nothing posted yet"
          description={canPost ? "Share the first opportunity with fellow alumni." : "Check back soon."}
          action={canPost ? <ButtonLink href="/opportunities/new">Post opportunity</ButtonLink> : undefined}
        />
      ) : (
        <ul className="divide-y divide-navy/[0.08]">
          {opportunities.map((o) => (
            <li key={o.id}>
              <Link href={`/opportunities/${o.id}`} className="block py-6 group hover:bg-parchment/50 -mx-4 px-4 transition-colors">
                <div className="flex flex-wrap items-baseline gap-3 mb-2">
                  <Badge variant="dept">{TYPE_LABELS[o.type]}</Badge>
                  {o.status !== "APPROVED" && <Badge variant="status">{o.status.toLowerCase()}</Badge>}
                  {o.department && <Badge variant="status">{o.department}</Badge>}
                </div>
                <h3 className="font-display text-navy text-base mb-1">{o.title}</h3>
                {o.company && <p className="text-sm text-muted">{o.company}{o.location ? ` · ${o.location}` : ""}</p>}
                <p className="text-sm text-muted/80 mt-2 line-clamp-2 leading-relaxed">{o.description}</p>
                <p className="text-[0.65rem] text-muted/60 mt-3 tabular-nums">{formatRelativeDate(o.createdAt)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
