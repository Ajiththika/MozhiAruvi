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
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { hasPermission, ROLES } from "@/lib/roles";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { user, isLoading, logoutUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const getDashboardLink = () => getRoleDashboardRoute(user?.role ?? "student", user?.tutorStatus);

  const getProfileLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "teacher") return "/tutor/profile";
    return "/student/profile";
  };

  const navLinks = [
    { label: "Lessons", href: "/lessons" },
    { label: "Teachers", href: "/tutors" },
    { label: "Events", href: "/events" },
    { label: "Blogs", href: "/blogs" },
  ];

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20 md:h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 group hover:opacity-90 transition-opacity"
            >
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="Mozhi Aruvi Logo"
                  fill
                  className="object-contain"
                  sizes="40px"
                  priority
                />
              </div>
              <span className="text-xl md:text-2xl font-black text-primary tracking-tighter flex items-center gap-1">
                Mozhi<span className="text-secondary">Aruvi</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-primary transition-all font-bold text-sm tracking-tight relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop & Mobile Profile */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/10 hover:border-primary transition-all shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/40 hover:border-primary transition-all shadow-sm">
                      <UserIcon size={22} />
                    </div>
                  )}
                </button>

                {isProfileOpen && (
                  <>
                    <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-sm font-black text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-primary/70 font-bold uppercase tracking-widest truncate mt-1">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-2">
                        <Link
                          href={getProfileLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="group flex items-center gap-3 px-6 py-4 text-xs text-slate-700 font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all"
                        >
                          <Settings size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                          Account Settings
                        </Link>

                        <Link
                          href={getDashboardLink()}
                          onClick={() => setIsProfileOpen(false)}
                          className="group flex items-center gap-3 px-6 py-4 text-xs text-slate-700 font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-primary transition-all"
                        >
                          <LayoutDashboard size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                          Dashboard
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 mx-4 my-2"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-4 text-xs font-black text-error hover:bg-error/5 transition-all uppercase tracking-widest"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </div>
                    {/* Backdrop for profile menu */}
                    <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsProfileOpen(false)} />
                  </>
                )}
              </div>
            ) : (
              <Button 
                href="/auth/signin" 
                variant="primary" 
                size="md" 
                className="rounded-full px-6 md:px-8 py-2 md:py-2.5 text-[10px] md:text-xs"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-white hover:border-primary/20 transition-all active:scale-95"
            >
              {isMobileMenuOpen ? <X size={20} className="text-primary" /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={cn(
        "fixed inset-x-0 top-0 z-[90] md:hidden bg-white shadow-2xl transition-all duration-500 origin-top overflow-hidden",
        isMobileMenuOpen ? "h-screen opacity-100" : "h-0 opacity-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header in Drawer */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100">
             <div className="flex items-center gap-2">
                <div className="relative w-8 h-8">
                  <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="text-lg font-black text-primary tracking-tighter">Mozhi<span className="text-secondary">Aruvi</span></span>
             </div>
             <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-primary/20 transition-all duration-300 group"
              >
                <span className="text-base font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{link.label}</span>
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-slate-100 group-hover:border-primary/20 transition-all">
                   <ArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {!user && (
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
              <Button 
                href="/auth/signin" 
                variant="primary" 
                size="lg" 
                className="w-full rounded-2xl py-4 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In to Platform
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}















