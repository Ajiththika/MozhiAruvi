export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  USER: 'user', // Backward compatibility for any 'user' role left in tokens
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export function hasPermission(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  
  // Mapping 'user' to 'student' internally for permissions
  const effectiveRole = userRole === 'user' ? ROLES.STUDENT : userRole;
  
  return allowedRoles.includes(effectiveRole as UserRole);
}
