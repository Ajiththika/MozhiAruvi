"use client";

import React, { useEffect } from "react";
import { BookOpen, Lock, Circle, Star, Zap, CheckCircle2, ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLessons } from "@/services/lessonService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LessonsSkeleton } from "./LessonsSkeleton";

function groupByCategory(lessons: any[]) {
  const map: Record<string, any[]> = {};
  lessons.forEach((l) => {
    const category = l.category && l.category.trim() !== "" ? l.category : "General Curriculum";
    if (!map[category]) map[category] = [];
    map[category].push(l);
  });
  return map;
}

export default function PublicLessonsClient({ initialLessons }: { initialLessons: any[] }) {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [activeLevel, setActiveLevel] = React.useState<string | null>(null);

  const { data, isLoading, isError, error, refetch: refetchLessons } = useQuery({
    queryKey: ["lessons"],
    queryFn: async () => {
      console.log("[DEBUG] Fetching lessons...");
      return getLessons();
    },
    staleTime: 10 * 60 * 1000, // Lessons don't change often
  });

  // Auto-refresh energy every 60 seconds
  useEffect(() => {
    if (!authUser) return;
    const interval = setInterval(async () => {
        // We can use a refetch from auth context or just call getMe
        // For simplicity, we just trigger a lessons refetch which also syncs energy in backend
        refetchLessons();
    }, 60000);
    return () => clearInterval(interval);
  }, [authUser, refetchLessons]);

  if (isLoading || authLoading) {
    return <LessonsSkeleton />;
  }

  const lessons = data?.lessons || [];
  const progresses: Array<{ lessonId: string; isCompleted: boolean }> = data?.progress || [];
  const energy = authUser?.progress?.energy ?? 25;
  const isOutOfEnergy = authUser ? energy <= 0 && !authUser.isPremium : false;

  const sortedLessons = [...lessons].sort((a, b) => {
    if (a.moduleNumber !== b.moduleNumber) return (a.moduleNumber || 1) - (b.moduleNumber || 1);
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  const progressMap = new Map(progresses.map((p: any) => [p.lessonId, p]));
  const lessonStatus = new Map<string, "locked" | "unlocked" | "completed">();

  let isPreviousCompleted = true;
  for (const l of sortedLessons) {
    const prog = progressMap.get(l._id);
    const isCompleted = prog?.isCompleted ?? false;

    if (isCompleted) {
      lessonStatus.set(l._id, "completed");
      isPreviousCompleted = true;
    } else if (isPreviousCompleted || !authUser) { // For guests, don't lock everything
      lessonStatus.set(l._id, "unlocked");
      isPreviousCompleted = false;
    } else {
      lessonStatus.set(l._id, "locked");
    }
  }

  const grouped = groupByCategory(sortedLessons);

  const handleCategoryClick = () => {
    if (authLoading) return;
    if (!authUser) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/lessons`)}`);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    if (authLoading) return;
    if (!authUser) {
      router.push(`/auth/signin?redirect=${encodeURIComponent(`/student/lessons/${lessonId}`)}`);
      return;
    }
    if (isOutOfEnergy) {
      router.push("/subscription");
      return;
    }
    router.push(`/student/lessons/${lessonId}`);
  };

  return (
    <div className="space-y-8 pb-20 pt-6">


      <div className="relative overflow-hidden rounded-[2.5rem] p-10 sm:p-14 shadow-2xl shadow-primary/25 mb-12 bg-gradient-to-br from-primary via-[#5B33FF] to-[#3B11D8] border border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white uppercase drop-shadow-md">
            Start Learning
          </h2>
          <p className="mt-3 md:mt-5 text-sm sm:text-xl font-medium text-white/80 max-w-2xl mx-auto leading-relaxed px-4">
            Effectively build your conversational skills to confidently connect with your relatives. Choose a path below to begin.
          </p>
        </div>
      </div>

      {isOutOfEnergy && (
        <div className="bg-soft/20 border-2 border-soft rounded-3xl p-6 text-center shadow-lg">
          <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-slate-800 mb-2 uppercase tracking-tight">Out of Energy!</h3>
          <p className="text-slate-600 mb-4 font-medium text-sm">
            You've used up all your daily learning credits. Credits refill automatically.
          </p>
        </div>
      )}

      {Object.keys(grouped).length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-primary/60 font-bold uppercase tracking-widest text-sm">
          No lessons are ready yet.
        </div>
      )}

      {!isOutOfEnergy && (
        <div className="space-y-6">
          {["Beginner", "Elementary", "Intermediate", "Advanced"].map((level) => {
            const levelLessons = sortedLessons.filter(l => (l.level || "Beginner").toLowerCase() === level.toLowerCase());
            const uniqueCategories = Array.from(new Set(levelLessons.map(l => l.category)));
            const isActive = activeLevel === level;

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
                        {uniqueCategories.length} Categories Configured
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
                        {uniqueCategories.map((catName) => (
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
      )}
    </div>
  );
}
















