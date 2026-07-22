import { prisma } from "@/lib/prisma";
import { Eyebrow, PageTitle, Card } from "@/components/ui/card";

export default async function AdminAnalyticsPage() {
  const [
    totalUsers,
    alumniCount,
    studentCount,
    opportunitiesApproved,
    connectionsAccepted,
    postsCount,
    usersByMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "COLLEGE_MATE" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.opportunity.count({ where: { status: "APPROVED" } }),
    prisma.connection.count({ where: { status: "ACCEPTED" } }),
    prisma.socialPost.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
    }),
  ]);

  const deptStats = await prisma.alumniProfile.groupBy({
    by: ["department"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return (
    <div>
      <Eyebrow>Super Admin</Eyebrow>
      <PageTitle>Analytics</PageTitle>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mb-10">
        {[
          { label: "Total users", value: totalUsers },
          { label: "Alumni", value: alumniCount },
          { label: "Students", value: studentCount },
          { label: "Approved opportunities", value: opportunitiesApproved },
          { label: "Accepted connections", value: connectionsAccepted },
          { label: "Social posts", value: postsCount },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="font-mono text-xs uppercase text-navy/50 mb-1">{s.label}</p>
            <p className="font-display text-3xl font-semibold text-navy">{s.value}</p>
          </Card>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="font-display font-semibold text-navy mb-4">Users by role</h2>
        <div className="space-y-2">
          {usersByMonth.map((r) => (
            <div key={r.role} className="flex justify-between text-sm py-2 border-b border-navy/8">
              <span className="text-navy">{r.role.replace("_", " ")}</span>
              <span className="font-mono text-navy/60">{r._count.id}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display font-semibold text-navy mb-4">Alumni by department</h2>
        <div className="space-y-2">
          {deptStats.map((d) => (
            <div key={d.department} className="flex justify-between text-sm py-2 border-b border-navy/8">
              <span className="text-navy">{d.department}</span>
              <span className="font-mono text-navy/60">{d._count.id}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
