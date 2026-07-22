import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";
import { PageTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { alumniProfile: true, studentProfile: true },
  });

  if (!user) return null;

  return (
    <div className="max-w-md">
      <PageTitle>Profile</PageTitle>
      <ProfileForm user={user} />
    </div>
  );
}
