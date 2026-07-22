import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { authOptions } from "./auth";
import { hasPermission, type Permission } from "./rbac";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  if (user.status === "SUSPENDED") {
    return { error: NextResponse.json({ error: "Account suspended" }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export async function requirePermission(permission: Permission) {
  const { error, user } = await requireAuth();
  if (error || !user) return { error: error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  if (!hasPermission(user.role as Role, permission)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export async function requireRoles(roles: Role[]) {
  const { error, user } = await requireAuth();
  if (error || !user) return { error: error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  if (!roles.includes(user.role as Role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }
  return { error: null, user };
}
