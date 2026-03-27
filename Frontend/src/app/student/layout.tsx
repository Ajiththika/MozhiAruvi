import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/features/auth/RoleProtectedRoute";

// Only plain serializable objects — no React components as values
const studentLinks: SidebarItem[] = [
  { name: "Dashboard",     href: "/student/dashboard",  icon: "home" },
  { name: "Lessons",       href: "/student/lessons",    icon: "book-open" },
  { name: "Tutors",        href: "/tutors",             icon: "graduation-cap" },
  { name: "My Progress",   href: "/student/progress",   icon: "line-chart" },
  { name: "Settings",      href: "/student/profile",    icon: "settings" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["student", "user"] as any}>
      <div className="flex min-h-screen w-full bg-soft/5 dark:bg-white">
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
