import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/features/auth/RoleProtectedRoute";

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarItem[];
  title: string;
  allowedRoles: Array<"student" | "teacher" | "admin">;
  basePath: string;
}

/**
 * A shared layout for all dashboard-based portals (Admin, Student, Tutor).
 * Consolidates the Sidebar, Topbar, and Role protection into a single source of truth.
 */
export function DashboardLayout({ children, links, title, allowedRoles, basePath }: DashboardLayoutProps) {
  return (
    <RoleProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex min-h-screen w-full bg-soft/5">
        <Sidebar items={links} basePath={basePath} />
        <div className="flex flex-1 flex-col overflow-hidden shadow-2xl shadow-indigo-500/5">
          <Topbar title={title} />
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
