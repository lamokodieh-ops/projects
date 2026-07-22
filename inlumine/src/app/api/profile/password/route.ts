import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { createNotification } from "@/lib/utils";

const schema = z.object({
  current: z.string().min(1),
  next: z.string().min(8),
});

export async function PATCH(req: Request) {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  try {
    const { current, next } = schema.parse(await req.json());

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const valid = await bcrypt.compare(current, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "That password doesn't match. Try again." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(next, 12) },
    });

    await createNotification(user.id, "PASSWORD_CHANGED", "Your password was changed.", "/profile");

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
}
