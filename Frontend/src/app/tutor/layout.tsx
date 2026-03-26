import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/features/auth/RoleProtectedRoute";

const tutorLinks: SidebarItem[] = [
  { name: "Dashboard",        href: "/tutor/dashboard",  icon: "home" },
  { name: "Student Requests", href: "/tutor/questions",  icon: "message-square" },
  { name: "Schedule",  href: "/tutor/schedule",   icon: "calendar-days" },
  { name: "Events",    href: "/events",           icon: "calendar" },
  { name: "Profile",   href: "/tutor/profile",    icon: "user-circle" },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex min-h-screen w-full bg-soft/5 dark:bg-white">
        <Sidebar items={tutorLinks} basePath="/tutor/dashboard" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title="Tutor Portal" />
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
