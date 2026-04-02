import React from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const tutorLinks: SidebarItem[] = [
  { name: "Dashboard",        href: "/tutor/dashboard",  icon: "home" },
  { name: "My Blogs",         href: "/tutor/blogs",     icon: "message-square" },
  { name: "Student Requests", href: "/tutor/questions",  icon: "message-square" },
  { name: "Premium",          href: "/student/premium",  icon: "crown" },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout 
      links={tutorLinks} 
      title="Tutor Portal" 
      allowedRoles={["teacher"]}
      basePath="/tutor/dashboard"
    >
      {children}
    </DashboardLayout>
  );
}
















