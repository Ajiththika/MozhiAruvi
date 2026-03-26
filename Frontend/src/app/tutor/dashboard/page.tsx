"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, MessageSquare, Star, ToggleRight, ToggleLeft, Loader2, AlertCircle, ArrowRight, Video, Layers, Sparkles, CheckCircle2, PenTool } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getPendingRequests, TutorRequest, updateTutorAvailability } from "@/services/tutorService";
import { getMyEvents, MozhiEvent } from "@/services/eventService";
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
    const today = new Date().toISOString().split('T')[0];
    Promise.all([getMe(), getPendingRequests(), getMyEvents()])
      .then(([u, qs, evs]) => {
        setUser(u);
        setIsAvailable(u.isTutorAvailable ?? false);
        setPendingQs(qs.filter((q) => q.status === "pending" || q.status === "accepted"));
        setEvents(evs.filter(e => e.date >= today));
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
        <p className="text-sm font-semibold text-gray-500 tracking-tight animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const activeRequests = pendingQs.length;

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-b border-gray-100 pb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-10 rounded-full bg-secondary" />
               <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Tutor Operations</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">Welcome, {user?.name?.split(" ")[0]}</h1>
           <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl">
             You have <span className="text-primary font-bold">{activeRequests} active requests</span> awaiting your expert guidance today.
           </p>
        </div>

        {/* Availability Quick Toggle */}
        <button
          onClick={handleAvailabilityToggle}
          disabled={toggling}
          className={cn(
            "flex items-center gap-4 rounded-2xl border-2 px-8 py-4 text-xs font-bold transition-all shadow-xl shadow-gray-200/10 active:scale-95",
            isAvailable
              ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "border-gray-100 bg-white text-gray-500 hover:border-secondary/30"
          )}
        >
          {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
          {isAvailable ? "Status: Accepting Students" : "Status: Away"}
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
        <div className="lg:col-span-8 flex flex-col rounded-[3rem] bg-white border border-gray-100 p-10 md:p-14 shadow-2xl shadow-gray-200/10">
          <div className="space-y-10">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
               <Layers className="h-6 w-6 text-primary" /> Operations Center
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { label: "Manage Requests", desc: `${activeRequests} pending now`, href: "/tutor/questions", icon: MessageSquare, color: "primary" },
                { label: "Write a Story", desc: "Share your Tamil expertise", href: "/student/blogs/create", icon: PenTool, color: "primary" },
                { label: "Schedule Slots", desc: "Set weekly availability", href: "/tutor/schedule", icon: Video, color: "secondary" },
                { label: "Public Profile", desc: "Update your teaching bio", href: "/tutor/profile", icon: Users, color: "secondary" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between rounded-[2.5rem] border border-gray-50 bg-white p-8 transition-all hover:bg-soft/10 hover:border-secondary/30 shadow-xl shadow-gray-200/10"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-2xl transition-all group-hover:scale-110 duration-500",
                      action.color === 'primary' ? 'bg-primary/5 text-primary border border-primary/10' : 'bg-secondary/5 text-secondary border border-secondary/10'
                    )}>
                       <Icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg tracking-tight">{action.label}</h4>
                      <p className="text-sm text-gray-500 mt-1 font-medium">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-6 w-6 text-gray-200 group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" />
                </Link>
              )})}
            </div>
          </div>
        </div>

        {/* Inbox Preview */}
        <div className="lg:col-span-4 flex flex-col rounded-[3rem] bg-white border border-gray-100 p-10 shadow-2xl shadow-gray-200/10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-bold text-gray-800">Live Inbox</h3>
            {activeRequests > 0 && (
              <span className="inline-flex h-8 px-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                {activeRequests} New
              </span>
            )}
          </div>

          {activeRequests === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-gray-100 p-10 text-center space-y-4">
               <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner">
                  <CheckCircle2 className="h-8 w-8 text-gray-200" />
               </div>
               <p className="text-sm font-bold text-gray-400">Everything resolved for now.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQs.slice(0, 3).map((q) => (
                <div key={q._id} className="flex flex-col gap-4 rounded-[2rem] border border-gray-50 bg-soft/10 p-6 hover:bg-white hover:border-secondary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                   <div className="flex items-center justify-between">
                       <div className={cn(
                            "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                            q.requestType === 'question' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        )}>
                            {q.requestType || 'Request'}
                       </div>
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</span>
                   </div>
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed">
                    "{q.content}"
                  </p>
                  <Link href="/tutor/questions" className="text-xs font-bold text-primary flex items-center gap-2 group/reply">
                    <span>Attend to student</span> 
                    <ArrowRight className="h-4 w-4 group-hover/reply:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
              {activeRequests > 3 && (
                <Link href="/tutor/questions" className="block text-center text-xs font-bold text-gray-400 hover:text-primary mt-6 tracking-widest uppercase py-4 rounded-2xl border border-dashed border-gray-100 hover:border-primary/20 transition-all">
                   +{activeRequests - 3} more interactions
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}