"use client";

import React, { useEffect, useState } from "react";
import {
  BookOpen, Loader2, AlertCircle, Lock, Star, Flame, Zap, CheckCircle2,
  ArrowRight, Clock, ListChecks, Play
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getLessons, Lesson, Progress } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { cn } from "@/lib/utils";
import { LessonOnboarding } from "@/components/LessonOnboarding";

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── Lesson Preview Modal ──────────────────────────────────────────────────────

interface PreviewModalProps {
  lesson: Lesson;
  status: "unlocked" | "completed";
  onClose: () => void;
  onStart: () => void;
}

function LessonPreviewModal({ lesson, status, onClose, onStart }: PreviewModalProps) {
  const estimatedMin = Math.max(2, Math.ceil((lesson as any).questionCount || 5));
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-indigo-950/25 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Colored accent strip */}
        <div className={cn("h-2.5 w-full", status === "completed" ? "bg-success" : "bg-secondary")} />

        <div className="p-10 space-y-8">
          {/* Badge + Title */}
          <div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-sm",
              status === "completed" ? "bg-success/10 text-success" : "bg-secondary/10 text-secondary"
            )}>
              {status === "completed" ? "Completed" : "Available Activity"}
            </span>
            <h2 className="mt-5 text-3xl font-black text-primary tracking-tight leading-tight">{lesson.title}</h2>
            {lesson.category && (
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-2">{lesson.category}</p>
            )}
          </div>

          {/* Meta chips */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <ListChecks className="w-5 h-5 text-primary" />
              <span>{(lesson as any).questionCount || "?"} Questions</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
              <Clock className="w-5 h-5 text-primary" />
              <span>~{estimatedMin} min</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onStart}
              className={cn(
                "w-full py-5 rounded-2xl text-xs font-bold uppercase tracking-widest text-white flex items-center justify-center gap-3 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] hover:translate-y-[-2px]",
                status === "completed"
                  ? "bg-success shadow-success/30"
                  : "bg-secondary shadow-secondary/30"
              )}
            >
              <Play className="w-5 h-5 fill-current" />
              {status === "completed" ? "Review Mastered Item" : "Commence Lesson"}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl border-2 border-slate-100 text-xs font-bold uppercase tracking-widest text-primary/70 hover:bg-slate-50 transition-all"
            >
              Back to Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progresses, setProgresses] = useState<Progress[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<{
    lesson: Lesson;
    status: "unlocked" | "completed";
  } | null>(null);

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
        <p className="text-lg font-bold text-primary/70">Building your path...</p>
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
    return <LessonOnboarding onSuccess={async () => {
      // Re-fetch user so the newly assigned level is in local state
      try {
        const fresh = await getMe();
        setUser(fresh);
      } catch {
        setUser({ ...user, hasCompletedOnboarding: true });
      }
      // Route to the lessons list — NOT /student (no page there = 404)
      router.push("/student/lessons");
    }} />;
  }

  const powers = user?.progress?.energy ?? user?.power ?? 25;
  const isOutOfEnergy = powers <= 0;
  const userLevel = (user?.level === "Not Set" || !user?.level) ? "Beginner" : user?.level;
  const [activeLevel, setActiveLevel] = useState<string>(userLevel);

  const filteredLessons = lessons.filter(l => {
    const lessonLevel = (l.level || "Basic").toLowerCase();
    const target = activeLevel.toLowerCase();
    return lessonLevel === target || 
           (target === "beginner" && lessonLevel === "basic") ||
           (target === "basic" && lessonLevel === "beginner");
  });
  const sortedLessons = [...filteredLessons].sort((a, b) => {
    if (a.moduleNumber !== b.moduleNumber) return (a.moduleNumber || 1) - (b.moduleNumber || 1);
    return (a.orderIndex || 0) - (b.orderIndex || 0);
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

  const grouped = groupByCategory(sortedLessons);
  const orderedGroups = Object.entries(grouped).sort((a, b) => {
    const idxA = CATEGORY_ORDER.indexOf(a[0]);
    const idxB = CATEGORY_ORDER.indexOf(b[0]);
    if (idxA === -1 && idxB === -1) return a[0].localeCompare(b[0]);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  function navigateToLesson(lesson: Lesson) {
    if (!user) { router.push("/login"); return; }
    if (powers <= 0) {
      alert("No energy left. Please wait for power to regenerate.");
      return;
    }
    router.push(`/student/lessons/${lesson._id}`);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 pt-6 px-4">

      {/* Preview Modal */}
      {previewLesson && (
        <LessonPreviewModal
          lesson={previewLesson.lesson}
          status={previewLesson.status}
          onClose={() => setPreviewLesson(null)}
          onStart={() => {
            setPreviewLesson(null);
            navigateToLesson(previewLesson.lesson);
          }}
        />
      )}

      {/* Sticky Stats Bar */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-4 flex items-center justify-between mx-2 sm:mx-0">
        <div className="flex items-center gap-3 text-primary font-bold text-lg">
          <span className="p-2.5 bg-primary/10 rounded-xl shadow-inner">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="hidden sm:inline tracking-tight">Curriculum Path</span>
        </div>
        <div className="flex items-center gap-8 font-bold">
          <div className="flex items-center gap-2 text-orange-600" title="Daily Streak">
            <Flame className="w-6 h-6 fill-current drop-shadow-sm" /> 
            <span className="text-xl font-black">{user?.progress?.currentStreak || 0}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 transition-colors",
              powers > 10 ? "text-indigo-600" : powers > 0 ? "text-amber-500" : "text-error"
            )}
            title="Training Energy"
          >
            <Zap className="w-6 h-6 fill-current drop-shadow-sm" />
            <span className="text-xl font-bold">{powers}</span>
            <span className="text-sm font-bold opacity-40">/25</span>
          </div>
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm mx-2 sm:mx-0">
        {["Beginner", "Elementary", "Intermediate", "Advanced"].map((lv) => (
          <button
            key={lv}
            onClick={() => setActiveLevel(lv)}
            className={cn(
              "flex-1 min-w-[140px] py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border-2",
              activeLevel === lv 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                : "bg-slate-50 text-primary/60 border-transparent hover:bg-slate-100 hover:text-slate-600"
            )}
          >
            {lv}
          </button>
        ))}
      </div>

      {/* Page Header */}
      <div className="px-4 py-6">
        <h2 className="text-3xl md:text-4xl lg:text-4xl font-black tracking-tight text-primary flex items-center gap-3 uppercase">
          <BookOpen className="h-8 w-8 text-secondary" /> {activeLevel} Curriculum
        </h2>
        <p className="mt-4 text-base md:text-lg font-semibold text-slate-700 leading-relaxed">
           Embark on your {activeLevel} path. Master these fundamentals to build a strong linguistic base.
        </p>
      </div>

      {/* Out of Energy */}
      {isOutOfEnergy && (
        <div className="bg-soft/20 border-2 border-soft rounded-3xl p-6 text-center shadow-lg">
          <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-slate-800 mb-2 uppercase tracking-tight">Out of Energy!</h3>
          <p className="text-slate-600 mb-4 font-medium text-sm">
            You've used up all your daily powers. Take a break!<br />
            1 Power regenerates every 1 hour.
          </p>
        </div>
      )}

      {/* Unified Lesson Grid */}
      {!isOutOfEnergy && filteredLessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 pb-20">
          {sortedLessons.map((lesson) => {
            const status = lessonStatus.get(lesson._id) || "locked";
            const isPaidPlan = user?.subscription?.plan && ['PRO', 'PREMIUM', 'BUSINESS'].includes(user.subscription.plan);
            const isPremiumUser = user?.isPremium || isPaidPlan;
            
            const isLocked = status === "locked" || (lesson.isPremiumOnly && !isPremiumUser);
            const isCurrent = status === "unlocked" && !isLocked;
            const isDone = status === "completed";

            return (
              <div
                key={lesson._id}
                onClick={() => setPreviewLesson({
                  lesson,
                  status: isDone ? "completed" : "unlocked"
                })}
                className={cn(
                  "group flex flex-col gap-5 rounded-[2.5rem] border p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2",
                  isLocked 
                    ? "bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed"
                    : isDone
                      ? "bg-emerald-50/30 border-emerald-100 hover:shadow-2xl hover:shadow-emerald-100/50"
                      : "bg-white border-slate-100 shadow-xl shadow-slate-200/40 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl border flex items-center justify-center transition-all duration-500",
                    isLocked ? "bg-slate-200 text-slate-400" : isDone ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-primary text-white shadow-lg shadow-primary/20 group-hover:rotate-12"
                  )}>
                    {isDone ? <CheckCircle2 className="w-8 h-8" /> : isLocked ? <Lock className="w-6 h-6" /> : <BookOpen className="w-8 h-8" />}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                    "text-indigo-600 bg-indigo-50 border-indigo-100"
                  )}>
                    {activeLevel} - STAGE {lesson.orderIndex}
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className={cn(
                    "text-xl font-black uppercase tracking-tight leading-tight",
                    isLocked ? "text-slate-400" : "text-slate-800"
                  )}>
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                      {lesson.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                   <span className={cn(
                     "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
                     lesson.isPremiumOnly ? "text-amber-600 bg-amber-50 border-amber-100" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                   )}>
                      {lesson.isPremiumOnly ? "★ Premium" : "✓ Free"}
                   </span>
                   {isDone && (
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
                        Mastered
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
















