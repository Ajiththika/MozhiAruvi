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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Colored accent strip */}
        <div className={cn("h-2 w-full", status === "completed" ? "bg-success" : "bg-secondary")} />

        <div className="p-8 space-y-6">
          {/* Badge + Title */}
          <div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.25em] px-2.5 py-1 rounded-full",
              status === "completed" ? "bg-success/10 text-success" : "bg-secondary/10 text-secondary"
            )}>
              {status === "completed" ? "Completed" : "Available"}
            </span>
            <h2 className="mt-3 text-2xl font-black text-gray-900 tracking-tight">{lesson.title}</h2>
            {lesson.category && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{lesson.category}</p>
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
              <ListChecks className="w-3.5 h-3.5" />
              <span>{(lesson as any).questionCount || "?"} Questions</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-50 px-3 py-2 rounded-xl">
              <Clock className="w-3.5 h-3.5" />
              <span>~{estimatedMin} min</span>
            </div>
            {lesson.isPremiumOnly && (
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
                <Star className="w-3 h-3 fill-current" /> Premium
              </div>
            )}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onStart}
              className={cn(
                "flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-105 active:scale-95",
                status === "completed"
                  ? "bg-success shadow-success/25"
                  : "bg-secondary shadow-secondary/25"
              )}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              {status === "completed" ? "Review" : "Start Lesson"}
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
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-extrabold text-lg">
          <span className="p-2 bg-primary/10 rounded-full">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="hidden sm:inline">Learning Path</span>
        </div>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-1.5 text-orange-500" title="Current Daily Streak">
            <Flame className="w-6 h-6 fill-current" /> {user?.progress?.currentStreak || 0}
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              powers > 10 ? "text-secondary" : powers > 0 ? "text-amber-500" : "text-red-500"
            )}
            title="Daily Power"
          >
            <Zap className="w-6 h-6 fill-current" /> {powers}/25
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="px-2">
        <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white flex items-center gap-3 uppercase">
          <BookOpen className="h-6 w-6 text-secondary" /> Learning Path — {userLevel}
        </h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Complete categories to earn badges in your journey.
        </p>
      </div>

      {/* Out of Energy */}
      {isOutOfEnergy && (
        <div className="bg-soft/20 border-2 border-soft rounded-3xl p-6 text-center shadow-lg">
          <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-gray-800 mb-2 uppercase tracking-tight">Out of Energy!</h3>
          <p className="text-gray-600 mb-4 font-medium text-sm">
            You've used up all your daily powers. Take a break!<br />
            1 Power regenerates every 1 hour.
          </p>
        </div>
      )}

      {orderedGroups.length === 0 && !isOutOfEnergy && (
        <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm">
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
            <div className="mb-6 flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg text-white ring-4 transition-transform hover:scale-105 shrink-0",
                badgeEarned
                  ? "bg-success shadow-success/20 ring-success/10"
                  : "bg-secondary shadow-secondary/20 ring-secondary/10"
              )}>
                {badgeEarned
                  ? <CheckCircle2 className="h-6 w-6" />
                  : <BookOpen className="h-6 w-6 text-white" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight flex items-center gap-2 flex-wrap">
                  {category}
                  {badgeEarned && (
                    <span className="bg-success/15 text-success text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> MASTER
                    </span>
                  )}
                </h3>
                {/* Animated category progress bar */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        badgeEarned ? "bg-success" : "bg-secondary"
                      )}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                    {completedCat}/{totalCat}
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson nodes with connector line */}
            <div className="relative flex flex-col gap-4 pl-14">
              {/* Connector line — fills with progress */}
              <div className="absolute inset-y-2 left-[1.45rem] ml-[1px] w-[3px] bg-gray-100 rounded-full overflow-hidden">
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
                      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/80 p-4 opacity-55 grayscale select-none cursor-not-allowed">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-200">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-400 truncate text-sm">{lesson.title}</p>
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
                              : "border-gray-100 bg-white hover:border-secondary/30 hover:shadow-md"
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
                            "font-bold truncate text-sm uppercase tracking-wide",
                            isDone ? "text-gray-600" : "text-gray-800"
                          )}>
                            {lesson.title}
                          </p>
                          {lesson.type && (
                            <span className="text-[10px] text-primary/70 uppercase font-black tracking-widest mt-0.5 block">
                              {lesson.type} Practice
                            </span>
                          )}
                        </div>

                        {/* CTA pill — slides in on hover */}
                        <div className={cn(
                          "shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl",
                          "opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200",
                          isDone
                            ? "bg-success/10 text-success"
                            : "bg-secondary/10 text-secondary"
                        )}>
                          {isDone ? "Review" : isCurrent ? "Continue" : "Start"}
                          <ArrowRight className="w-3 h-3" />
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
