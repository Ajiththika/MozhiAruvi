import React from "react";
import { Sidebar, SidebarItem } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { RoleProtectedRoute } from "@/components/features/auth/RoleProtectedRoute";
import { UserRole } from "@/types/user";

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarItem[];
  title: string;
  allowedRoles: UserRole[];
  basePath: string;
}

export function DashboardLayout({
  children,
  links,
  title,
  allowedRoles,
  basePath,
}: DashboardLayoutProps) {
  return (
    <RoleProtectedRoute allowedRoles={allowedRoles as any}>
      <div className="flex min-h-screen w-full bg-soft/5 dark:bg-white font-sans">
        <Sidebar items={links} basePath={basePath} />
        <div className="flex flex-1 flex-col overflow-hidden">
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
