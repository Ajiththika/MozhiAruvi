import React from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const adminLinks: SidebarItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "home" },
  { name: "Users",     href: "/admin/users",     icon: "users" },
  { name: "Tutors",    href: "/admin/teachers",  icon: "graduation-cap" },
  { name: "Lessons",   href: "/admin/lessons",   icon: "book-open" },
  { name: "Blogs",     href: "/admin/blogs",     icon: "message-square" },
  { name: "Events",    href: "/admin/events",    icon: "calendar" },
  { name: "Settings",  href: "/admin/profile",   icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout 
      links={adminLinks} 
      title="Admin Portal" 
      allowedRoles={["admin"]} 
      basePath="/admin/dashboard"
    >
      {children}
    </DashboardLayout>
  );
}
