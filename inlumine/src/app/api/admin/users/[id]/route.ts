import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { createAuditLog, createNotification } from "@/lib/utils";

const schema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  verifyAlumni: z.boolean().optional(),
  role: z.enum(["SUPER_ADMIN", "SYSTEM_USER", "COLLEGE_MATE", "STUDENT"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requirePermission("manageUsers");
  if (error || !user) return error!;

  const { id } = await params;
  let body: z.infer<typeof schema>;
  try {
    body = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }

  if (body.status) {
    await prisma.user.update({
      where: { id },
      data: { status: body.status },
    });
    await createNotification(
      id,
      "ACCOUNT_STATUS",
      `Your account status changed to ${body.status.toLowerCase()}.`,
      "/profile"
    );
    await createAuditLog(user.id, `USER_STATUS_${body.status}`, "User", id);
  }

  if (body.verifyAlumni) {
    await prisma.alumniProfile.updateMany({
      where: { userId: id },
      data: { isVerified: true },
    });
    await createAuditLog(user.id, "VERIFY_ALUMNI", "User", id);
  }

  if (body.role) {
    await prisma.user.update({
      where: { id },
      data: { role: body.role },
    });
    await createAuditLog(user.id, `ROLE_CHANGE_${body.role}`, "User", id);
  }

  return NextResponse.json({ ok: true });
}
