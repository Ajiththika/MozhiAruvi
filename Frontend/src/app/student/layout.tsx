import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

// Only plain serializable objects — no React components as values
const studentLinks: SidebarItem[] = [
  { name: "Dashboard",  href: "/student/dashboard",  icon: "home" },
  { name: "Lessons",    href: "/student/lessons",     icon: "book-open" },
  { name: "Progress",   href: "/student/progress",    icon: "line-chart" },
  { name: "Vocabulary", href: "/student/vocabulary",  icon: "library-big" },
  { name: "Tutors",         href: "/student/tutors",             icon: "graduation-cap" },
  { name: "Tutor Requests", href: "/student/tutors/my-requests", icon: "message-square" },
  { name: "Events",         href: "/student/events",             icon: "calendar" },
  { name: "Blogs",      href: "/student/blogs",       icon: "message-square" },
  { name: "Premium",    href: "/student/premium",     icon: "sparkles" },
  { name: "Profile",    href: "/student/profile",     icon: "user-circle" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["user"]}>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-50">
        <Sidebar items={studentLinks} basePath="/student/dashboard" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title="Student Portal" />
          <main className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-12 py-10 md:py-14">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-500">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}