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
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-20 pt-8 px-4">
      {/* Top Bar for Credits and Stats */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-mozhi-primary font-extrabold text-lg">
            <span className="p-2 bg-blue-50 rounded-full"><BookOpen className="w-5 h-5" /></span>
            <span className="hidden sm:inline">Path</span>
          </div>
        </div>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-1.5 text-orange-500" title="XP Earned">
            <Star className="w-6 h-6 fill-current" /> {user?.xp || 0}
          </div>
          <div className={`flex items-center gap-1.5 ${isOutOfEnergy ? "text-slate-400" : "text-amber-400"}`} title="Daily Credits">
            <Zap className="w-6 h-6 fill-current" /> {credits}/25
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-mozhi-secondary" /> Learning Path
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Complete lessons in order to unlock the next level.
        </p>
      </div>

      {isOutOfEnergy && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center shadow-lg transform -translate-y-2">
          <Zap className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">Out of Energy!</h3>
          <p className="text-slate-600 mb-4 font-medium">
            You've used up all your daily learning credits. Take a break!
            <br />
            Credits refill automatically.
          </p>
        </div>
      )}

      {Object.keys(grouped).length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-slate-500 font-medium">
          No lessons are ready yet. The curriculum is being prepared!
        </div>
      )}

      {!isOutOfEnergy && Object.entries(grouped).map(([module, moduleLessons]) => (
        <section key={module} className="relative">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mozhi-primary shadow-sm text-sm font-bold text-white ring-4 ring-mozhi-primary/20 dark:ring-mozhi-primary/40">
              {module}
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  Level {module}
               </h3>
               <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {moduleLessons.length} lessons
               </span>
            </div>
          </div>

          <div className="relative flex flex-col gap-4 pl-12 before:absolute before:inset-y-2 before:left-5 before:ml-[1px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700">
            {moduleLessons.map((lesson, index) => {
              const status = lessonStatus.get(lesson._id) || "locked";
              const isLocked = status === "locked" || lesson.isPremiumOnly;

              return (
                <div key={lesson._id} className="relative">
                  <div className={cn(
                     "absolute -left-[2.1rem] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 bg-white dark:bg-slate-900 z-10",
                     status === "completed" ? "border-emerald-500" : status === "unlocked" ? "border-mozhi-secondary ring-4 ring-mozhi-secondary/20" : "border-slate-300 dark:border-slate-600"
                  )} />
                  
                  {isLocked ? (
                     <div className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-75 dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
                           <Lock className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <p className="font-semibold text-slate-500 dark:text-slate-400 truncate">
                              {lesson.title}
                           </p>
                           {lesson.isPremiumOnly && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                                 Premium Required
                              </span>
                           )}
                        </div>
                     </div>
                  ) : (
                     <Link
                       href={`/student/lessons/${lesson._id}`}
                       className={cn(
                          "group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                          status === "completed" 
                             ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300 dark:border-emerald-900/30 dark:bg-emerald-950/10" 
                             : "border-sky-200 bg-white hover:border-sky-300 dark:border-sky-900/40 dark:bg-slate-800"
                       )}
                     >
                       <div className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                          status === "completed" ? "bg-emerald-100 dark:bg-emerald-900/50" : "bg-sky-100 dark:bg-sky-900/50"
                       )}>
                         {status === "completed" ? (
                           <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
                         ) : (
                           <Circle className="h-6 w-6 text-mozhi-primary dark:text-mozhi-secondary fill-mozhi-primary/20" />
                         )}
                       </div>
     
                       <div className="flex-1 min-w-0">
                         <p className={cn(
                            "font-bold truncate",
                            status === "completed" ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"
                         )}>
                           {lesson.title}
                         </p>
                         {lesson.description && (
                           <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                             {lesson.description}
                           </p>
                         )}
                       </div>
     
                       <div className="shrink-0 font-bold text-mozhi-primary group-hover:text-mozhi-secondary transition-colors dark:text-mozhi-secondary dark:group-hover:text-mozhi-primary">
                         {status === "completed" ? "Review" : "Start"} →
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