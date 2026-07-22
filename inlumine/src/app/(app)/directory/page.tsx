import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageTitle, PageLede, EmptyState } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DirectorySearch } from "@/components/directory-search";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; year?: string; dept?: string; location?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const year = params.year ? parseInt(params.year) : undefined;
  const dept = params.dept?.trim();
  const location = params.location?.trim();

  const profiles = await prisma.alumniProfile.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { user: { fullName: { contains: q } } },
                { currentCompany: { contains: q } },
                { jobTitle: { contains: q } },
              ],
            }
          : {},
        year ? { graduationYear: year } : {},
        dept ? { department: dept } : {},
        location ? { location: { contains: location } } : {},
        session?.user?.role === "STUDENT" || session?.user?.role === "COLLEGE_MATE"
          ? { visibility: { in: ["PUBLIC", "ALUMNI_ONLY"] } }
          : {},
      ],
    },
    include: {
      user: { select: { id: true, fullName: true, profilePhoto: true, email: true } },
    },
    orderBy: [{ graduationYear: "desc" }, { user: { fullName: "asc" } }],
    take: 50,
  });

  return (
    <div>
      <PageTitle>Directory</PageTitle>
      <PageLede>Search alumni by name, year, department, or location.</PageLede>

      <DirectorySearch initial={{ q, year: params.year, dept, location }} />

      {profiles.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different search or clear your filters."
        />
      ) : (
        <ul className="divide-y divide-navy/[0.08]">
          {profiles.map((p) => (
            <li key={p.id}>
              <Link
                href={`/directory/${p.user.id}`}
                className="flex items-center gap-5 py-5 group hover:bg-parchment/50 -mx-4 px-4 transition-colors"
              >
                <Avatar name={p.user.fullName} photo={p.user.profilePhoto} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-0.5">
                    <span className="text-navy group-hover:text-navy-2 transition-colors">{p.user.fullName}</span>
                    {p.isVerified && <Badge variant="verified">Verified</Badge>}
                  </div>
                  <p className="text-sm text-muted">
                    {p.graduationYear} · {p.department}
                    {p.jobTitle && ` · ${p.jobTitle}`}
                    {p.currentCompany && `, ${p.currentCompany}`}
                  </p>
                  {p.location && <p className="text-xs text-muted/70 mt-0.5">{p.location}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
