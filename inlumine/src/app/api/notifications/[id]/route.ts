import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  const { id } = await params;

  const notification = await prisma.notification.findFirst({
    where: { id, userId: user.id },
  });

  if (!notification) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
