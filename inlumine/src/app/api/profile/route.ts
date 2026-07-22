import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { DEPARTMENTS } from "@/lib/utils";

export async function PATCH(req: Request) {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  try {
    const body = await req.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: body.fullName,
        phone: body.phone || null,
      },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { alumniProfile: true, studentProfile: true },
    });

    if (dbUser?.alumniProfile) {
      await prisma.alumniProfile.update({
        where: { userId: user.id },
        data: {
          graduationYear: body.graduationYear,
          department: body.department,
          currentCompany: body.currentCompany || null,
          jobTitle: body.jobTitle || null,
          location: body.location || null,
          bio: body.bio || null,
          linkedinUrl: body.linkedinUrl || null,
          visibility: body.visibility,
        },
      });
    }

    if (dbUser?.studentProfile && DEPARTMENTS.includes(body.department)) {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: {
          department: body.department,
          enrollmentYear: body.enrollmentYear,
          bio: body.bio || null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 400 });
  }
}
