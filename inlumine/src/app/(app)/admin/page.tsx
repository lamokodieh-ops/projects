import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, SectionTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";

  const [userCount, alumniCount, pendingOpps, recentAudit] = await Promise.all([
    prisma.user.count(),
    prisma.alumniProfile.count(),
    prisma.opportunity.count({ where: { status: "PENDING" } }),
    prisma.auditLog.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { actor: { select: { fullName: true } } } }),
  ]);

  const links = [
    ...(isSuperAdmin
      ? [
          { href: "/admin/users", label: "Users", desc: "Accounts and roles" },
          { href: "/admin/alumni", label: "Alumni", desc: "Verification and records" },
          { href: "/admin/analytics", label: "Analytics", desc: "Platform activity" },
        ]
      : []),
    { href: "/admin/college", label: "College", desc: "Departments and news" },
    { href: "/opportunities", label: "Opportunities", desc: `${pendingOpps} pending review` },
  ];

  return (
    <div>
      <PageTitle>Admin</PageTitle>
      <PageLede>Manage PRESEC alumni data and platform content.</PageLede>

      <div className="grid grid-cols-3 gap-px bg-navy/[0.08] border border-navy/[0.08] mb-16">
        {[
          { label: "Users", value: userCount },
          { label: "Alumni", value: alumniCount },
          { label: "Pending", value: pendingOpps },
        ].map((s) => (
          <div key={s.label} className="bg-surface p-6">
            <p className="text-[0.68rem] tracking-[0.12em] uppercase text-muted mb-3">{s.label}</p>
            <p className="font-display text-3xl font-normal text-navy tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-px bg-navy/[0.08] border border-navy/[0.08] mb-16">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="bg-surface p-6 hover:bg-parchment transition-colors">
            <h3 className="font-display text-navy text-sm mb-1">{link.label}</h3>
            <p className="text-xs text-muted">{link.desc}</p>
          </Link>
        ))}
      </div>

      <section>
        <SectionTitle>Audit log</SectionTitle>
        <ul className="divide-y divide-navy/[0.08]">
          {recentAudit.map((log) => (
            <li key={log.id} className="py-3 flex gap-6 text-sm">
              <span className="text-[0.65rem] text-muted shrink-0 tabular-nums w-20">
                {log.createdAt.toLocaleDateString("en-GH")}
              </span>
              <span className="text-navy/75">{log.actor.fullName} — {log.action}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
