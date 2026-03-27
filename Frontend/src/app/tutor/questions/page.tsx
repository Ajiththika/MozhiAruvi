"use client";

import React, { useEffect, useState } from "react";
import {
  MessageSquare, Filter, Search, CheckCircle2, Loader2, AlertCircle,
  Video, Layers, Calendar, Clock, ArrowRight, User, Ban, CheckCircle, Send
} from "lucide-react";
import {
  getPendingRequests, resolveRequest, acceptRequest, declineRequest, TutorRequest,
} from "@/services/tutorService";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  question: { label: "Question", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
  live_class: { label: "Live Class", icon: Video, color: "text-emerald-600 bg-emerald-50" },
  multi_class: { label: "Package", icon: Layers, color: "text-violet-600 bg-violet-50" },
};

export default function TeacherRequestsPage() {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "replied" | "resolved">("pending");

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
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Loading Incoming Requests...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500 pb-20 px-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 pb-12 border-b border-gray-100">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-10 rounded-full bg-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Interaction Hub</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight leading-tight">Incoming Sessions</h1>
           <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-xl">Efficiently manage your student questions, live bookings, and teaching packages from a single dashboard.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="bg-gray-50 rounded-2xl p-1.5 flex gap-1 border border-gray-100 shadow-inner">
              {(["all", "pending", "replied", "resolved"] as const).map(t => (
                 <button 
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-300",
                    filter === t ? "bg-white text-primary shadow-xl shadow-slate-200/40 border border-gray-100" : "text-gray-400 hover:text-gray-600"
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
            <div className="h-20 w-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-6">
               <CheckCircle2 className="h-10 w-10 text-gray-200 dark:text-gray-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 uppercase tracking-widest">No matching requests</h3>
            <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
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
                  "group relative overflow-hidden rounded-2xl bg-white border transition-all duration-300",
                  isPending ? "border-primary/20 shadow-xl shadow-primary/[0.03]" : "border-gray-100  opacity-90 hover:opacity-100"
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Left: Content */}
                  {/* Left: Content */}
                  <div className="flex-1 p-10">
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div className={cn("h-14 w-14 rounded-[1.25rem] flex items-center justify-center shadow-sm", config.color)}>
                           <Icon className="h-7 w-7" />
                        </div>
                       <div>
                           <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student: {typeof (r as any).studentId === 'object' ? (r as any).studentId?.name : "Verified Learner"}</span>
                              <span className="h-1 w-1 rounded-full bg-gray-200" />
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(r.createdAt).toLocaleDateString()}</span>
                           </div>
                           <h3 className="text-xl font-bold text-gray-800">{config.label} Request</h3>
                           {typeof (r as any).lessonId === 'object' && (r as any).lessonId?.title && (
                             <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary/5 border border-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                               📖 {(r as any).lessonId.title}{(r as any).lessonId.moduleNumber ? ` · Module ${(r as any).lessonId.moduleNumber}` : ""}
                             </div>
                           )}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm",
                        isPending ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                         {r.status}
                      </div>
                    </div>

                    <div className="relative rounded-[2rem] bg-gray-50 p-8 border border-gray-100 mb-8">
                       <p className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Initial Question</p>
                       <p className="text-lg font-bold text-gray-700 leading-relaxed italic">
                         "{r.content}"
                       </p>
                    </div>

                    {/* Threaded conversation */}
                    {r.messages && r.messages.length > 0 && (
                       <div className="space-y-6 mb-8">
                          {r.messages.map((msg, idx) => (
                             <div key={idx} className={cn(
                                "p-6 rounded-2xl border transition-all animate-in slide-in-from-bottom-2",
                                msg.senderRole === "teacher" 
                                   ? "bg-primary/5 border-primary/10 ml-8" 
                                   : "bg-white border-gray-100 mr-8 shadow-sm"
                             )}>
                                <div className="flex items-center gap-2 mb-3">
                                   <User className={cn("h-3 w-3", msg.senderRole === "teacher" ? "text-primary" : "text-gray-400")} />
                                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                      {msg.senderRole === "teacher" ? "Your Response" : "Follow-up Question"}
                                   </span>
                                   <span className="text-[9px] text-gray-300 ml-auto">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-line">{msg.content}</p>
                             </div>
                          ))}
                       </div>
                    )}
                    {/* Metadata Section */}
                    {r.metadata && (r.metadata.preferredTime || r.metadata.sessionsCount) && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 px-2">
                          {r.metadata.preferredTime && (
                             <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                <Clock className="h-4.5 w-4.5 text-primary" />
                                <span>Requested Time: <span className="text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-100 ml-1">{r.metadata.preferredTime}</span></span>
                             </div>
                          )}
                          {r.metadata.sessionsCount && (
                             <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                <Layers className="h-4.5 w-4.5 text-secondary" />
                                <span>Package Details: <span className="text-gray-800 bg-white px-3 py-1 rounded-lg border border-gray-100 ml-1">{r.metadata.sessionsCount} classes</span></span>
                             </div>
                          )}
                       </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-96 bg-gray-50 border-t lg:border-t-0 lg:border-l border-gray-100 p-10 flex flex-col justify-center">
                    {r.status === "declined" ? (
                       <div className="flex flex-col items-center justify-center text-center py-10 opacity-50">
                          <Ban className="h-8 w-8 text-gray-400 mb-4" />
                          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Declined</h4>
                       </div>
                    ) : r.status === "pending" ? (
                      <div className="flex flex-col gap-4">
                         <button
                           onClick={() => handleStatusUpdate(r._id, "accept")}
                           disabled={submitting === r._id}
                           className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white py-5 text-xs font-bold text-white shadow-2xl transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50"
                         >
                            <CheckCircle className="h-5 w-5" />
                            Accept Request
                         </button>
                         <button
                           onClick={() => handleStatusUpdate(r._id, "decline")}
                           disabled={submitting === r._id}
                           className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-white border border-gray-100 py-5 text-xs font-bold text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 shadow-sm"
                         >
                            <Ban className="h-5 w-5" />
                            Decline
                         </button>
                         <p className="text-[11px] text-center text-gray-400 font-medium px-4 leading-relaxed">Accepting the session will notify the student and allow you to submit your response.</p>
                      </div>
                    ) : (
                      <div className="space-y-5 animate-in zoom-in-95 duration-300">
                        <textarea
                          rows={4}
                          value={replies[r._id] ?? ""}
                          onChange={(e) => setReplies((prev) => ({ ...prev, [r._id]: e.target.value }))}
                          placeholder={r.status === "replied" ? "Send a follow-up response..." : "Craft your expert response..."}
                          className="w-full resize-none rounded-[1.5rem] border border-gray-100 bg-white p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all shadow-xl shadow-slate-200/20"
                        />
                        <button
                          onClick={() => handleReply(r._id)}
                          disabled={submitting === r._id || !replies[r._id]?.trim()}
                          className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] bg-primary py-5 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-white disabled:opacity-50 transition-all active:scale-95"
                        >
                           {submitting === r._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                           {r.status === "replied" ? "Send Follow-up" : "Submit Interaction"}
                        </button>
                         <p className="text-[11px] text-center text-gray-400 font-medium px-4 leading-relaxed">
                            {r.status === "replied" ? "Keep the communication going to solve the doubt." : `Completing this interaction will credit ${r.priceCredits} XP to your balance.`}
                         </p>
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
