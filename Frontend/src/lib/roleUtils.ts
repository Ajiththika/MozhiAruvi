export function getRoleDashboardRoute(role: "user" | "student" | "teacher" | "admin" | "tutor"): string {
  switch (role) {
    case "user":
    case "student":
      return "/student/dashboard";
    case "teacher":
    case "tutor":
      return "/tutor/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/auth/signin";
  }
}
