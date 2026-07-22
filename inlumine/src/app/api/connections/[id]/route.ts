import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { createNotification } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  connectionId: z.string(),
  action: z.enum(["accept", "decline"]),
});

export async function PATCH(req: Request) {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  try {
    const { connectionId, action } = schema.parse(await req.json());

    const connection = await prisma.connection.findUnique({ where: { id: connectionId } });
    if (!connection || connection.recipientId !== user.id) {
      return NextResponse.json({ error: "Connection not found." }, { status: 404 });
    }

    const status = action === "accept" ? "ACCEPTED" : "DECLINED";
    const updated = await prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    });

    if (action === "accept") {
      await createNotification(
        connection.requesterId,
        "CONNECTION_ACCEPTED",
        `${user.name} accepted your connection request.`,
        "/connections"
      );
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
