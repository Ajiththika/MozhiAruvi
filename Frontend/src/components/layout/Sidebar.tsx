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
  const { logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/auth/signin");
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-background md:flex h-screen sticky top-0">
      {/* Brand Section */}
      <div className="flex h-24 items-center border-b border-border/60 px-8">
        <Link
          href="/"
          className="flex items-center gap-4 transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-primary/5 flex items-center justify-center p-2 border border-primary/10 shadow-inner">
            <Image 
              src="/logo.png" 
              alt="Mozhi Aruvi Logo" 
              fill 
              className="object-contain p-1.5" 
            />
          </div>
          <span className="text-2xl font-black tracking-tight text-text-primary">
            Mozhi <span className="text-primary">Aruvi</span>
          </span>
        </Link>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 space-y-2.5 overflow-y-auto p-6 scrollbar-hide py-10">
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
                "group flex items-center gap-4 px-5 py-4 text-sm font-bold transition-all duration-300 rounded-responsive",
                isActive
                  ? "bg-primary text-white shadow-xl shadow-primary/30 translate-x-1"
                  : "text-text-secondary hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                isActive ? "bg-white/10" : "bg-surface-soft group-hover:bg-primary/10 border border-border/40"
              )}>
                <Icon
                  className={cn(
                    "h-4.5 w-4.5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                    isActive ? "text-white" : "text-text-secondary group-hover:text-primary"
                  )}
                />
              </div>
              <span className="tracking-tight font-black uppercase text-[10px] tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Accessibility Anchor: Footer Actions */}
      <div className="border-t border-border p-6 bg-surface-soft/60">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-4 rounded-responsive px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-error transition-all duration-300 hover:bg-error/5 border border-transparent hover:border-error/20"
        >
          <div className="p-2 rounded-xl bg-error/10 text-error group-hover:bg-error group-hover:text-white transition-all shadow-sm">
            <LogOut className="h-4.5 w-4.5" />
          </div>
          Session Logout
        </button>
      </div>
    </aside>
  );
}
