"use client";

import React from "react";
import { SidebarItem } from "@/components/layout/Sidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

// Only plain serializable objects — no React components as values
export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isPremium = user?.subscription?.plan && ["PRO", "PREMIUM", "BUSINESS"].includes(user.subscription.plan);

  const studentLinks: SidebarItem[] = [
    { name: "Dashboard",     href: "/student/dashboard",  icon: "home" },
    { name: "Lessons",       href: "/student/lessons",    icon: "book-open" },
    { name: "Teachers",      href: "/tutors",             icon: "graduation-cap" },
    { name: "My Progress",   href: "/student/progress",   icon: "line-chart" },
    { name: "Subscription",  href: "/student/subscription", icon: "crown" },
  ];

  if (isPremium) {
    studentLinks.push({ name: "Resources", href: "/resources", icon: "library" });
  }

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
















