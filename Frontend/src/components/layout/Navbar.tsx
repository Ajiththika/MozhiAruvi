"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Settings,
  Award,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { hasPermission, ROLES } from "@/lib/roles";

export default function Navbar() {
  const { user, isLoading, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const getDashboardLink = () => getRoleDashboardRoute(user?.role ?? "student");

  const getProfileLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "teacher") return "/tutor/profile";
    return "/student/profile";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            >
              <div className="relative w-15 h-15 md:w-10 md:h-10">
                <Image
                  src="/logo.png"
                  alt="Mozhi Aruvi Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-xl md:text-2xl font-black text-primary tracking-tighter flex items-center gap-1">
                Mozhi<span className="text-secondary">Aruvi</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/lessons"
              className="text-slate-600 hover:text-primary transition-colors font-bold text-sm"
            >
              Lessons
            </Link>
            <Link
              href="/tutors"
              className="text-slate-600 hover:text-primary transition-colors font-bold text-sm"
            >
              Tutors
            </Link>
            <Link
              href="/events"
              className="text-slate-600 hover:text-primary transition-colors font-bold text-sm"
            >
              Events
            </Link>
            <Link
              href="/blogs"
              className="text-slate-600 hover:text-primary transition-colors font-bold text-sm"
            >
              Blogs
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary transition-all shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/40 hover:border-primary transition-all shadow-sm">
                      <UserIcon size={22} />
                    </div>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-primary/70 font-medium truncate">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-2">
                      <Link
                        href={getProfileLink()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 font-semibold hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <Settings size={20} className="text-primary/60 group-hover:text-primary" />
                        Account Settings
                      </Link>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm text-slate-700 font-semibold hover:bg-slate-50 hover:text-primary transition-colors"
                      >
                        <LayoutDashboard size={20} className="text-primary/60 group-hover:text-primary" />
                        Dashboard
                      </Link>

                      {user.role === "student" && (
                        <div className="flex items-center justify-between px-5 py-2 mx-2 my-1 rounded-xl bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-2">
                            <Award size={18} className="text-primary" />
                            <span className="text-xs font-bold text-primary">Day Streak</span>
                          </div>
                          <span className="text-xs font-black text-primary">{user.progress?.currentStreak || 0}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-error hover:bg-error/5 transition-colors"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button href="/auth/signin" variant="primary" size="md">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}















