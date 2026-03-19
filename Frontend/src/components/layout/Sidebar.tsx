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
import { logout } from "@/services/authService";
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // swallow — clear anyway
    }
    router.push("/auth/signin");
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate- bg-white dark:border-slate- dark:bg-slate- md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-slate- px-6 dark:border-slate-">
        <Link
          href={basePath}
          className="flex items-center gap-2 font-bold tracking-tight text-mozhi-primary dark:text-mozhi-secondary"
        >
          <BookOpen className="h-6 w-6 stroke-[2.5]" />
          <span className="text-xl">Mozhi Aruvi</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4 flex flex-col gap-1">
        {items.map((item) => {
          // Runtime guard: fail fast if an unknown key slips through
          const Icon = iconMap[item.icon];
          if (!Icon) {
            if (process.env.NODE_ENV === "development") {
              console.error(`[Sidebar] Unknown icon key: "${item.icon}"`);
            }
            return null;
          }

          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== basePath);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-mozhi-light/50 text-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary"
                  : "text-slate- hover:bg-slate- dark:text-slate- dark:hover:bg-slate-/50"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-mozhi-primary dark:text-mozhi-secondary"
                    : "text-slate- group-hover:text-slate- dark:text-slate- dark:group-hover:text-slate-"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate- p-4 dark:border-slate-">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
