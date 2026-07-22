import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/api-auth";
import { createNotification } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ requesterId: user.id }, { recipientId: user.id }],
    },
    include: {
      requester: { select: { id: true, fullName: true, profilePhoto: true } },
      recipient: { select: { id: true, fullName: true, profilePhoto: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(connections);
}

const postSchema = z.object({ recipientId: z.string() });

export async function POST(req: Request) {
  const { error, user } = await requirePermission("connectWithAlumni");
  if (error || !user) return error!;

  try {
    const { recipientId } = postSchema.parse(await req.json());
    if (recipientId === user.id) {
      return NextResponse.json({ error: "Cannot connect with yourself." }, { status: 400 });
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { requesterId: user.id, recipientId },
          { requesterId: recipientId, recipientId: user.id },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Connection already exists." }, { status: 409 });
    }

    const connection = await prisma.connection.create({
      data: { requesterId: user.id, recipientId, status: "PENDING" },
    });

    await createNotification(
      recipientId,
      "CONNECTION_REQUEST",
      `${user.name} sent you a connection request.`,
      "/connections"
    );

    return NextResponse.json(connection, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
