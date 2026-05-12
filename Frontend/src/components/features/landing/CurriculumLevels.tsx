"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, Lock, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Lesson {
  _id: string;
  category: string;
  level: string;
}

const LEVELS = ["Beginner", "Elementary", "Intermediate", "Advanced"];

export default function CurriculumLevels() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLevel, setActiveLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all lessons to extract categories by level
    api.get("/lessons")
      .then(res => {
        const data = res.data?.lessons || res.data || [];
        setLessons(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch lessons:", err);
        setLoading(false);
      });
  }, []);

  const getCategoriesForLevel = (level: string) => {
    const levelLessons = lessons.filter(l => (l.level || "Beginner").toLowerCase() === level.toLowerCase());
    const uniqueCategories = Array.from(new Set(levelLessons.map(l => l.category)));
    return uniqueCategories;
  };

  const handleCategoryClick = () => {
    if (!authUser) {
      router.push("/auth/signin");
    } else {
      router.push("/student/lessons");
    }
  };

  if (loading) return null;

  return (
    <section id="curriculum" className="py-14 md:py-24 bg-[#FDFDFF] px-4 md:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Level List Section - Long Pill Style */}
        <div className="space-y-6">
          {LEVELS.map((level) => {
            const isActive = activeLevel === level;
            const levelCategories = getCategoriesForLevel(level);

            return (
              <div 
                key={level} 
                className={cn(
                    "group bg-white rounded-[3rem] border transition-all duration-500",
                    isActive ? "border-primary/30 shadow-2xl shadow-primary/5" : "border-slate-100 hover:border-primary/20 hover:shadow-xl"
                )}
              >
                <div
                  onClick={() => setActiveLevel(isActive ? null : level)}
                  className="w-full flex items-center justify-between p-4 md:p-6 cursor-pointer"
                >
                  <div className="flex items-center gap-4 md:gap-8 flex-1">
                    {/* Left Icon Box */}
                    <div className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 shrink-0",
                      isActive ? "bg-primary text-white" : "bg-indigo-50/50 text-primary border border-indigo-100 group-hover:scale-105"
                    )}>
                      <BookOpen className="w-7 h-7 md:w-9 md:h-9" />
                    </div>
                    
                    {/* Center Content */}
                    <div className="text-left flex-1">
                      <h3 className="text-lg md:text-2xl font-black text-primary tracking-tight leading-none uppercase">
                        {level}
                      </h3>
                      <p className="text-[10px] md:text-xs font-black text-primary/40 uppercase tracking-[0.2em] mt-3">
                        {levelCategories.length} Categories Configured
                      </p>
                    </div>
                  </div>

                  {/* Right Side Actions */}
                  <div className="flex items-center gap-2 md:gap-6">
                    <ChevronDown className={cn(
                        "w-6 h-6 text-slate-200 transition-all duration-500 mr-4",
                        isActive ? "rotate-180 text-primary" : "group-hover:text-slate-400"
                    )} />
                  </div>
                </div>

                {/* Expanded Categories */}
                <div 
                  className={cn(
                      "overflow-hidden transition-all duration-500 ease-in-out",
                      isActive ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-6 md:px-12 pb-10 border-t border-slate-50 bg-slate-50/20">
                    <div className="pt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {levelCategories.map((catName) => (
                            <div 
                                key={catName}
                                onClick={handleCategoryClick}
                                className="group/item bg-white border border-slate-100 rounded-[2rem] p-8 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative"
                            >
                                <h4 className="text-lg font-black text-slate-800 group-hover/item:text-primary transition-colors pr-8 uppercase">
                                    {catName}
                                </h4>
                                <div className="mt-6 flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 group-hover/item:bg-primary group-hover/item:text-white transition-all w-fit">
                                    {authUser ? "Start Path" : "Sign In"} <ArrowRight size={12} className="group-hover/item:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



