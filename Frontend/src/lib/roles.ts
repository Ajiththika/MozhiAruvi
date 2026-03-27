export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export function hasPermission(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  
  return allowedRoles.includes(userRole as UserRole);
}
