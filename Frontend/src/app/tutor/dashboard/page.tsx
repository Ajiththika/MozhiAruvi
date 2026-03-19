"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, MessageSquare, Star, ToggleRight, ToggleLeft, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getPendingRequests, TutorRequest, updateTutorAvailability } from "@/services/tutorService";
import { getEvents, MozhiEvent } from "@/services/eventService";

export default function TutorDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [pendingQs, setPendingQs] = useState<TutorRequest[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getPendingRequests(), getEvents()])
      .then(([u, qs, evs]) => {
        setUser(u);
        setIsAvailable(u.isTutorAvailable ?? false);
        setPendingQs(qs.filter((q) => q.status === "pending" || q.status === "accepted"));
        // Only show events where organizedBy matches user
        setEvents(evs);
      })
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  const handleAvailabilityToggle = async () => {
    setToggling(true);
    try {
      await updateTutorAvailability(!isAvailable);
      setIsAvailable((v) => !v);
    } catch {
      // silent
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
            Welcome, {user?.name?.split(" ")[0] ?? "Tutor"}! 👩‍🏫
          </h2>
          <p className="text-slate- dark:text-slate- mt-1">
            Monitor your student engagement and session activity.
          </p>
        </div>

        {/* Availability Quick Toggle */}
        <button
          onClick={handleAvailabilityToggle}
          disabled={toggling}
          className={`flex items-center gap-3 rounded-2xl border px-5 py-3 text-sm font-bold shadow-sm transition-colors ${
            isAvailable
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "border-slate- bg-white text-slate- hover:bg-slate- dark:border-slate- dark:bg-slate- dark:text-slate-"
          } disabled:opacity-60`}
        >
          {isAvailable ? (
            <ToggleRight className="h-5 w-5" />
          ) : (
            <ToggleLeft className="h-5 w-5" />
          )}
          {isAvailable ? "Visible to Students" : "Hidden from Students"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Questions"
          value={String(pendingQs.length)}
          icon={MessageSquare}
          trend={pendingQs.length > 0 ? "up" : "neutral"}
          trendValue={pendingQs.length > 0 ? "Need reply" : "All caught up"}
          className={pendingQs.length > 0 ? "border-red-100 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/20" : ""}
        />
        <StatCard
          title="Community Events"
          value={String(events.length)}
          icon={Users}
          trend="neutral"
          trendValue="Platform-wide"
        />
        <StatCard
          title="Status"
          value={isAvailable ? "Active" : "Away"}
          icon={Star}
          trend="neutral"
          trendValue={isAvailable ? "Accepting students" : "Not visible"}
          className={isAvailable ? "border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20" : ""}
        />
        <StatCard
          title="Profile"
          value={user?.name ?? "—"}
          icon={Users}
          trend="neutral"
          trendValue="Teacher account"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <div className="lg:col-span-2 flex flex-col rounded-xl border border-slate- bg-white p-6 shadow-sm dark:border-slate- dark:bg-slate-">
          <h3 className="text-lg font-semibold text-slate- dark:text-slate- mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Answer Questions", desc: `${pendingQs.length} pending`, href: "/tutor/questions", color: "bg-mozhi-primary hover:bg-mozhi-primary" },
              { label: "Manage Schedule", desc: "Set your availability", href: "/tutor/schedule", color: "bg-mozhi-primary hover:bg-mozhi-primary" },
              { label: "Host an Event", desc: "Create a group session", href: "/tutor/events", color: "bg-emerald-600 hover:bg-emerald-500" },
              { label: "Edit Profile", desc: "Update your public info", href: "/tutor/profile", color: "bg-slate- hover:bg-slate- dark:bg-slate- dark:hover:bg-slate-" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`${action.color} flex items-center justify-between rounded-xl p-4 text-white transition-colors shadow-sm`}
              >
                <div>
                  <p className="font-bold text-sm">{action.label}</p>
                  <p className="text-xs opacity-80 mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-70" />
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Questions Preview */}
        <div className="flex flex-col rounded-xl border border-slate- bg-white p-6 shadow-sm dark:border-slate- dark:bg-slate-">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate- dark:text-slate-">New Questions</h3>
            {pendingQs.length > 0 && (
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-400">
                {pendingQs.length}
              </span>
            )}
          </div>

          {pendingQs.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate- p-6 text-center dark:border-slate-">
              <p className="text-sm text-slate- dark:text-slate-">No pending questions 🎉</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingQs.slice(0, 3).map((q) => (
                <div key={q._id} className="flex flex-col gap-1.5 rounded-lg border border-slate- p-4 hover:bg-slate- dark:border-slate- dark:hover:bg-slate-/60 transition-colors">
                  <p className="text-sm font-medium text-slate- dark:text-slate- line-clamp-2">
                    {q.question}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-">{new Date(q.createdAt).toLocaleDateString()}</p>
                    <Link href="/tutor/questions" className="text-xs font-bold text-mozhi-primary dark:text-mozhi-secondary hover:underline">
                      Reply →
                    </Link>
                  </div>
                </div>
              ))}
              {pendingQs.length > 3 && (
                <Link href="/tutor/questions" className="text-center text-xs font-bold text-mozhi-primary hover:text-mozhi-secondary dark:text-mozhi-secondary mt-1">
                  View all {pendingQs.length} questions →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}