"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, AlertCircle, Lock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { getLessons, Lesson, Progress } from "@/services/lessonService";
import { cn } from "@/lib/utils";

function groupByModule(lessons: Lesson[]): Record<number, Lesson[]> {
  return lessons.reduce<Record<number, Lesson[]>>((acc, lesson) => {
    const key = lesson.moduleNumber ?? 1;
    if (!acc[key]) acc[key] = [];
    acc[key].push(lesson);
    return acc;
  }, {});
}

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessons()
      .then((data) => {
        setLessons(data.lessons);
        setProgresses(data.progress || []);
      })
      .catch(() => setError("Could not load lessons. Please try again."))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-mozhi-secondary" /> Learning Path
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Complete lessons in order to unlock the next level.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
          <p className="text-sm font-medium text-slate-600">Loading curriculum...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && lessons.length === 0 && (
        <div className="py-20 text-center text-slate-600 dark:text-slate-400">
          No lessons have been published yet. Check back soon!
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([module, moduleLessons]) => (
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
                  {/* Timeline connector dot */}
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