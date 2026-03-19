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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white/80 px-4 backdrop-blur-md dark:border-slate- dark:bg-slate-/80 md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-slate- dark:hover:bg-slate- lg:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </button>
        <h1 className="text-lg font-semibold tracking-tight text-slate- dark:text-slate-">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate- dark:hover:bg-slate-">
          <Bell className="h-5 w-5 text-slate- dark:text-slate-" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-mozhi-primary ring-2 ring-white dark:ring-slate-" />
        </button>
        <button className="flex items-center gap-2 rounded-full border border-slate- bg-white px-2 py-1 shadow-sm transition-colors hover:bg-slate- dark:border-slate- dark:bg-slate- dark:hover:bg-slate-">
          <UserCircle className="h-6 w-6 text-slate-" />
          <span className="hidden pr-2 text-sm font-medium text-slate- dark:text-slate- md:block">
            Account
          </span>
        </button>
      </div>
    </header>
  );
}
