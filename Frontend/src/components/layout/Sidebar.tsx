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
    <aside className="hidden w-64 flex-col border-r border-gray-100 bg-white md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-gray-100 px-6">
        <Link
          href={basePath}
          className="flex items-center gap-2 font-bold tracking-tight text-primary"
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
                "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
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
      <div className="border-t border-gray-100 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-error transition-colors duration-200 hover:bg-error/10"
        >
          <LogOut className="h-5 w-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
