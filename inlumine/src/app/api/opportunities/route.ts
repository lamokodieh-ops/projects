import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/lib/api-auth";

export async function GET() {
  const { error, user } = await requireAuth();
  if (error || !user) return error!;

  const isAdmin = user.role === "SUPER_ADMIN" || user.role === "SYSTEM_USER";

  const opportunities = await prisma.opportunity.findMany({
    where: isAdmin ? undefined : { status: "APPROVED" },
    include: { poster: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(opportunities);
}

const postSchema = z.object({
  type: z.enum(["JOB", "INTERNSHIP", "MENTORSHIP", "EVENT"]),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  company: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
});

export async function POST(req: Request) {
  const { error, user } = await requirePermission("postOpportunity");
  if (error || !user) return error!;

  try {
    const data = postSchema.parse(await req.json());
    const isAdmin = user.role === "SUPER_ADMIN" || user.role === "SYSTEM_USER";

    const opportunity = await prisma.opportunity.create({
      data: {
        ...data,
        postedBy: user.id,
        status: isAdmin ? "APPROVED" : "PENDING",
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 });
  }
}
