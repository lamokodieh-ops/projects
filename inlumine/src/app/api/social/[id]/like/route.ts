import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requirePermission("socialFeed");
  if (error || !user) return error!;

  const { id: postId } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.postLike.create({ data: { postId, userId: user.id } });
  }

  const count = await prisma.postLike.count({ where: { postId } });
  const liked = !existing;

  return NextResponse.json({ liked, count });
}
