export function getRoleDashboardRoute(role: "user" | "student" | "teacher" | "admin"): string {
  switch (role) {
    case "user":
    case "student":
      return "/student/dashboard";
    case "teacher":
      return "/tutor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/auth/signin";
  }
}
