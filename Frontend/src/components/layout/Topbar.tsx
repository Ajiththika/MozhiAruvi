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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => alert("Notifications coming soon!")}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mozhi-primary ring-2 ring-white dark:ring-slate-900" />
        </button>
      </div>
    </header>
  );
}
