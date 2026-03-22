"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, MessageSquare, Star, ToggleRight, ToggleLeft, Loader2, AlertCircle, ArrowRight, Video, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getPendingRequests, TutorRequest, updateTutorAvailability } from "@/services/tutorService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { cn } from "@/lib/utils";

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
      .then(([u, qs, evRes]) => {
        setUser(u);
        setIsAvailable(u.isTutorAvailable ?? false);
        setPendingQs(qs.filter((q) => q.status === "pending" || q.status === "accepted"));
        setEvents(evRes.events);
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
        <p className="text-sm font-black text-slate-500 uppercase tracking-widest animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const activeRequests = pendingQs.length;

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Hello, {user?.name?.split(" ")[0] ?? "Tutor"}!
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            You have <span className="text-mozhi-primary font-bold">{activeRequests} student requests</span> waiting for your attention.
          </p>
        </div>

        {/* Availability Quick Toggle */}
        <button
          onClick={handleAvailabilityToggle}
          disabled={toggling}
          className={cn(
            "flex items-center gap-3 rounded-2xl border px-6 py-4 text-xs font-black uppercase tracking-widest shadow-sm transition-all",
            isAvailable
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:scale-[1.02]"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 opacity-90"
          )}
        >
          {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          {isAvailable ? "Student Facing: ON" : "Student Facing: OFF"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Requests"
          value={String(activeRequests)}
          icon={MessageSquare}
          trend={activeRequests > 0 ? "up" : "neutral"}
          trendValue={activeRequests > 0 ? "Pending" : "All clear"}
          className={activeRequests > 0 ? "border-mozhi-primary/20 bg-mozhi-primary/[0.03] shadow-sm" : ""}
        />
        <StatCard
          title="Student Credits"
          value={String(user?.credits ?? "0")}
          icon={Sparkles}
          trend="neutral"
          trendValue="XP Balance"
        />
        <StatCard
          title="Live Events"
          value={String(events.length)}
          icon={Video}
          trend="neutral"
          trendValue="Hosted by you"
        />
        <StatCard
          title="Account Status"
          value={isAvailable ? "Online" : "Away"}
          icon={Star}
          trend="neutral"
          trendValue="Visibility"
          className={isAvailable ? "border-emerald-100 bg-emerald-50/50" : ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Quick actions */}
        <div className="lg:col-span-8 flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-900 border-opacity-50">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Operations Center</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Manage Requests", desc: `${activeRequests} pending from students`, href: "/tutor/questions", icon: MessageSquare, color: "bg-mozhi-primary" },
              { label: "Teaching Schedule", desc: "Manage your weekly availability", href: "/tutor/schedule", icon: Video, color: "bg-mozhi-secondary" },
              { label: "Community Events", desc: "Create and manage live group calls", href: "/tutor/events", icon: Layers, color: "bg-emerald-600" },
              { label: "Public Profile", desc: "Showcase your expertise & bio", href: "/tutor/profile", icon: Users, color: "bg-slate-900" },
            ].map((action) => {
              const Icon = action.icon;
              return (
              <Link
                key={action.href}
                href={action.href}
                className={cn(
                    action.color,
                    "group flex items-center justify-between rounded-3xl p-6 text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 mb-3 group-hover:bg-white/20 transition-colors">
                     <Icon className="h-5 w-5" />
                  </div>
                  <p className="font-black text-sm uppercase tracking-widest">{action.label}</p>
                  <p className="text-[10px] opacity-70 mt-1 font-bold">{action.desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            )})}
          </div>
        </div>

        {/* Inbox Preview */}
        <div className="lg:col-span-4 flex flex-col rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm dark:bg-slate-900 border-opacity-50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Live Inbox</h3>
            {activeRequests > 0 && (
              <span className="inline-flex h-6 w-10 items-center justify-center rounded-full bg-red-100 text-[10px] font-black text-red-600 uppercase">
                {activeRequests} New
              </span>
            )}
          </div>

          {activeRequests === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 p-8 text-center">
               <CheckCircle2 className="h-10 w-10 text-slate-100 mb-4" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Everything resolved</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQs.slice(0, 3).map((q) => (
                <div key={q._id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-5 hover:bg-slate-50 transition-colors border-opacity-50">
                   <div className="flex items-center gap-2">
                       <span className={cn(
                           "text-[8px] font-black uppercase px-2 py-0.5 rounded-md",
                           q.requestType === 'question' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                       )}>
                           {q.requestType || 'Request'}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold">{new Date(q.createdAt).toLocaleDateString()}</span>
                   </div>
                  <p className="text-xs font-bold text-slate-600 line-clamp-2">
                    "{q.content}"
                  </p>
                  <Link href="/tutor/questions" className="text-[10px] font-black text-mozhi-primary hover:text-mozhi-secondary flex items-center gap-1 uppercase tracking-widest">
                    Quick Reply <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
              {activeRequests > 3 && (
                <Link href="/tutor/questions" className="block text-center text-[10px] font-black text-slate-400 hover:text-mozhi-primary uppercase tracking-widest mt-4">
                   +{activeRequests - 3} more requests
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}