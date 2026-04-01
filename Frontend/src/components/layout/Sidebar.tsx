"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LogOut,
  Home,
  LineChart,
  LibraryBig,
  Users,
  Calendar,
  CalendarDays,
  Sparkles,
  Settings,
  MessageSquare,
  UserCircle,
  GraduationCap,
  Shield,
  Crown,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ── Centralised icon map ──────────────────────────────────────────────────────
export const iconMap = {
  home: Home,
  "book-open": BookOpen,
  "line-chart": LineChart,
  "library-big": LibraryBig,
  users: Users,
  calendar: Calendar,
  "calendar-days": CalendarDays,
  sparkles: Sparkles,
  settings: Settings,
  "message-square": MessageSquare,
  "user-circle": UserCircle,
  "graduation-cap": GraduationCap,
  shield: Shield,
  crown: Crown,
} as const;


export type IconName = keyof typeof iconMap;

export interface SidebarItem {
  name: string;
  href: string;
  icon: IconName;
}

interface SidebarProps {
  items: SidebarItem[];
  basePath: string;
}

export function Sidebar({ items, basePath }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/signin");
  };

  const getProfileLink = () => {
    if (user?.role === 'admin') return '/admin/profile';
    if (user?.role === 'teacher') return '/tutor/profile';
    return '/student/profile';
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-background md:flex h-screen sticky top-0">
      {/* Brand & Profile Section */}
      <div className="flex flex-col border-b border-border/60">
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl bg-primary/5 flex items-center justify-center p-1.5 border border-primary/10 shadow-inner">
              <Image src="/logo.png" alt="Mozhi Aruvi Logo" fill className="object-contain p-1" />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 flex items-center gap-1">
              Mozhi<span className="text-primary">Aruvi</span>
            </span>
          </Link>
        </div>

        {/* User Profile Header */}
        <Link 
          href={getProfileLink()}
          className="mx-6 mb-6 p-4 rounded-2xl bg-surface-soft/40 border border-border/40 hover:bg-surface-soft transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white border border-border shadow-sm group-hover:border-primary/30 transition-colors">
              {user?.profilePhoto ? (
                <Image src={user.profilePhoto} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/5">
                  <UserCircle className="h-7 w-7 text-primary/40" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Welcome back</p>
              <h4 className="text-sm font-black text-gray-800 truncate pr-2 group-hover:text-primary transition-colors">
                {user?.name || "Member"}
              </h4>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-6 scrollbar-hide py-6">
        {items.map((item) => {
          const Icon = iconMap[item.icon];
          if (!Icon) return null;

          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== basePath);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-4 px-5 py-3.5 text-sm font-bold transition-all duration-300 rounded-responsive",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-text-secondary hover:bg-primary/5 hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  isActive ? "text-white" : "text-text-secondary group-hover:text-primary"
                )}
              />
              <span className="tracking-tight font-black uppercase text-[10px] tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="border-t border-border p-6 mt-auto">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-4 rounded-responsive px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-error transition-all duration-300 hover:bg-error/5 border border-transparent hover:border-error/10"
        >
          <div className="p-2 rounded-xl bg-error/10 text-error group-hover:bg-error group-hover:text-white transition-all">
            <LogOut className="h-4 w-4" />
          </div>
          Logout Portal
        </button>
      </div>
    </aside>
  );
}
