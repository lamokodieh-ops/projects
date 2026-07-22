import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, Card, SectionTitle } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { formatRelativeDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = session.user.role as Role;
  const userId = session.user.id;

  const [alumniCount, opportunityCount, connectionCount, unreadNotifications, recentAnnouncements] =
    await Promise.all([
      prisma.alumniProfile.count(),
      prisma.opportunity.count({ where: { status: "APPROVED" } }),
      prisma.connection.count({
        where: {
          status: "ACCEPTED",
          OR: [{ requesterId: userId }, { recipientId: userId }],
        },
      }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.announcement.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        include: { author: { select: { fullName: true } } },
      }),
    ]);

  const greeting =
    role === "COLLEGE_MATE"
      ? "Welcome back."
      : role === "STUDENT"
        ? "Welcome back."
        : `Welcome back, ${ROLE_LABELS[role]}.`;

  const stats = [
    { label: "Alumni", value: alumniCount, href: "/directory" },
    { label: "Opportunities", value: opportunityCount, href: "/opportunities" },
    ...(role === "COLLEGE_MATE" ? [{ label: "Connections", value: connectionCount, href: "/connections" }] : []),
    { label: "Unread", value: unreadNotifications, href: "/notifications" },
  ];

  return (
    <div>
      <PageTitle>{greeting}</PageTitle>
      <PageLede className="mb-12">
        {role === "STUDENT"
          ? "Search the alumni directory and explore opportunities."
          : role === "COLLEGE_MATE"
            ? "Your PRESEC network at a glance."
            : "Platform overview and administration."}
      </PageLede>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-navy/[0.08] border border-navy/[0.08] mb-16">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-surface p-6 hover:bg-parchment transition-colors">
            <p className="text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-3">{stat.label}</p>
            <p className="font-display text-3xl font-normal text-navy tabular-nums">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-16">
        <section>
          <SectionTitle>Quick links</SectionTitle>
          <div className="flex flex-col gap-3 items-start">
            <ButtonLink href="/directory">Browse directory</ButtonLink>
            {role === "COLLEGE_MATE" && (
              <>
                <ButtonLink href="/connections" variant="secondary">View network</ButtonLink>
                <ButtonLink href="/opportunities/new" variant="secondary">Post opportunity</ButtonLink>
              </>
            )}
            {(role === "SUPER_ADMIN" || role === "SYSTEM_USER") && (
              <ButtonLink href="/admin" variant="secondary">Admin panel</ButtonLink>
            )}
          </div>
        </section>

        <section>
          <SectionTitle>Announcements</SectionTitle>
          <div className="divide-y divide-navy/[0.08]">
            {recentAnnouncements.map((a) => (
              <article key={a.id} className="py-5 first:pt-0">
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <h3 className="text-sm text-navy">{a.title}</h3>
                  <span className="text-[0.65rem] text-muted shrink-0 tabular-nums">
                    {formatRelativeDate(a.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted line-clamp-2 leading-relaxed">{a.content}</p>
              </article>
            ))}
            {recentAnnouncements.length === 0 && (
              <p className="text-sm text-muted py-4">No announcements yet.</p>
            )}
          </div>
          <Link
            href="/college"
            className="inline-block mt-6 text-[0.8125rem] text-navy border-b border-gold/60 hover:border-navy transition-colors"
          >
            View all
          </Link>
        </section>
      </div>
    </div>
  );
}
