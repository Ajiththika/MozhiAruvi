"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  MessageSquare, Video, Layers, Clock, CheckCircle2, AlertCircle, 
  Loader2, ArrowRight, GraduationCap, XCircle, Search, Calendar, Sparkles
} from "lucide-react";
import { getMyTutorRequests, TutorRequest } from "@/services/tutorService";
import { cn } from "@/lib/utils";

const TYPE_CONFIG = {
  question: { label: "Question", icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
  live_class: { label: "Live Class", icon: Video, color: "text-emerald-600 bg-emerald-50" },
  multi_class: { label: "Package", icon: Layers, color: "text-violet-600 bg-violet-50" },
};

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-amber-50 text-amber-700 border-amber-100" },
  accepted: { label: "Accepted", color: "bg-blue-50 text-blue-700 border-blue-100" },
  declined: { label: "Declined", color: "bg-red-50 text-red-700 border-red-100" },
  replied: { label: "Replied", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  resolved: { label: "Resolved", color: "bg-slate-50 text-slate-700 border-slate-100" },
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-100">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-secondary" />
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Learning Support</span>
           </div>
           <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Tutor Requests</h1>
           <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">Track your questions, monitor session status, and review personalized feedback from your teachers.</p>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
           <input 
             type="text" 
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             placeholder="Search your requests..."
             className="w-full rounded-[2rem] bg-white border border-slate-100 py-4 pl-14 pr-6 text-sm font-semibold text-slate-700 focus:ring-4 focus:ring-primary/5 transition-all outline-none shadow-xl shadow-slate-200/20"
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

                  <div className="flex-1 p-10">
                    <div className="flex items-start justify-between gap-6 mb-8">
                      <div className="flex items-center gap-5">
                        <div className={cn("h-14 w-14 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm", config.color)}>
                           <Icon className="h-7 w-7" />
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-slate-900">{config.label} Request</h3>
                           <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">To Teacher: {teacher?.name || "Verified Tutor"}</p>
                        </div>
                      </div>
                      <div className={cn("rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-widest border shadow-sm", status.color)}>
                         {status.label}
                      </div>
                    </div>

                    <div className="space-y-6">
                       <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                          <p className="text-lg font-medium text-slate-700 italic leading-relaxed">
                            "{r.content}"
                          </p>
                          <div className="mt-6 flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/50">
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(r.createdAt).toLocaleString()}
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                                {r.priceCredits} XP points
                             </div>
                          </div>
                       </div>

                       {r.teacherReply && (
                          <div className="relative rounded-[2rem] bg-emerald-50 border border-emerald-100 p-10 shadow-inner animate-in slide-in-from-bottom-2">
                             <div className="absolute -top-3 left-10 bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                Teacher's Expert Response
                             </div>
                             <p className="text-md font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                               {r.teacherReply}
                             </p>
                          </div>
                       )}

                       {r.status === 'declined' && (
                          <div className="rounded-[2rem] bg-red-50 border border-red-100 p-8 flex items-center gap-5">
                             <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <XCircle className="h-6 w-6 text-red-500" />
                             </div>
                             <p className="text-sm font-bold text-red-700">Request declined. {r.priceCredits} XP has been fully refunded.</p>
                          </div>
                       )}
                    </div>
                  </div>


                  {/* Right Sidebar: Details & Action */}
                  <div className="md:w-72 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-10 flex flex-col justify-between">
                    <div className="space-y-8">
                       {r.metadata?.preferredTime && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schedule</p>
                            <div className="space-y-3">
                               <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{r.metadata.preferredTime}</span>
                               </div>
                               {r.metadata.sessionsCount && (
                                  <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-slate-100">
                                     <Layers className="h-4 w-4 text-secondary" />
                                     <span>{r.metadata.sessionsCount} Sessions</span>
                                  </div>
                               )}
                            </div>
                          </div>
                       )}
                    </div>

                    <div className="pt-10 mt-auto">
                       <Link 
                         href={`/student/tutors/${r.teacherId}`}
                         className="flex items-center justify-between w-full group py-3 border-t border-slate-200/50"
                       >
                          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Tutor Profile</span>
                          <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
