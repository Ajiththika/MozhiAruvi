"use client";

import React from "react";
import { Bell, Menu, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
  title?: string;
}

export function Topbar({ onMenuClick, title = "Dashboard" }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md dark:border-slate-200 dark:bg-slate-/80 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-50 dark:hover:bg-slate-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-600 dark:text-slate-600">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-50">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-600" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mozhi-primary ring-2 ring-white dark:ring-slate-" />
        </button>
        <button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-200 dark:bg-slate-50 dark:hover:bg-slate-50">
          <UserCircle className="h-6 w-6 text-slate-600" />
          <span className="hidden pr-2 text-sm font-medium text-slate-600 dark:text-slate-600 md:block">
            Account
          </span>
        </button>
      </div>
    </header>
  );
}
