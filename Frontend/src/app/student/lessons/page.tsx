"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, AlertCircle, Lock, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { getLessons, Lesson } from "@/services/lessonService";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLessons()
      .then(setLessons)
      .catch(() => setError("Could not load lessons. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const grouped = groupByModule(lessons);

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-mozhi-secondary" /> Your Curriculum
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-600">
          Follow the path, complete lessons, and earn XP as you progress.
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
        <div className="py-20 text-center text-slate-600 dark:text-slate-600">
          No lessons have been published yet. Check back soon!
        </div>
      )}

      {!loading && !error && Object.entries(grouped).map(([module, moduleLessons]) => (
        <section key={module}>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mozhi-primary text-sm font-bold text-white">
              {module}
            </div>
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-600">
              Module {module}
            </h3>
            <span className="text-xs font-medium text-slate-600">
              {moduleLessons.length} lesson{moduleLessons.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {moduleLessons
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((lesson, i) => (
                <Link
                  key={lesson._id}
                  href={`/student/lessons/${lesson._id}`}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-200 dark:bg-slate-50 dark:hover:border-blue-700"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-50">
                    {lesson.isPremiumOnly ? (
                      <Lock className="h-4 w-4 text-amber-500" />
                    ) : i === 0 ? (
                      <Circle className="h-4 w-4 text-mozhi-secondary" />
                    ) : (
                      <Circle className="h-4 w-4 text-slate-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-600 dark:text-slate-600 truncate">
                      {lesson.title}
                    </p>
                    {lesson.description && (
                      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-600 line-clamp-1">
                        {lesson.description}
                      </p>
                    )}
                  </div>

                  {lesson.isPremiumOnly && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-500">
                      Premium
                    </span>
                  )}

                  <div className="shrink-0 text-slate-600 group-hover:text-mozhi-secondary transition-colors dark:text-slate-600 dark:group-hover:text-mozhi-secondary">
                    →
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}