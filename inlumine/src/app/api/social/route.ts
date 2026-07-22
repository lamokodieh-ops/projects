import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

export async function GET() {
  const { error, user } = await requirePermission("socialFeed");
  if (error || !user) return error!;

  const posts = await prisma.socialPost.findMany({
    include: {
      author: { select: { fullName: true, profilePhoto: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

const schema = z.object({ content: z.string().min(1).max(2000) });

export async function POST(req: Request) {
  const { error, user } = await requirePermission("socialFeed");
  if (error || !user) return error!;

  try {
    const { content } = schema.parse(await req.json());
    const post = await prisma.socialPost.create({
      data: { authorId: user.id, content },
    });
    return NextResponse.json(post, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
}
