import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

const tutorLinks: SidebarItem[] = [
  { name: "Dashboard",        href: "/tutor/dashboard",  icon: "home" },
  { name: "Student Requests", href: "/tutor/questions",  icon: "message-square" },
  { name: "Schedule",  href: "/tutor/schedule",   icon: "calendar-days" },
  { name: "Events",    href: "/tutor/events",     icon: "calendar" },
  { name: "Profile",   href: "/tutor/profile",    icon: "user-circle" },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["teacher"]}>
      <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-50">
        <Sidebar items={tutorLinks} basePath="/tutor/dashboard" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title="Tutor Portal" />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-in fade-in zoom-in-95 duration-300">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}