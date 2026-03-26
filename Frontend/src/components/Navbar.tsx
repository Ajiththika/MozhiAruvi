"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, LogOut, LayoutDashboard, Settings, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";
import { getRoleDashboardRoute } from "@/lib/roleUtils";
import { hasPermission, ROLES } from "@/utils/roles";

export default function Navbar() {
  const { user, isLoading, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.push("/");
  };

  const getDashboardLink = () => getRoleDashboardRoute(user?.role ?? "user");

  const getProfileLink = () => {
    if (user?.role === "admin") return "/admin";
    if (user?.role === "teacher") return "/tutor/profile";
    return "/student/profile";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="text-secondary">Mozhi</span>Aruvi
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/lessons" className="text-gray-500 hover:text-primary transition-colors font-semibold text-sm">
              Lessons
            </Link>
            <Link href="/tutors" className="text-gray-500 hover:text-primary transition-colors font-semibold text-sm">
              Tutors
            </Link>
            <Link href="/events" className="text-gray-500 hover:text-primary transition-colors font-semibold text-sm">
              Events
            </Link>
            <Link href="/blogs" className="text-gray-500 hover:text-primary transition-colors font-semibold text-sm">
              Blogs
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
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
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 hover:border-primary transition-colors"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20 hover:border-primary transition-colors">
                      <UserIcon size={20} />
                    </div>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      href={getProfileLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <Settings size={16} />
                      Profile Settings
                    </Link>

                    <Link
                      href={getDashboardLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard size={16} />
                      My Dashboard
                    </Link>

                    {hasPermission(user.role, [ROLES.ADMIN, ROLES.TEACHER]) && (
                      <Link
                        href="/student/blogs/create"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-bold hover:bg-primary/5 transition-colors"
                      >
                        <Award size={16} className="text-primary" />
                        Write a Story
                      </Link>
                    )}
                    
                    {user.role === 'user' && (
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-50/30 font-semibold">
                        <Award size={16} className="text-warning" />
                        <span>XP: {user.xp || 0}</span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                href="/auth/signin" 
                variant="primary"
                size="md"
              >
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
