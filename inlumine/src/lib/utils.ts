import { prisma } from "./prisma";
import type { Role, Visibility } from "@prisma/client";

export async function createAuditLog(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string
) {
  await prisma.auditLog.create({
    data: { actorId, action, targetType, targetId },
  });
}

export async function createNotification(
  userId: string,
  type: "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | "OPPORTUNITY" | "PASSWORD_CHANGED" | "ACCOUNT_STATUS" | "SOCIAL" | "ANNOUNCEMENT",
  message: string,
  link?: string
) {
  await prisma.notification.create({
    data: { userId, type, message, link },
  });
}

export function visibilityFilter(viewerRole: Role, viewerId: string, connectionIds: string[]) {
  return {
    OR: [
      { visibility: "PUBLIC" as Visibility },
      ...(viewerRole === "COLLEGE_MATE" || viewerRole === "SUPER_ADMIN" || viewerRole === "SYSTEM_USER"
        ? [{ visibility: "ALUMNI_ONLY" as Visibility }]
        : []),
      {
        AND: [
          { visibility: "CONNECTIONS_ONLY" as Visibility },
          { userId: { in: connectionIds } },
        ],
      },
      { userId: viewerId },
    ],
  };
}

export const DEPARTMENTS = [
  "General Science",
  "General Arts",
  "Business",
  "Visual Arts",
  "Home Economics",
  "General Agriculture",
] as const;

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return date.toLocaleDateString("en-GH", { month: "short", day: "numeric", year: "numeric" });
}
