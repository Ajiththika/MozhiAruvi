"use client";

import React from "react";
import { Bell, Menu, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface TopbarProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title = "Dashboard" }: TopbarProps) {
  const { user } = useAuth();

  const profileHref = user?.role === 'teacher' ? '/tutor/profile' : '/student/profile';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md  md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-gray-800 dark:text-slate-100">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <Link 
            href={profileHref}
            className="group flex items-center gap-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all p-1.5"
          >
            <div className="hidden text-right md:block">
              <p className="text-xs font-bold text-gray-800 dark:text-white leading-none">{user.name}</p>
              <p className="text-[10px] font-medium text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full bg-gray-100 border border-gray-100 group-hover:border-primary transition-colors">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-full w-full p-1.5 text-gray-300" />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

