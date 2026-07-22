import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, SectionTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

export default async function CollegePage() {
  const college = await prisma.college.findFirst({
    include: {
      departments: { orderBy: { name: "asc" } },
      announcements: {
        orderBy: { createdAt: "desc" },
        include: { author: { select: { fullName: true } } },
      },
    },
  });

  if (!college) {
    return <p className="text-muted">College data not loaded. Run the seed script.</p>;
  }

  return (
    <div>
      <PageTitle>College</PageTitle>
      <PageLede>{college.description}</PageLede>

      <div className="grid lg:grid-cols-2 gap-16">
        <section>
          <SectionTitle>Departments</SectionTitle>
          <ul className="space-y-2">
            {college.departments.map((d) => (
              <li key={d.id} className="text-sm text-navy/80 border-b border-navy/[0.06] pb-2">
                {d.name}
              </li>
            ))}
          </ul>
          {college.location && (
            <p className="text-xs text-muted mt-8">
              {college.location}
              {college.establishedYear ? ` · Est. ${college.establishedYear}` : ""}
            </p>
          )}
        </section>

        <section>
          <SectionTitle>Announcements</SectionTitle>
          <div className="divide-y divide-navy/[0.08]">
            {college.announcements.map((a) => (
              <article key={a.id} className="py-5 first:pt-0">
                <div className="flex items-baseline justify-between gap-4 mb-1">
                  <h3 className="text-sm text-navy">{a.title}</h3>
                  <span className="text-[0.65rem] text-muted shrink-0 tabular-nums">
                    {formatRelativeDate(a.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{a.content}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
