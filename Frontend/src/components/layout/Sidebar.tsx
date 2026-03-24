"use client";

import React from "react";
import Link from "next/link";
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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ── Centralised icon map ──────────────────────────────────────────────────────
// ALL icon resolutions happen here — never pass icon components as props.

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
} as const;

export type IconName = keyof typeof iconMap;

// ── Types (serializable only) ─────────────────────────────────────────────────

export interface SidebarItem {
  name: string;
  href: string;
  icon: IconName; // string key — safe to pass from Server → Client
}

interface SidebarProps {
  items: SidebarItem[];
  basePath: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({ items, basePath }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/signin");
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
        <Link
          href={basePath}
          className="flex items-center gap-2 font-bold tracking-tight text-primary transition-opacity hover:opacity-90"
        >
          <BookOpen className="h-6 w-6 stroke-[2.5]" />
          <span className="text-xl">Mozhi Aruvi</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 flex flex-col gap-1">
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
                "group flex items-center gap-3 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-white"
                    : "text-slate-400 group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-900/10"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
