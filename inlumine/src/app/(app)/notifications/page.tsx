import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, EmptyState } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";
import { MarkReadButton } from "@/components/mark-read-button";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="max-w-xl">
      <PageTitle>Inbox</PageTitle>
      <PageLede>Connection requests, opportunities, and account updates.</PageLede>

      {notifications.length === 0 ? (
        <EmptyState title="All caught up" description="No new notifications." />
      ) : (
        <ul className="divide-y divide-navy/[0.08]">
          {notifications.map((n) => (
            <li key={n.id} className={`py-5 flex justify-between gap-4 ${n.isRead ? "opacity-50" : ""}`}>
              <div>
                <p className="text-sm text-navy/85 leading-relaxed">{n.message}</p>
                <p className="text-[0.65rem] text-muted mt-2 tabular-nums">{formatRelativeDate(n.createdAt)}</p>
                {n.link && (
                  <Link href={n.link} className="inline-block mt-3 text-[0.8125rem] text-navy border-b border-gold/60 hover:border-navy transition-colors">
                    View
                  </Link>
                )}
              </div>
              {!n.isRead && <MarkReadButton id={n.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
