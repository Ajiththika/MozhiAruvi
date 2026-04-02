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

  const filteredLessons = lessons.filter(l => {
    const lessonLevel = (l.level || "Basic").toLowerCase();
    const target = userLevel.toLowerCase();
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

      {/* Page Header */}
      <div className="px-4 py-6">
        <h2 className="text-3xl md:text-4xl lg:text-4xl font-black tracking-tight text-primary flex items-center gap-3 uppercase">
          <BookOpen className="h-8 w-8 text-indigo-500" /> Path Overview
        </h2>
        <p className="mt-4 text-base md:text-lg font-semibold text-slate-700 leading-relaxed">
          Master each category to unlock professional certifications and track your linguistic growth in {userLevel}.
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

      {orderedGroups.length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-primary/60 font-bold uppercase tracking-widest text-sm">
          No lessons are ready yet.
        </div>
      )}

      {/* Category Sections */}
      {!isOutOfEnergy && orderedGroups.map(([category, categoryLessons]) => {
        const totalCat = categoryLessons.length;
        const completedCat = categoryLessons.filter(l => progressMap.get(l._id)?.isCompleted).length;
        const badgeEarned = totalCat > 0 && completedCat === totalCat;
        const progressPct = totalCat > 0 ? Math.round((completedCat / totalCat) * 100) : 0;

        return (
          <section key={category} className="relative">
            {/* Category header */}
            <div className="mb-8 flex items-center gap-5">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl shadow-2xl text-white border-2 border-white transition-all hover:scale-110 shrink-0",
                badgeEarned
                  ? "bg-success shadow-success/40"
                  : "bg-indigo-600 shadow-indigo-600/30"
              )}>
                {badgeEarned
                  ? <CheckCircle2 className="h-7 w-7" />
                  : <BookOpen className="h-7 w-7 text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black text-primary uppercase tracking-tight flex items-center gap-3 flex-wrap">
                  {category}
                  {badgeEarned && (
                    <span className="bg-success/15 text-success text-xs font-bold tracking-wider px-3 py-1 rounded-full flex items-center gap-2 border border-success/20">
                      <CheckCircle2 className="w-4 h-4" /> MASTER
                    </span>
                  )}
                </h3>
                {/* Animated category progress bar */}
                <div className="mt-3 flex items-center gap-4">
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-1000 shadow-sm",
                        badgeEarned ? "bg-success" : "bg-indigo-500"
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
                    {completedCat} / {totalCat}
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson nodes with connector line */}
            <div className="relative flex flex-col gap-4 pl-14">
              {/* Connector line — fills with progress */}
              <div className="absolute inset-y-2 left-[1.45rem] ml-[1px] w-[3px] bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "rounded-full transition-all duration-700",
                    badgeEarned ? "bg-success" : "bg-secondary/50"
                  )}
                  style={{ height: `${progressPct}%` }}
                />
              </div>

              {categoryLessons.map((lesson) => {
                const status = lessonStatus.get(lesson._id) || "locked";
                const isPaidPlan = user?.subscription?.plan && ['PRO', 'PREMIUM', 'BUSINESS'].includes(user.subscription.plan);
                const isPremiumUser = user?.isPremium || isPaidPlan;
                
                // Lock if naturally locked by sequence OR if premium-only and user is not premium
                const isLocked = status === "locked" || (lesson.isPremiumOnly && !isPremiumUser);
                
                const isCurrent = status === "unlocked" && !isLocked;
                const isDone = status === "completed";

                return (
                  <div key={lesson._id} className="relative">
                    {/* Node dot */}
                    <div className={cn(
                      "absolute -left-[32px] top-1/2 -translate-y-1/2 z-10 rounded-full border-[3px] bg-white transition-all duration-300",
                      isDone
                        ? "h-5 w-5 border-success scale-110"
                        : isCurrent
                          ? "h-5 w-5 border-secondary ring-4 ring-secondary/20 animate-pulse"
                          : "h-4 w-4 border-slate-300"
                    )}>
                      {isDone && <div className="absolute inset-0.5 rounded-full bg-success/40" />}
                    </div>

                    {/* LOCKED card */}
                    {isLocked ? (
                      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 opacity-55 grayscale select-none cursor-not-allowed">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200">
                          <Lock className="h-5 w-5 text-primary/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-primary/60 truncate text-sm">{lesson.title}</p>
                          {lesson.isPremiumOnly && (
                            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase text-amber-700 tracking-tighter">
                              Premium Path
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* UNLOCKED / COMPLETED card */
                      <div
                        onClick={() => setPreviewLesson({
                          lesson,
                          status: isDone ? "completed" : "unlocked"
                        })}
                        className={cn(
                          "group flex items-center gap-4 rounded-2xl border p-4 cursor-pointer",
                          "transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99]",
                          isDone
                            ? "border-success/25 bg-success/5 hover:border-success/40 hover:shadow-lg hover:shadow-success/10"
                            : isCurrent
                              ? "border-secondary/40 bg-white shadow-lg shadow-secondary/10 hover:shadow-xl hover:border-secondary/60 ring-2 ring-secondary/10"
                              : "border-slate-100 bg-white hover:border-secondary/30 hover:shadow-md"
                        )}
                      >
                        {/* Icon */}
                        <div className={cn(
                          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                          isDone
                            ? "bg-success/15 group-hover:bg-success/25"
                            : "bg-primary/10 group-hover:bg-primary/20"
                        )}>
                          {isDone
                            ? <CheckCircle2 className="h-6 w-6 text-success" />
                            : <BookOpen className="h-6 w-6 text-primary" />
                          }
                        </div>

                        {/* Title + type */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-bold truncate text-base uppercase tracking-tight",
                            isDone ? "text-primary/70" : "text-primary"
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.type && (
                            <span className="text-xs text-primary/80 uppercase font-bold tracking-widest mt-1 block">
                              {lesson.type} Core Practice
                            </span>
                          )}
                        </div>

                        {/* CTA pill — slides in on hover */}
                        <div className={cn(
                          "shrink-0 flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl border opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all duration-300 shadow-sm",
                          isDone
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100"
                        )}>
                          <span className="flex items-center gap-2">
                            {isDone ? "Retake" : isCurrent ? "Continue" : "Begin"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </span>
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
















