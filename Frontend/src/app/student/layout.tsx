import React from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const studentLinks: SidebarItem[] = [
  { name: "Dashboard",     href: "/student/dashboard",  icon: "home" },
  { name: "Lessons",       href: "/student/lessons",    icon: "book-open" },
  { name: "Tutors",        href: "/tutors",             icon: "graduation-cap" },
  { name: "My Progress",   href: "/student/progress",   icon: "line-chart" },
  { name: "Settings",      href: "/student/profile",    icon: "settings" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout 
      links={studentLinks} 
      title="Student Portal" 
      allowedRoles={["student"]} 
      basePath="/student/dashboard"
    >
      {children}
    </DashboardLayout>
  );
}
