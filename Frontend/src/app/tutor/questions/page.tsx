"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare, Filter, Search, CheckCircle2, Loader2, AlertCircle,
  Video, Layers, Calendar, Clock, ArrowRight, User, Ban, CheckCircle
} from "lucide-react";
import {
  getPendingRequests, resolveRequest, acceptRequest, declineRequest, TutorRequest,
} from "@/services/tutorService";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  question: { label: "Question", icon: MessageSquare, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  live_class: { label: "Live Class", icon: Video, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
  multi_class: { label: "Package", icon: Layers, color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
};

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "replied" | "resolved">("all");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getPendingRequests();
      setRequests(data);
    } catch (e: any) {
      setError("Could not load requests. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, action: "accept" | "decline") => {
    setSubmitting(id);
    try {
      if (action === "accept") await acceptRequest(id);
      else await declineRequest(id);
      await fetchRequests();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Action failed.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleReply = async (id: string) => {
    const text = replies[id]?.trim();
    if (!text) return;
    setSubmitting(id);
    try {
      const updated = await resolveRequest(id, text);
      setRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setReplies((prev) => ({ ...prev, [id]: "" }));
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to send reply.");
    } finally {
      setSubmitting(null);
    }
  };

  const filtered = requests.filter((r) => {
    const matchesSearch = !search.trim() || r.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
      <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Loading Incoming Requests...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-20 px-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-8 rounded-full bg-mozhi-primary" />
              <span className="text-[10px] font-black text-mozhi-primary uppercase tracking-[0.3em]">Teacher Inbox</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Requests</h1>
           <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Manage your student sessions, questions, and learning packages.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 flex gap-1 border border-slate-100 dark:border-slate-700">
              {(["all", "pending", "replied"] as const).map(t => (
                 <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all",
                    filter === t ? "bg-white dark:bg-slate-700 text-mozhi-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                 >
                    {t}
                 </button>
              ))}
           </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
               <CheckCircle2 className="h-10 w-10 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No matching requests</h3>
            <p className="text-sm text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((r) => {
            const config = TYPE_CONFIG[r.requestType] || TYPE_CONFIG.question;
            const Icon = config.icon;
            const isResolved = r.status === "replied" || r.status === "resolved";
            const isPending = r.status === "pending";

            return (
              <div
                key={r._id}
                className={cn(
                  "group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border transition-all duration-300",
                  isPending ? "border-mozhi-primary/20 shadow-xl shadow-mozhi-primary/[0.03]" : "border-slate-200 dark:border-slate-800 opacity-90 hover:opacity-100"
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Content */}
                  <div className="flex-1 p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", config.color)}>
                           <Icon className="h-6 w-6" />
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Student ID: {(r as any).studentId?.name || "Member"}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(r.createdAt).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{config.label} Request</h3>
                        </div>
                      </div>
                      
                      <div className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] border",
                        isPending ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                         {r.status}
                      </div>
                    </div>

                    <div className="relative rounded-3xl bg-slate-50 dark:bg-slate-800/50 p-6 mb-6">
                       <p className="text-md font-medium text-slate-700 dark:text-slate-200 leading-relaxed italic">
                         "{r.content}"
                       </p>
                    </div>

                    {/* Metadata Section */}
                    {r.metadata && Object.keys(r.metadata).length > 0 && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 px-1">
                          {r.metadata.preferredTime && (
                             <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <Clock className="h-4 w-4 text-mozhi-primary" />
                                <span>Preferred: <span className="text-slate-900 dark:text-slate-200">{r.metadata.preferredTime}</span></span>
                             </div>
                          )}
                          {r.metadata.sessionsCount && (
                             <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                                <Layers className="h-4 w-4 text-mozhi-primary" />
                                <span>Sessions: <span className="text-slate-900 dark:text-slate-200">{r.metadata.sessionsCount} classes</span></span>
                             </div>
                          )}
                       </div>
                    )}

                    {r.teacherReply && (
                       <div className="mt-4 rounded-3xl bg-mozhi-primary/5 border border-mozhi-primary/10 p-6 animate-in slide-in-from-top-2">
                          <p className="text-[10px] font-black text-mozhi-primary uppercase tracking-widest mb-2">Your Professional Reply</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed">{r.teacherReply}</p>
                       </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-80 bg-slate-50 dark:bg-slate-800/40 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-center">
                    {!isResolved ? (
                      <div className="space-y-4">
                        {isPending ? (
                          <div className="flex flex-col gap-3">
                             <button
                               onClick={() => handleStatusUpdate(r._id, "accept")}
                               disabled={submitting === r._id}
                               className="flex w-full items-center justify-center gap-2 rounded-2xl bg-mozhi-primary py-4 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-mozhi-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
                             >
                                <CheckCircle className="h-4 w-4" />
                                Accept Request
                             </button>
                             <button
                               onClick={() => handleStatusUpdate(r._id, "decline")}
                               disabled={submitting === r._id}
                               className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 dark:border-slate-700 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                             >
                                <Ban className="h-4 w-4" />
                                Decline
                             </button>
                             <p className="text-[10px] text-center text-slate-400 font-bold px-2">Accepting will allow you to send a personalized reply.</p>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in zoom-in-95 duration-300">
                            <textarea
                              rows={4}
                              value={replies[r._id] ?? ""}
                              onChange={(e) => setReplies((prev) => ({ ...prev, [r._id]: e.target.value }))}
                              placeholder="Craft your response to the student..."
                              className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm font-medium focus:ring-2 focus:ring-mozhi-primary/20 focus:outline-none transition-all"
                            />
                            <button
                              onClick={() => handleReply(r._id)}
                              disabled={submitting === r._id || !replies[r._id]?.trim()}
                              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 text-xs font-black text-white uppercase tracking-widest shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                               {submitting === r._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                               Submit Response
                            </button>
                             <p className="text-[10px] text-center text-slate-400 font-bold px-2">Fulfilling this request will credit {r.priceCredits} XP points to your balance.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
                           <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase">Request Fulfilled</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Earned {r.priceCredits} XP</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}