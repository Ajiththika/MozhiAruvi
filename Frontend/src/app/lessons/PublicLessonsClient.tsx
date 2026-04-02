"use client";

import React, { useEffect } from "react";
import { BookOpen, Lock, Circle, Star, Zap, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getLessons } from "@/services/lessonService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { LessonsSkeleton } from "./LessonsSkeleton";

function groupByCategory(lessons: any[]) {
  const map: Record<string, any[]> = {};
  lessons.forEach((l) => {
    const category = l.moduleName || "General Curriculum";
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
      <div className="sticky top-20 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-extrabold text-lg">
            <span className="p-2 bg-primary/10 rounded-full"><BookOpen className="w-5 h-5" /></span>
            <span className="hidden sm:inline">Path</span>
          </div>
        </div>
        {authUser && (
          <div className="flex items-center gap-6 font-bold text-lg">
            <div className="flex items-center gap-1.5 text-amber-500" title="XP Earned">
              <Star className="w-6 h-6 fill-current" /> {authUser?.xp || 0}
            </div>
            <div className="flex items-center gap-1.5 text-secondary" title="Power (regenerates 1/hour)">
              <Zap className={cn("w-6 h-6 fill-current", energy < 5 ? "animate-pulse text-red-500" : "")} /> {energy}/25
            </div>
          </div>
        )}
      </div>

      <div className="px-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-3 uppercase">
          <BookOpen className="h-6 w-6 text-secondary" /> Learning Path
        </h2>
        <p className="mt-1 text-sm font-medium text-primary/70">
          Explore our structured Tamil curriculum. Authenticate to track progress.
        </p>
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

      {!isOutOfEnergy && Object.entries(grouped).map(([category, categoryLessons]) => (
        <section key={category} className="relative">
          <div
            onClick={handleCategoryClick}
            className={cn(
              "mb-8 flex items-center gap-4 transition-all",
              !authUser ? "cursor-pointer hover:opacity-70" : ""
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-lg shadow-secondary/20 text-base font-black text-white ring-4 ring-secondary/5 transition-transform hover:scale-105">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {category}
              </h3>
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">
                {categoryLessons.length} units available in this path
              </span>
            </div>
          </div>

          <div className="relative flex flex-col gap-5 pl-14 before:absolute before:inset-y-2 before:left-[1.45rem] before:ml-[1px] before:w-[2.5px] before:bg-slate-200">
            {categoryLessons.map((lesson) => {
              const status = lessonStatus.get(lesson._id) || "locked";
              const isLocked = status === "locked" || lesson.isPremiumOnly;

              return (
                <div key={lesson._id} className="relative">
                  <div className={cn(
                    "absolute -left-[32px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-[3px] bg-white z-10 transition-all",
                    status === "completed" ? "border-success scale-110" : status === "unlocked" ? "border-secondary ring-4 ring-secondary/20" : "border-slate-300 "
                  )} />

                  {isLocked ? (
                    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 opacity-70 grayscale">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200">
                        <Lock className="h-5 w-5 text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-primary/60 truncate">
                          {lesson.title}
                        </p>
                        {lesson.isPremiumOnly && (
                          <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 tracking-tighter">
                            Premium Path
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartLesson(lesson._id)}
                      className={cn(
                        "w-full text-left group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
                        status === "completed"
                          ? "border-success/20 bg-success/5 hover:border-success/40"
                          : "border-slate-100 bg-white hover:border-secondary"
                      )}
                    >
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors",
                        status === "completed" ? "bg-success/20" : "bg-primary/10"
                      )}>
                        {status === "completed" ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <Circle className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-bold truncate text-sm",
                          status === "completed" ? "text-slate-600" : "text-slate-800"
                        )}>
                          {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="mt-0.5 text-xs text-primary/70 line-clamp-1 font-medium">
                            {lesson.description}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                        {status === "completed" ? "Review" : "Start"}
                      </div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
















