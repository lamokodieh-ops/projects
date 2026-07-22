import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/lib/utils";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.enum(["COLLEGE_MATE", "STUDENT"]),
  graduationYear: z.number().optional(),
  enrollmentYear: z.number().optional(),
  department: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    if (!DEPARTMENTS.includes(data.department as (typeof DEPARTMENTS)[number])) {
      return NextResponse.json({ error: "Invalid department." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    if (data.role === "COLLEGE_MATE") {
      if (!data.graduationYear) {
        return NextResponse.json({ error: "Graduation year is required for alumni." }, { status: 400 });
      }
      await prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "COLLEGE_MATE",
          alumniProfile: {
            create: {
              graduationYear: data.graduationYear,
              department: data.department,
            },
          },
        },
      });
    } else {
      await prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          passwordHash,
          role: "STUDENT",
          studentProfile: {
            create: {
              department: data.department,
              enrollmentYear: data.enrollmentYear ?? new Date().getFullYear(),
            },
          },
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
