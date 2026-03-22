"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Globe, Clock, Wifi, Layers,
  BookOpen, MessageSquare, GraduationCap, Video, Sparkles, UserCheck2,
} from "lucide-react";
import { getTutorById, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";
import { TutorRequestModal } from "@/components/student/TutorRequestModal";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  intermediate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  advanced:     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};

const modeLabel: Record<string, string> = {
  online: "Online Session", offline: "In-Person Class", both: "Online & In-Person",
};

// ── Main Profile Page ─────────────────────────────────────────────────────────

export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ open: boolean; type: "question" | "live_class" | "multi_class" }>({
    open: false, type: "question"
  });

  useEffect(() => {
    getTutorById(id)
      .then(setTutor)
      .catch(() => setError("Could not load teacher profile. Please try again later."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-mozhi-primary border-t-transparent shadow-xl ring-4 ring-mozhi-primary/5" />
      <p className="text-sm font-bold text-slate-500 animate-pulse">Retreiving verified profile details...</p>
    </div>
  );

  if (error || !tutor) return (
    <div className="mx-auto max-w-xl py-20 px-4 text-center">
      <div className="flex justify-center mb-6">
        <div className="p-5 rounded-full bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/40">
           <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Teacher Profile Unavailable</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">{error ?? "This teacher might have removed their profile or is no longer active."}</p>
      <Link 
        href="/student/tutors" 
        className="inline-flex items-center gap-2 rounded-2xl bg-mozhi-primary px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Teachers
      </Link>
    </div>
  );

  return (
    <>
      {modalState.open && (
         <TutorRequestModal 
           tutor={tutor} 
           initialType={modalState.type} 
           onClose={() => setModalState({ ...modalState, open: false })} 
         />
      )}

      <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 px-2">
           <Link href="/student/dashboard" className="text-xs font-bold text-slate-400 hover:text-mozhi-primary uppercase tracking-widest transition-colors">Dashboard</Link>
           <div className="h-1 w-1 rounded-full bg-slate-300" />
           <Link href="/student/tutors" className="text-xs font-bold text-slate-400 hover:text-mozhi-primary uppercase tracking-widest transition-colors">Teachers</Link>
           <div className="h-1 w-1 rounded-full bg-slate-300" />
           <span className="text-xs font-bold text-mozhi-primary uppercase tracking-widest">{tutor.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* ── Left Column: Profile Details ── */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Main Identity Banner */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-mozhi-primary/5 blur-3xl -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-mozhi-secondary/5 blur-2xl -ml-20 -mb-20" />
              
              <div className="relative px-8 pt-8 pb-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  {/* Photo Container */}
                  <div className="relative group">
                    <div className="h-32 w-32 overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-inner group-hover:shadow-lg transition-all duration-500 border-4 border-white dark:border-slate-800">
                      {tutor.profilePhoto ? (
                        <img src={tutor.profilePhoto} alt={tutor.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-mozhi-light/20">
                           <GraduationCap className="h-16 w-16 text-mozhi-primary" />
                        </div>
                      )}
                    </div>
                    {tutor.isTutorAvailable && (
                      <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                        <UserCheck2 className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* Identity Info */}
                  <div className="flex-1 text-center sm:text-left pt-2">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{tutor.name}</h1>
                        <p className="mt-2 text-md font-extrabold text-mozhi-primary dark:text-mozhi-secondary uppercase tracking-widest">{tutor.specialization ?? "Tamil Language Expert"}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className={cn(
                          "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest",
                          tutor.isTutorAvailable ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm shadow-emerald-100" : "bg-slate-100 text-slate-500"
                        )}>
                          <div className={cn("h-2 w-2 rounded-full", tutor.isTutorAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                          {tutor.isTutorAvailable ? "Available Now" : "Currently Busy"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-3">
                       {tutor.levelSupport?.map(lvl => (
                          <span key={lvl} className={cn("rounded-2xl px-4 py-1 text-xs font-bold uppercase tracking-wider", levelColors[lvl])}>
                             {lvl} Support
                          </span>
                       ))}
                       <span className="inline-flex items-center gap-2 rounded-2xl bg-sky-50 dark:bg-sky-950/20 px-4 py-1 text-xs font-bold text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                          {tutor.teachingMode === "online" ? <Wifi className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                          {modeLabel[tutor.teachingMode || "online"]}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content Blocks */}
            <div className="space-y-8">
              {/* About section */}
              {tutor.bio && (
                <div className="rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-mozhi-secondary" /> Expert Biography
                  </h2>
                  <p className="text-md leading-relaxed font-medium text-slate-600 dark:text-slate-300 whitespace-pre-line px-2">{tutor.bio}</p>
                </div>
              )}

              {/* Teaching Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-4">
                   <div className="rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Teaching Focus</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">{tutor.experience || "Native Teacher with extensive experience in conversational and formal Tamil."}</p>
                   </div>
                </div>
                <div className="rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-6 flex items-start gap-4">
                   <div className="rounded-2xl bg-white dark:bg-slate-800 p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                      <Globe className="h-6 w-6 text-mozhi-primary" />
                   </div>
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Communication</p>
                     <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">Fluent in {tutor.languages?.join(", ") || "Tamil and English"}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Booking & Actions ── */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            <div className="sticky top-24 space-y-4">
              <div className="rounded-[2.5rem] bg-slate-900 p-8 text-white shadow-2xl shadow-mozhi-primary/20 border border-slate-800">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Interaction Fee</p>
                      <p className="text-3xl font-black">{tutor.hourlyRate || "10"} <span className="text-sm text-slate-500 font-bold uppercase ml-1">XP Points</span></p>
                   </div>
                   <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-mozhi-soft" />
                   </div>
                </div>

                <div className="space-y-3">
                   <button 
                     onClick={() => setModalState({ open: true, type: "question" })}
                     disabled={!tutor.isTutorAvailable}
                     className="group w-full flex items-center justify-between gap-3 rounded-2xl bg-white p-4 text-sm font-black text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                   >
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-mozhi-primary/10 transition-colors">
                            <MessageSquare className="h-4 w-4 text-mozhi-primary" />
                         </div>
                         <span>Ask a Question</span>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-500">10 XP</span>
                   </button>

                   <button 
                     onClick={() => setModalState({ open: true, type: "live_class" })}
                     disabled={!tutor.isTutorAvailable}
                     className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-white/10 p-4 text-sm font-black text-white transition-all hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
                   >
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Video className="h-4 w-4 text-mozhi-soft" />
                         </div>
                         <span>Live 1:1 Class</span>
                      </div>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-slate-500">30 XP</span>
                   </button>

                   <button 
                     onClick={() => setModalState({ open: true, type: "multi_class" })}
                     disabled={!tutor.isTutorAvailable}
                     className="group w-full flex items-center justify-between gap-3 rounded-2xl border-2 border-white/10 p-4 text-sm font-black text-white transition-all hover:bg-white/5 active:scale-[0.98] disabled:opacity-50"
                   >
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Layers className="h-4 w-4 text-mozhi-secondary" />
                         </div>
                         <span>5-Session Package</span>
                      </div>
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-slate-500">100 XP</span>
                   </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Questions are usually answered within {tutor.responseTime || "24 hours"}. Credits are fully refunded if your request is declined or unanswered.
                   </p>
                </div>
              </div>

              <Link 
                href="/student/tutors/my-requests" 
                className="flex items-center justify-center gap-3 w-full rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-sm font-black text-slate-700 dark:text-slate-300 transition-all hover:border-mozhi-primary hover:text-mozhi-primary dark:hover:border-mozhi-secondary dark:hover:text-mozhi-secondary"
              >
                 <ArrowLeft className="h-4 w-4" /> My Tutor Requests
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}