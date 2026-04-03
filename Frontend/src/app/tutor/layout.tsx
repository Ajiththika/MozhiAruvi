"use client";

import React from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePathname } from "next/navigation";

const tutorLinks: SidebarItem[] = [
  { name: "Dashboard",        href: "/tutor/dashboard",  icon: "home" },
  { name: "My Blogs",         href: "/tutor/blogs",     icon: "message-square" },
  { name: "Student Requests", href: "/tutor/questions",  icon: "message-square" },
  { name: "Premium",          href: "/student/premium",  icon: "crown" },
];

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If we are on the status page, we don't want the dashboard layout or the role restriction
  // because the status page handles its own UI (Navbar/Footer) and is accessible to pending students.
  if (pathname === "/tutor/apply/status") {
    return <>{children}</>;
  }

  return (
    <DashboardLayout 
      links={tutorLinks} 
      title="Tutor Portal" 
      allowedRoles={["teacher", "tutor"]}
      basePath="/tutor/dashboard"
    >
      {children}
    </DashboardLayout>
  );
}
















