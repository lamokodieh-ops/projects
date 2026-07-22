import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OpportunityModeration } from "@/components/opportunity-moderation";

const TYPE_LABELS: Record<string, string> = {
  JOB: "Job",
  INTERNSHIP: "Internship",
  MENTORSHIP: "Mentorship",
  EVENT: "Event",
};

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { poster: { select: { fullName: true, id: true } } },
  });

  if (!opportunity) notFound();
  if (
    opportunity.status !== "APPROVED" &&
    session?.user?.role !== "SUPER_ADMIN" &&
    session?.user?.role !== "SYSTEM_USER" &&
    opportunity.postedBy !== session?.user?.id
  ) {
    notFound();
  }

  const isAdmin = session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "SYSTEM_USER";

  return (
    <div className="max-w-2xl">
      <p className="text-[0.68rem] tracking-[0.14em] uppercase text-muted mb-4">
        {TYPE_LABELS[opportunity.type]}
      </p>
      <PageTitle>{opportunity.title}</PageTitle>
      <div className="flex flex-wrap gap-2 mb-10">
        {opportunity.company && <Badge variant="dept">{opportunity.company}</Badge>}
        {opportunity.location && <Badge variant="status">{opportunity.location}</Badge>}
        {opportunity.department && <Badge variant="status">{opportunity.department}</Badge>}
        {opportunity.status !== "APPROVED" && (
          <Badge variant="status">{opportunity.status.toLowerCase()}</Badge>
        )}
      </div>

      <div className="mb-12 pb-12 border-b border-navy/[0.08]">
        <p className="text-[0.9rem] text-navy/85 leading-relaxed whitespace-pre-wrap">{opportunity.description}</p>
        {opportunity.deadline && (
          <p className="text-xs text-muted mt-8 tabular-nums">
            Deadline · {opportunity.deadline.toLocaleDateString("en-GH")}
          </p>
        )}
        <p className="text-xs text-muted mt-4">Posted by {opportunity.poster.fullName}</p>
      </div>

      {isAdmin && opportunity.status === "PENDING" && (
        <OpportunityModeration opportunityId={opportunity.id} />
      )}

      <Link href="/opportunities" className="text-[0.8125rem] text-navy border-b border-gold/60 hover:border-navy transition-colors">
        Back
      </Link>
    </div>
  );
}
