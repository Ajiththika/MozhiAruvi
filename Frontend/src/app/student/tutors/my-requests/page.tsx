"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, Video, Layers, Clock, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, GraduationCap, XCircle, Search, Calendar
} from "lucide-react";
import { getMyTutorRequests, TutorRequest } from "@/services/tutorService";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  question: { label: "Question", icon: MessageSquare, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
  live_class: { label: "Live Class", icon: Video, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
  multi_class: { label: "Package", icon: Layers, color: "text-violet-500 bg-violet-50 dark:bg-violet-900/20" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-200" },
  accepted: { label: "Accepted", color: "bg-blue-100 text-blue-700 border-blue-200" },
  declined: { label: "Declined", color: "bg-red-100 text-red-700 border-red-200" },
  replied: { label: "Replied", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  resolved: { label: "Resolved", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default function MyTutorRequestsPage() {
  const [requests, setRequests] = useState<TutorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMyTutorRequests()
      .then(setRequests)
      .catch(() => setError("Could not load your requests. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = requests.filter(r => 
    !search.trim() || 
    r.content.toLowerCase().includes(search.toLowerCase()) ||
    (r as any).teacherId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Syncing your teacher interactions...</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-700 pb-20 px-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-8 rounded-full bg-mozhi-secondary" />
              <span className="text-[10px] font-black text-mozhi-secondary uppercase tracking-[0.3em]">Help & Support</span>
           </div>
           <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Tutor Requests</h1>
           <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium tracking-tight">Track your questions, class bookings, and learning progress with teachers.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search requests..."
             className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-mozhi-primary/20 transition-all outline-none"
           />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-700 dark:border-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-32 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
               <GraduationCap className="h-10 w-10 text-slate-200 dark:text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">No requests found</h3>
            <p className="text-sm text-slate-400 mt-2">Browse the directory to connect with native Tamil teachers.</p>
            <Link 
              href="/student/tutors" 
              className="mt-8 rounded-2xl bg-mozhi-primary px-8 py-3.5 text-xs font-black text-white uppercase tracking-widest hover:scale-105 transition-all"
            >
              Explore Tutors
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map((r) => {
            const config = TYPE_CONFIG[r.requestType] || TYPE_CONFIG.question;
            const status = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const Icon = config.icon;
            const teacher = (r as any).teacherId;

            return (
              <div 
                key={r._id}
                className="group overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Status Banner (Mobile top indicator) */}
                  <div className={cn("md:hidden h-1.5 w-full", r.status === 'replied' ? 'bg-emerald-500' : 'bg-slate-200')} />

                  <div className="flex-1 p-8">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", config.color)}>
                           <Icon className="h-6 w-6" />
                        </div>
                        <div>
                           <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{config.label} Request</h3>
                           <p className="text-xs font-bold text-mozhi-primary dark:text-mozhi-secondary uppercase tracking-widest">To: {teacher?.name || "Tutor"}</p>
                        </div>
                      </div>
                      <div className={cn("rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border", status.color)}>
                         {status.label}
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6">
                          <p className="text-md font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                            "{r.content}"
                          </p>
                          <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{new Date(r.createdAt).toLocaleString()} · {r.priceCredits} XP points</p>
                       </div>

                       {r.teacherReply && (
                          <div className="relative rounded-3xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-8 shadow-inner animate-in slide-in-from-bottom-2">
                             <div className="absolute -top-3 left-8 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
                               Teacher's Response
                             </div>
                             <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                               {r.teacherReply}
                             </p>
                          </div>
                       )}

                       {r.status === 'declined' && (
                          <div className="rounded-3xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 p-6 flex items-center gap-4">
                             <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                             <p className="text-xs font-bold text-red-700 dark:text-red-400">Your request was declined and {r.priceCredits} XP points have been refunded to your account.</p>
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Right Sidebar: Details & Action */}
                  <div className="md:w-64 bg-slate-50 dark:bg-slate-800/50 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                       {r.metadata?.preferredTime && (
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Details</p>
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                  <Clock className="h-3.5 w-3.5 text-mozhi-primary" />
                                  <span>{r.metadata.preferredTime}</span>
                               </div>
                               {r.metadata.sessionsCount && (
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                                     <Layers className="h-3.5 w-3.5 text-mozhi-secondary" />
                                     <span>{r.metadata.sessionsCount} Sessions</span>
                                  </div>
                               )}
                            </div>
                          </div>
                       )}
                    </div>

                    <div className="pt-8">
                       <Link 
                         href={`/student/tutors/${r.teacherId}`}
                         className="flex items-center justify-between w-full group"
                       >
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-mozhi-primary transition-colors">Tutor Profile</span>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-mozhi-primary group-hover:translate-x-1 transition-all" />
                       </Link>
                    </div>
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
