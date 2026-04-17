export function getRoleDashboardRoute(role: string, tutorStatus?: string): string {
  if (tutorStatus === 'pending') return "/tutor/apply/status";
  
  switch (role) {
    case "student":
      return "/student/dashboard";
    case "teacher":
    case "tutor":
      return "/tutor/dashboard";
    case "tutor_pending":
    case "rejected":
      return "/tutor/apply/status";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/student/dashboard";
  }
}

