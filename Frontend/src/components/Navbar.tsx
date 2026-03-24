"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, LogOut, Settings, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/common/Button";

export default function Navbar() {
  const { user, isLoading, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const getProfileLink = () => {
    if (user?.role === "admin") return "/admin/dashboard";
    if (user?.role === "teacher") return "/tutor/profile";
    return "/student/profile";
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100/50">
      <div className="container-wide">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-black text-slate-900 flex items-center gap-2 hover:scale-105 transition-transform tracking-tighter">
              <span className="text-primary italic">Mozhi</span>Aruvi
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-12">
            {[
              { name: "Lessons", href: "/student/lessons" },
              { name: "Tutors", href: "/student/tutors" },
              { name: "Events", href: "/events" },
              { name: "Blogs", href: "/blogs" }
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (!user && item.href.startsWith('/student')) {
                    router.push(`/auth/signin?redirect=${encodeURIComponent(item.href)}`);
                  } else {
                    router.push(item.href);
                  }
                }}
                className="text-slate-500 hover:text-primary transition-all font-bold text-xs uppercase tracking-widest italic"
              >
                {item.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-6">
            {isLoading ? (
              <div className="w-10 h-10 rounded-2xl bg-slate-100 animate-pulse border border-slate-50"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 focus:outline-none group p-1 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="text-right hidden sm:block mr-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</p>
                    <p className="text-xs font-bold text-slate-900 leading-none">{user.name.split(' ')[0]}</p>
                  </div>
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 ring-2 ring-primary/5"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-md group-hover:scale-105 transition-transform duration-500 ring-2 ring-slate-100">
                      <UserIcon size={18} />
                    </div>
                  )}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-4 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 py-4 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 mb-2">
                      <p className="text-sm font-black text-slate-900 tracking-tight truncate">{user.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 truncate italic">{user.email}</p>
                    </div>
                    
                    <Link
                      href={getProfileLink()}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-8 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all italic border-l-4 border-transparent hover:border-primary"
                    >
                      <Settings size={16} />
                      Dashboard & Settings
                    </Link>
                    
                    {user.role === 'user' && (
                      <div className="flex items-center gap-3 px-8 py-3.5 text-xs font-black text-primary bg-primary/5 italic">
                        <Award size={16} className="text-primary animate-pulse" />
                        <span>XP Progress: {user.xp || 0}</span>
                      </div>
                    )}
                    
                    <div className="h-px bg-slate-100 my-2 mx-6"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-8 py-3.5 text-xs font-black text-red-400 hover:bg-red-50 hover:text-red-700 transition-all italic border-l-4 border-transparent hover:border-red-500"
                    >
                      <LogOut size={16} />
                      Sign Out Account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button 
                href="/auth/signin" 
                variant="primary"
                size="md"
                className="shadow-primary/20"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile nav placeholder - click outside handler could go here */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 hidden" 
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}

