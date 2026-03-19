export function getRoleDashboardRoute(role: "user" | "teacher" | "admin"): string {
  switch (role) {
    case "user":
      return "/student/dashboard";
    case "teacher":
      return "/tutor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/auth/signin";
  }
}
