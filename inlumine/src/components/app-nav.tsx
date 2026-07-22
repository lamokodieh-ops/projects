import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { AppNavClient } from "./app-nav-client";

export async function AppNav() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const role = session.user.role as Role;
  const links = [
    { href: "/dashboard", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/connections", label: "Network", show: hasPermission(role, "connectWithAlumni") || role === "STUDENT" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/social", label: "Feed", show: hasPermission(role, "socialFeed") },
    { href: "/college", label: "College" },
    { href: "/notifications", label: "Inbox" },
    { href: "/admin", label: "Admin", show: role === "SUPER_ADMIN" || role === "SYSTEM_USER" },
  ].filter((l) => l.show !== false);

  return <AppNavClient links={links} userName={session.user.name ?? "User"} />;
}
