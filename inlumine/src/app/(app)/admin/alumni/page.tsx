import { prisma } from "@/lib/prisma";
import { Eyebrow, PageTitle, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAlumniPage() {
  const alumni = await prisma.alumniProfile.findMany({
    include: { user: { select: { fullName: true, email: true, status: true } } },
    orderBy: { graduationYear: "desc" },
  });

  return (
    <div>
      <Eyebrow>Super Admin</Eyebrow>
      <PageTitle>Alumni management</PageTitle>
      <div className="space-y-3 mt-8">
        {alumni.map((a) => (
          <Card key={a.id} padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">{a.user.fullName}</p>
                <p className="text-sm text-navy/60">
                  Class of {a.graduationYear} · {a.department}
                </p>
                <p className="text-xs text-navy/50">{a.user.email}</p>
              </div>
              <div className="flex gap-2">
                {a.isVerified ? (
                  <Badge variant="verified">✓ Verified Ɔdadeɛ</Badge>
                ) : (
                  <Badge variant="status">Unverified</Badge>
                )}
                {a.user.status === "SUSPENDED" && <Badge variant="status">Suspended</Badge>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
