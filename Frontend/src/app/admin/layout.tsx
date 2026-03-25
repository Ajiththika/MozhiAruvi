import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/auth/RoleProtectedRoute";

const adminLinks: SidebarItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "home" },
  { name: "Users",     href: "/admin/users",     icon: "users" },
  { name: "Teachers",  href: "/admin/teachers",  icon: "graduation-cap" },
  { name: "Lessons",   href: "/admin/lessons",   icon: "book-open" },
  { name: "Events",    href: "/admin/events",    icon: "calendar" },
  { name: "Blogs",     href: "/admin/blogs",     icon: "message-square" },
  { name: "Settings",  href: "/admin/settings",  icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen w-full bg-soft/5 dark:bg-white">
        <Sidebar items={adminLinks} basePath="/admin/dashboard" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar title="Admin Portal" />
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