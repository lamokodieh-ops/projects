import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";

const schema = z.object({ action: z.enum(["approve", "close"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, user } = await requirePermission("manageOpportunities");
  if (error || !user) return error!;

  const { id } = await params;

  try {
    const { action } = schema.parse(await req.json());
    const status = action === "approve" ? "APPROVED" : "CLOSED";

    const updated = await prisma.opportunity.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
