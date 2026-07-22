import { prisma } from "@/lib/prisma";
import { Eyebrow, PageTitle, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { UserActions } from "@/components/user-actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { alumniProfile: true, studentProfile: true },
  });

  return (
    <div>
      <Eyebrow>Super Admin</Eyebrow>
      <PageTitle>User management</PageTitle>
      <div className="space-y-3 mt-8">
        {users.map((u) => (
          <Card key={u.id} padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-navy">{u.fullName}</p>
                  <Badge variant="status">{ROLE_LABELS[u.role as Role]}</Badge>
                  {u.status === "SUSPENDED" && <Badge variant="verified">Suspended</Badge>}
                </div>
                <p className="text-sm text-navy/60">{u.email}</p>
                {u.alumniProfile && (
                  <p className="text-xs text-navy/50 mt-1">
                    Class of {u.alumniProfile.graduationYear} · {u.alumniProfile.department}
                    {u.alumniProfile.isVerified ? " · Verified" : ""}
                  </p>
                )}
              </div>
              <UserActions userId={u.id} role={u.role} status={u.status} isVerified={u.alumniProfile?.isVerified} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
