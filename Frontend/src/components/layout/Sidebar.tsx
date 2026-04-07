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
    if (user?.role === 'teacher' || user?.role === 'tutor') return '/tutor/profile';
    return '/student/profile';
  };

  return (
    <aside className="hidden w-72 flex-col border-r border-border bg-white md:flex h-screen sticky top-0 overflow-hidden">
      {/* Brand Section */}
      <div className="flex h-16 items-center px-8 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-80">
          <div className="relative h-7 w-7 md:h-10 md:w-10 overflow-hidden">
            <Image src="/logo.png" alt="Mozhi Aruvi Logo" fill className="object-contain" />
          </div>
          <span className="text-base md:text-xl font-black tracking-tighter text-primary flex items-center gap-1">
            Mozhi<span className="text-secondary">Aruvi</span>
          </span>
        </Link>
      </div>

      {/* User Profile Hook */}
      <div className="px-5 mb-4 shrink-0">
        <Link 
          href={getProfileLink()}
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100/50 transition-all duration-300 group"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white border border-border shadow-sm group-hover:scale-105 transition-transform">
            {user?.profilePhoto ? (
              <Image src={user.profilePhoto} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/5">
                <UserCircle className="h-6 w-6 text-primary/40" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none">
                {pathname.startsWith('/admin') ? 'Admin' : pathname.startsWith('/tutor') ? 'Teacher' : 'Student'}
              </p>
              {user?.subscription?.plan && user.subscription.plan !== 'FREE' && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border shadow-sm",
                  user.subscription.plan === 'PREMIUM' ? "bg-amber-400 border-amber-500 text-slate-900" : "bg-emerald-500 border-emerald-600 text-white"
                )}>
                  {user.subscription.plan}
                </span>
              )}
            </div>
            <h4 className="text-xs font-black text-text-primary truncate pr-2">
              {user?.name || "Member"}
            </h4>
          </div>
        </Link>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 scrollbar-hide py-2">
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
                "group flex items-center gap-3.5 px-4 py-3 text-sm font-bold transition-all duration-300 rounded-xl",
                isActive
                  ? "bg-slate-100/80 text-primary shadow-sm border border-slate-100/50"
                  : "text-primary/70 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-all duration-300",
                  isActive ? "text-primary" : "text-primary/60 group-hover:text-primary"
                )}
              />
              <span className="font-black uppercase text-[10px] tracking-widest">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1 h-3 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Promo Section: 1-time Trial offer (Students Only) */}
      {user?.role === 'student' && 
       user?.subscription?.plan === 'FREE' && 
       !user?.subscription?.stripeSubscriptionId &&
       !user?.hasUsedTrial && (
        <div className="px-5 py-6 shrink-0">
          <div className="bg-slate-50 rounded-[2rem] p-5 relative overflow-hidden group/promo border border-indigo-100 shadow-xl shadow-indigo-100/20">
             <div className="absolute -right-6 -top-6 opacity-20 rotate-12 group-hover/promo:scale-110 group-hover/promo:rotate-6 transition-all duration-700">
                <Crown className="h-24 w-24 text-primary" />
             </div>
             
             <div className="relative z-10">
               <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-tighter mb-2 border border-primary/20">
                 Elite Pass
               </span>
               <h4 className="text-primary text-xs font-black leading-snug mb-3">
                 Experience everything <br />7 days for free.
               </h4>
               <button 
                 onClick={() => router.push('/student/subscription')}
                 className="w-full h-10 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
               >
                 Go Premium
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="p-5 mt-auto border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 px-4 py-3 rounded-xl text-xs font-black text-red-500 hover:bg-red-50 transition-all duration-300"
        >
          <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
             <LogOut className="h-4 w-4" />
          </div>
          <span className="uppercase text-[10px] tracking-widest">Logout Portal</span>
        </button>
      </div>
    </aside>
  );
}















