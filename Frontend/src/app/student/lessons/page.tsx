"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, AlertCircle, Lock, Circle, Star, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLessons, Lesson, Progress } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { cn } from "@/lib/utils";
import { LessonOnboarding } from "@/components/LessonOnboarding";

// Order of categories based on learning path
const CATEGORY_ORDER = [
  "Uyir Eluthu",
  "Mei Eluthu",
  "Uyirmei Eluthu",
  "Ayutha Eluthu",
  "Grantha Eluthugal"
];

function groupByCategory(lessons: Lesson[]) {
  const map: Record<string, Lesson[]> = {};
  lessons.forEach((l) => {
    const category = l.category || "Uyir Eluthu";
    if (!map[category]) map[category] = [];
    map[category].push(l);
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
        setUser(userData);
        setLessons(data.lessons || []);
        setProgresses(data.progress || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load path. Please refresh.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-bold text-gray-500">Building your path...</p>
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

  if (user && !user.hasCompletedOnboarding) {
    return <LessonOnboarding onSuccess={() => {
        // Optimistically update
        setUser({ ...user, hasCompletedOnboarding: true });
        router.push("/student");
    }} />;
  }

  const powers = user?.power ?? 30; // Uses power instead of credits
  const isOutOfEnergy = powers <= 0;

  const userLevel = user?.level || "Basic";

  // Filter lessons based on user level
  const filteredLessons = lessons.filter(l => (l.level || "Basic") === userLevel);

  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (a.moduleNumber !== b.moduleNumber) return (a.moduleNumber || 1) - (b.moduleNumber || 1);
    return (a.orderIndex || 0) - (b.orderIndex || 0);
  });

  const progressMap = new Map(progresses.map(p => [p.lessonId, p]));
  const lessonStatus = new Map<string, "locked" | "unlocked" | "completed">();

  // Progress logic
  let isPreviousCompleted = true;
  for (const l of sortedLessons) {
    const prog = progressMap.get(l._id);
    const isCompleted = prog?.isCompleted ?? false;
    const catIdx = CATEGORY_ORDER.indexOf(l.category || "Uyir Eluthu");
    
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

  const grouped = groupByCategory(sortedLessons);
  const orderedGroups = Object.entries(grouped).sort((a, b) => {
      const idxA = CATEGORY_ORDER.indexOf(a[0]);
      const idxB = CATEGORY_ORDER.indexOf(b[0]);
      if (idxA === -1 && idxB === -1) return a[0].localeCompare(b[0]);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 pt-6 px-4">
      {/* Top Bar for Energy and Gamification Stats */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between mb-6 ">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-extrabold text-lg">
            <span className="p-2 bg-primary/10 rounded-full"><BookOpen className="w-5 h-5" /></span>
            <span className="hidden sm:inline">Path</span>
          </div>
        </div>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-1.5 text-amber-500" title="Points Earned">
            <Star className="w-6 h-6 fill-current" /> {user?.points || user?.xp || 0}
          </div>
          <div className="flex items-center gap-1.5 text-secondary" title="Daily Power">
            <Zap className="w-6 h-6 fill-current" /> {powers}/30
          </div>
        </div>
      </div>

      <div className="px-2">
        <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white flex items-center gap-3 uppercase">
          <BookOpen className="h-6 w-6 text-secondary" /> Learning Path - {userLevel}
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
          Complete categories to earn badges in your journey.
        </p>
      </div>

      {isOutOfEnergy && (
        <div className="bg-soft/20 border-2 border-soft rounded-3xl p-6 text-center shadow-lg dark:bg-gray-800/20 ">
          <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-gray-800 dark:text-white mb-2 uppercase tracking-tight">Out of Energy!</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium text-sm">
            You've used up all your daily powers. Take a break!
            <br />
            1 Power regenerates every 1 hour.
          </p>
        </div>
      )}

      {orderedGroups.length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
          No lessons are ready yet.
        </div>
      )}

      {!isOutOfEnergy && orderedGroups.map(([category, categoryLessons]) => {
        // Calculate Badge Status
        const totalCat = categoryLessons.length;
        const completedCat = categoryLessons.filter(l => progressMap.get(l._id)?.isCompleted).length;
        const badgeEarned = totalCat > 0 && completedCat === totalCat;

        return (
            <section key={category} className="relative">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary shadow-lg shadow-secondary/20 text-base font-black text-white ring-4 ring-secondary/5 transition-transform hover:scale-105">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      {category}
                      {badgeEarned && (
                          <div title={`${category} Master`} className="bg-primary/20 p-1 rounded-full px-2 text-primary text-xs tracking-widest ml-2 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> MASTER
                          </div>
                      )}
                   </h3>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {completedCat} / {totalCat} lessons completed
                   </span>
                </div>
              </div>
    
              <div className="relative flex flex-col gap-5 pl-14 before:absolute before:inset-y-2 before:left-[1.45rem] before:ml-[1px] before:w-[2.5px] before:bg-gray-200 dark:before:bg-gray-800">
                {categoryLessons.map((lesson) => {
                  const status = lessonStatus.get(lesson._id) || "locked";
                  const isLocked = status === "locked" || lesson.isPremiumOnly;
    
                  return (
                    <div key={lesson._id} className="relative cursor-pointer transition-transform hover:scale-[1.01] active:scale-100">
                      <div className={cn(
                         "absolute -left-[32px] top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-[3px] bg-white z-10 transition-all",
                         status === "completed" ? "border-success scale-110" : status === "unlocked" ? "border-secondary ring-4 ring-secondary/20" : "border-slate-300 "
                      )} />
                      
                      {isLocked ? (
                         <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 opacity-70  dark:bg-gray-800/20 grayscale">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200 dark:bg-slate-700">
                               <Lock className="h-5 w-5 text-gray-500 dark:text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-bold text-gray-400 dark:text-gray-500 truncate">
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
                         <div
                           onClick={() => {
                             if (!user) {
                               router.push("/login");
                               return;
                             }
                             if ((user.power ?? 30) <= 0) {
                               alert("No energy left. Please wait for power to regenerate.");
                               return;
                             }
                             router.push(`/student/lessons/${lesson._id}`);
                           }}
                           className={cn(
                              "group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99] cursor-pointer",
                              status === "completed" 
                                 ? "border-success/20 bg-success/5 hover:border-success/40 dark:border-success/10" 
                                 : "border-gray-100 bg-white hover:border-secondary shadow-[0_4px_0_0_rgba(240,240,240,1)] hover:shadow-[0_4px_0_0_var(--tw-shadow-color)] shadow-secondary/20 dark:bg-white"
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
                                "font-bold truncate text-sm uppercase tracking-wide",
                                status === "completed" ? "text-gray-600 dark:text-gray-400" : "text-gray-800 dark:text-white"
                             )}>
                               {lesson.title}
                             </p>
                             {lesson.type && (
                                <span className="text-[10px] text-primary/80 uppercase font-black tracking-widest mt-1 block">
                                   [{lesson.type}] Practice
                                </span>
                             )}
                             {lesson.description && (
                               <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 line-clamp-1 font-medium">
                                 {lesson.description}
                               </p>
                             )}
                           </div>
         
                           <div className="shrink-0 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                             {status === "completed" ? "Review" : "Start"}
                           </div>
                         </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
        );
      })}
    </div>
  );
}
