"use client";

import React, { useEffect } from "react";
import { BookOpen, Lock, Circle, Star, Zap, CheckCircle2, ArrowRight } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(grouped).slice(0, 6).map(([category, categoryLessons]) => {
            const colorClass = "bg-primary";
            const ringClass = "group-hover:ring-primary/20";
            const shadowClass = "hover:shadow-primary/10";

            return (
              <div
                key={category}
                onClick={handleCategoryClick}
                className={cn(
                  "group relative cursor-pointer flex flex-col p-8 bg-white rounded-[2rem] border-2 border-slate-100 hover:border-transparent hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden",
                  shadowClass
                )}
              >
                <div className={cn("absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150", colorClass)} />
                
                <div className="relative z-10 flex-1">
                  <div className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 shadow-sm ring-1 ring-slate-200 transition-all duration-500 group-hover:text-white group-hover:ring-4",
                    colorClass, ringClass
                  )}>
                    <BookOpen className="w-8 h-8 transition-transform group-hover:rotate-12 duration-500" />
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-800 uppercase tracking-tight group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {category}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", colorClass)} />
                      {categoryLessons.length} {categoryLessons.length === 1 ? 'Level' : 'Levels'} Inside
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  {!authUser ? (
                    <span className="text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl bg-slate-50 text-slate-400 border border-slate-100 group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 transition-all flex items-center gap-2">
                       <Lock className="w-3 h-3" /> Sign in to start
                    </span>
                  ) : (
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors flex items-center gap-2">
                       Enter Path <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
















