"use client";

import React from "react";
import { Bell, Menu, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopbarProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title = "Dashboard" }: TopbarProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  const profileHref = user?.role === 'teacher' ? '/tutor/profile' : '/student/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md  md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <h1 className="text-lg font-black tracking-tight text-text-primary">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link href={profileHref} className="flex items-center gap-3">
            <div className="hidden text-right md:block">
              <h4 className="text-xs font-black text-text-primary truncate pr-2">
                {user?.name || "Member"}
              </h4>
              <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-none mt-1">
                {pathname.startsWith('/admin') ? 'Admin' : pathname.startsWith('/tutor') ? 'Teacher' : 'Student'}
              </p>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 border border-slate-100 group-hover:border-primary transition-colors">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-full w-full p-1.5 text-slate-300" />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

















