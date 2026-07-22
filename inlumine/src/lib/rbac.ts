import { Role } from "@prisma/client";

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  SYSTEM_USER: "System User",
  COLLEGE_MATE: "College Mate",
  STUDENT: "Student",
};

export const PERMISSIONS = {
  manageUsers: [Role.SUPER_ADMIN],
  manageAlumni: [Role.SUPER_ADMIN],
  manageCollege: [Role.SUPER_ADMIN, Role.SYSTEM_USER],
  manageConnections: [Role.SUPER_ADMIN, Role.SYSTEM_USER],
  moderateSocial: [Role.SUPER_ADMIN, Role.SYSTEM_USER],
  manageOpportunities: [Role.SUPER_ADMIN, Role.SYSTEM_USER],
  postOpportunity: [Role.SUPER_ADMIN, Role.SYSTEM_USER, Role.COLLEGE_MATE],
  viewAnalytics: [Role.SUPER_ADMIN],
  viewDirectory: [Role.SUPER_ADMIN, Role.SYSTEM_USER, Role.COLLEGE_MATE, Role.STUDENT],
  searchAlumni: [Role.STUDENT, Role.COLLEGE_MATE, Role.SUPER_ADMIN, Role.SYSTEM_USER],
  viewOpportunities: [Role.SUPER_ADMIN, Role.SYSTEM_USER, Role.COLLEGE_MATE, Role.STUDENT],
  socialFeed: [Role.SUPER_ADMIN, Role.SYSTEM_USER, Role.COLLEGE_MATE],
  connectWithAlumni: [Role.COLLEGE_MATE],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export function isAdmin(role: Role): boolean {
  return role === Role.SUPER_ADMIN || role === Role.SYSTEM_USER;
}

export function isAlumni(role: Role): boolean {
  return role === Role.COLLEGE_MATE;
}

export function canAccessApp(role: Role): boolean {
  return Object.values(Role).includes(role);
}
