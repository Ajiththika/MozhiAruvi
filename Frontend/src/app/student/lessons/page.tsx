"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, AlertCircle, Lock, Circle, Star, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLessons, Lesson, Progress } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { cn } from "@/lib/utils";

function groupByModule(lessons: Lesson[]) {
  const map: Record<string, Lesson[]> = {};
  lessons.forEach((l) => {
    const mNum = l.moduleNumber?.toString() || "1";
    if (!map[mNum]) map[mNum] = [];
    map[mNum].push(l);
  });
  return map;
}

export default function StudentLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getLessons()])
      .then(([userData, data]) => {
        if (!userData.level || userData.level === "Not Set") {
          router.push("/student/lessons/placement");
          return;
        }
        setUser(userData);
        setLessons(data.lessons || []);
        setProgresses(data.progress || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load path. Please refresh.");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
        <p className="text-lg font-bold text-slate-500">Building your path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const credits = user?.learningCredits ?? 0;
  const isOutOfEnergy = credits <= 0;

  const sortedLessons = [...lessons].sort((a, b) => {
    if (a.moduleNumber !== b.moduleNumber) return (a.moduleNumber || 1) - (b.moduleNumber || 1);
    return a.orderIndex - b.orderIndex;
  });

  const progressMap = new Map(progresses.map(p => [p.lessonId, p]));
  const lessonStatus = new Map<string, "locked" | "unlocked" | "completed">();

  let isPreviousCompleted = true;
  for (const l of sortedLessons) {
    const prog = progressMap.get(l._id);
    const isCompleted = prog?.isCompleted ?? false;
    
    if (isCompleted) {
      lessonStatus.set(l._id, "completed");
      isPreviousCompleted = true;
    } else if (isPreviousCompleted) {
      lessonStatus.set(l._id, "unlocked");
      isPreviousCompleted = false;
    } else {
      lessonStatus.set(l._id, "locked");
    }
  }

  const grouped = groupByModule(sortedLessons);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 pt-6 px-4">
      {/* Top Bar for Credits and Stats */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between mb-6 dark:bg-slate-900/80 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-extrabold text-lg">
            <span className="p-2 bg-primary/10 rounded-full"><BookOpen className="w-5 h-5" /></span>
            <span className="hidden sm:inline">Path</span>
          </div>
        </div>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-1.5 text-amber-500" title="XP Earned">
            <Star className="w-6 h-6 fill-current" /> {user?.xp || 0}
          </div>
          <div className={`flex items-center gap-1.5 ${isOutOfEnergy ? "text-slate-400" : "text-amber-400"}`} title="Daily Credits">
            <Zap className="w-6 h-6 fill-current" /> {credits}/25
          </div>
        </div>
      </div>

      <div className="px-2">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3 uppercase">
          <BookOpen className="h-6 w-6 text-secondary" /> Learning Path
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Complete lessons in order to unlock the next level.
        </p>
      </div>

      {isOutOfEnergy && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center shadow-lg dark:bg-amber-900/10 dark:border-amber-900/30">
          <Zap className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">Out of Energy!</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 font-medium text-sm">
            You've used up all your daily learning credits. Take a break!
            <br />
            Credits refill automatically.
          </p>
        </div>
      )}

      {Object.keys(grouped).length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
          No lessons are ready yet.
        </div>
      )}

      {!isOutOfEnergy && Object.entries(grouped).map(([module, moduleLessons]) => (
        <section key={module} className="relative">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-base font-black text-white ring-4 ring-primary/10 transition-transform hover:scale-105">
              {module}
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Level {module}
               </h3>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {moduleLessons.length} lessons available
               </span>
            </div>
          </div>

          <div className="relative flex flex-col gap-5 pl-14 before:absolute before:inset-y-2 before:left-[1.45rem] before:ml-[1px] before:w-[2.5px] before:bg-slate-200 dark:before:bg-slate-800">
            {moduleLessons.map((lesson) => {
              const status = lessonStatus.get(lesson._id) || "locked";
              const isLocked = status === "locked" || lesson.isPremiumOnly;

              return (
                <div key={lesson._id} className="relative">
                  <div className={cn(
                     "absolute -left-[32px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-[3px] bg-white dark:bg-slate-950 z-10 transition-all",
                     status === "completed" ? "border-success scale-110" : status === "unlocked" ? "border-secondary ring-4 ring-secondary/20" : "border-slate-300 dark:border-slate-700"
                  )} />
                  
                  {isLocked ? (
                     <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-70 dark:border-slate-800 dark:bg-slate-800/20 grayscale">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 dark:bg-slate-700">
                           <Lock className="h-5 w-5 text-slate-500 dark:text-slate-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-bold text-slate-400 dark:text-slate-500 truncate">
                              {lesson.title}
                           </p>
                           {lesson.isPremiumOnly && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-500 tracking-tighter">
                                 Premium Path
                              </span>
                           )}
                        </div>
                     </div>
                  ) : (
                     <Link
                       href={`/student/lessons/${lesson._id}`}
                       className={cn(
                          "group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]",
                          status === "completed" 
                             ? "border-success/20 bg-success/5 hover:border-success/40 dark:border-success/10" 
                             : "border-slate-200 bg-white hover:border-primary dark:border-slate-800 dark:bg-slate-900"
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
                            status === "completed" ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white"
                         )}>
                           {lesson.title}
                         </p>
                         {lesson.description && (
                           <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500 line-clamp-1 font-medium">
                             {lesson.description}
                           </p>
                         )}
                       </div>
     
                       <div className="shrink-0 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                         {status === "completed" ? "Review" : "Start"}
                       </div>
                     </Link>
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