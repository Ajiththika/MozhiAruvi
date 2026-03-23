"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, MessageSquare, Star, ToggleRight, ToggleLeft, Loader2, AlertCircle, ArrowRight, Video, Layers, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getPendingRequests, TutorRequest, updateTutorAvailability } from "@/services/tutorService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { cn } from "@/lib/utils";
import Button from "@/components/common/Button";

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
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 tracking-tight animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const activeRequests = pendingQs.length;

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-secondary" />
               <span className="text-xs font-bold text-secondary tracking-tight">Tutor portal</span>
           </div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">Hello, {user?.name?.split(" ")[0]}!</h1>
           <p className="text-base text-slate-700 font-medium leading-relaxed max-w-xl">
             You have <span className="text-primary font-bold">{activeRequests} student requests</span> waiting for your expert guidance today.
           </p>
        </div>

        {/* Availability Quick Toggle */}
        <button
          onClick={handleAvailabilityToggle}
          disabled={toggling}
          className={cn(
            "flex items-center gap-3 rounded-xl border px-5 py-3 text-xs font-semibold shadow-sm transition-all",
            isAvailable
              ? "border-success/20 bg-success/10 text-success"
              : "border-gray-200 bg-white text-slate-500"
          )}
        >
          {isAvailable ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          {isAvailable ? "Student Facing: ON" : "Student Facing: OFF"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-error bg-error/10 px-6 py-4 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Requests"
          value={String(activeRequests)}
          description="Pending student help requests"
          icon={MessageSquare}
          trend={activeRequests > 0 ? "up" : "neutral"}
          trendValue={activeRequests > 0 ? "Outstanding" : "All clear"}
          className={activeRequests > 0 ? "border-primary/10 bg-primary/5" : ""}
        />
        <StatCard
          title="Earnings/Credits"
          value={String(user?.credits ?? "0")}
          description="Total balance in your wallet"
          icon={Sparkles}
        />
        <StatCard
          title="Live Events"
          value={String(events.length)}
          description="Events you are hosting"
          icon={Video}
        />
        <StatCard
          title="Account Status"
          value={isAvailable ? "Online" : "Away"}
          description={isAvailable ? "Visible to students" : "Hidden from search"}
          icon={Star}
          className={isAvailable ? "border-success/10 bg-success/10" : ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Quick actions */}
        <div className="lg:col-span-8 flex flex-col rounded-3xl border border-gray-100 bg-white p-8 md:p-10 shadow-sm transition-all hover:shadow-xl">
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-500 tracking-[0.2em] uppercase">Operations Center</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: "Manage Requests", desc: `${activeRequests} pending`, href: "/tutor/questions", icon: MessageSquare },
                { label: "Teaching Schedule", desc: "Weekly availability", href: "/tutor/schedule", icon: Video },
                { label: "Community Events", desc: "Live group calls", href: "/tutor/events", icon: Layers },
                { label: "Public Profile", desc: "Showcase bio", href: "/tutor/profile", icon: Users },
              ].map((action) => {
                const Icon = action.icon;
                return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between rounded-3xl border border-gray-100 p-6 transition-all hover:bg-slate-50 hover:border-primary/20"
                >
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-light/30 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                       <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base tracking-tight">{action.label}</h4>
                      <p className="text-sm text-slate-600 mt-1 font-medium">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              )})}
            </div>
          </div>
        </div>

        {/* Inbox Preview */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Inbox</h3>
            {activeRequests > 0 && (
              <span className="inline-flex h-6 px-2 items-center justify-center rounded-full bg-error/10 text-[10px] font-semibold text-error">
                {activeRequests} New
              </span>
            )}
          </div>

          {activeRequests === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-100 p-8 text-center">
               <CheckCircle2 className="h-10 w-10 text-gray-200 mb-4" />
               <p className="text-xs font-semibold text-slate-400">Everything resolved</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingQs.slice(0, 3).map((q) => (
                <div key={q._id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-5 hover:bg-slate-50 transition-colors">
                   <div className="flex items-center gap-2">
                       <span className={cn(
                           "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                           q.requestType === 'question' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
                       )}>
                           {q.requestType || 'Request'}
                       </span>
                       <span className="text-xs text-slate-400 font-medium">{new Date(q.createdAt).toLocaleDateString()}</span>
                   </div>
                  <p className="text-xs font-semibold text-slate-900 line-clamp-2">
                    "{q.content}"
                  </p>
                  <Link href="/tutor/questions" className="text-xs font-semibold text-primary hover:text-secondary flex items-center gap-1">
                    Quick Reply <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
              {activeRequests > 3 && (
                <Link href="/tutor/questions" className="block text-center text-xs font-medium text-slate-400 hover:text-primary mt-4">
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