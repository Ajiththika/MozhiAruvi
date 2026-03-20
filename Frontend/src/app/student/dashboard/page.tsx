"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { BookOpen, Target, Flame, Trophy, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getLessons, Lesson } from "@/services/lessonService";
import { getMyJoinRequests, JoinRequest } from "@/services/eventService";

export default function StudentDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getLessons(), getMyJoinRequests()])
      .then(([u, { lessons }, jrs]) => {
        setUser(u);
        setLessons(lessons);
        setJoinRequests(jrs);
      })
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const nextLesson = lessons[0] ?? null;
  const upcomingEvents = joinRequests.filter(
    (r) => r.status === "approved" || r.status === "pending"
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
          Welcome back, {user?.name?.split(" ")[0] ?? "Student"}! 👋
        </h2>
        <p className="text-slate-600 dark:text-slate-600 mt-1">
          Here is an overview of your Tamil learning progress.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Lessons Available"
          value={String(lessons.length)}
          icon={BookOpen}
          trend="neutral"
          trendValue="In curriculum"
          className="border-blue-100 bg-mozhi-light/50/30 dark:border-blue-900/40 dark:bg-mozhi-dark/50"
        />
        <StatCard
          title="Event RSVPs"
          value={String(upcomingEvents.length)}
          icon={Flame}
          trend="neutral"
          trendValue="Upcoming"
        />
        <StatCard
          title="Account Type"
          value={user?.role === "user" ? "Free" : "Premium"}
          icon={Trophy}
          trend="neutral"
          trendValue={user?.role === "user" ? "Upgrade to unlock" : "Full access"}
        />
        <StatCard
          title="Accuracy"
          value="—"
          icon={Target}
          trend="neutral"
          trendValue="Complete a quiz"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Next Lesson */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-600">
            {nextLesson ? "Start your next lesson" : "Curriculum"}
          </h3>

          {nextLesson ? (
            <div className="mt-4 flex flex-1 flex-col justify-center rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-/50 dark:bg-slate-900/50">
              <div>
                <span className="inline-flex rounded-full bg-mozhi-light px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-mozhi-primary/20 dark:text-blue-300">
                  Module {nextLesson.moduleNumber}
                </span>
                <h4 className="mt-2 text-xl font-bold text-slate-600 dark:text-slate-600">
                  {nextLesson.title}
                </h4>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-600">
                  {nextLesson.description ?? "Continue your learning journey."}
                </p>
              </div>
              <div className="mt-6 flex items-center justify-end">
                <Link
                  href={`/student/lessons/${nextLesson._id}`}
                  className="rounded-lg bg-mozhi-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-mozhi-primary transition-colors flex items-center gap-2"
                >
                  Start Lesson <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 p-10 text-center">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-600">No lessons published yet.</p>
                <Link href="/student/lessons" className="mt-2 inline-block text-sm font-semibold text-mozhi-primary hover:text-mozhi-secondary">
                  Browse Curriculum →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-600">My Events</h3>
            {upcomingEvents.length > 0 && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mozhi-light text-xs font-medium text-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary">
                {upcomingEvents.length}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-1 flex-col gap-3">
            {upcomingEvents.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-200">
                <p className="text-sm text-slate-600 dark:text-slate-600">No RSVPs yet.</p>
                <Link href="/student/events" className="mt-3 text-sm font-medium text-mozhi-primary hover:text-mozhi-secondary dark:text-mozhi-secondary">
                  Browse Events →
                </Link>
              </div>
            ) : (
              upcomingEvents.slice(0, 3).map((req) => {
                const event = typeof req.event === "object" ? req.event : null;
                return (
                  <div key={req._id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-200">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500">
                      E
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-600 truncate">
                        {event?.title ?? "Event"}
                      </p>
                      <p className="text-xs text-slate-600 capitalize">{req.status}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}