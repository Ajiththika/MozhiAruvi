"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowLeft, AlertCircle, Globe, Wifi, Layers,
  BookOpen, MessageSquare, GraduationCap, Video, Sparkles, UserCheck2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTutorById, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";
import { TutorRequestModal } from "@/components/features/tutors/TutorRequestModal";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-700",
  intermediate: "bg-sky-100 text-sky-700",
  advanced:     "bg-violet-100 text-violet-700",
};

const modeLabel: Record<string, string> = {
  online: "Online Session", offline: "In-Person Class", both: "Online & In-Person",
};

export default function PublicTutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{ open: boolean; type: "question" | "live_class" | "multi_class" }>({
    open: false, type: "question"
  });

  const [isPaying, setIsPaying] = useState(false);

  const handleProtectedBooking = async (type: "question" | "live_class" | "multi_class") => {
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Check if user has premium plan or has already paid for this tutor
    const plan = user.subscription?.plan || 'FREE';
    const hasPaid = user.subscription?.paidTutors?.includes(id);

    if (plan === 'FREE' && !hasPaid) {
      try {
        setIsPaying(true);
        const { url } = await import("@/services/paymentService").then(m => m.createTutorPayment(id));
        window.location.href = url;
        return;
      } catch (err) {
        console.error(err);
        alert("Failed to initiate payment. Please try again.");
      } finally {
        setIsPaying(false);
      }
    }

    setModalState({ open: true, type });
  };

  useEffect(() => {
    getTutorById(id)
      .then(setTutor)
      .catch(() => setError("Could not load teacher profile. Please try again later."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-xl ring-4 ring-primary/5" />
        <p className="text-sm font-bold text-slate-500 animate-pulse">Retreiving verified profile details...</p>
      </div>
      <Footer />
    </div>
  );

  if (error || !tutor) return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <div className="flex-1 mx-auto max-w-xl py-20 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-5 rounded-full bg-red-50 border border-red-100">
             <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Teacher Profile Unavailable</h2>
        <p className="text-sm text-slate-500 mb-8">{error ?? "This teacher might have removed their profile or is no longer active."}</p>
        <Link 
          href="/tutors" 
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Teachers
        </Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      {modalState.open && (
         <TutorRequestModal 
           tutor={tutor} 
           initialType={modalState.type} 
           onClose={() => setModalState({ ...modalState, open: false })} 
         />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 lg:px-12 py-12">
        <div className="mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
          {/* Navigation Breadcrumb */}
          <nav className="flex items-center gap-2 px-2">
             <Link href="/" className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Home</Link>
             <div className="h-1 w-1 rounded-full bg-slate-300" />
             <Link href="/tutors" className="text-xs font-bold text-slate-400 hover:text-primary uppercase tracking-widest transition-colors">Teachers</Link>
             <div className="h-1 w-1 rounded-full bg-slate-300" />
             <span className="text-xs font-bold text-primary uppercase tracking-widest">{tutor.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* ── Left Column: Profile Details ── */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              
              {/* Main Identity Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-200/40">
                <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl -mr-40 -mt-40" />
                <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-secondary/5 blur-3xl -ml-40 -mb-40" />
                
                <div className="relative">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <div className="relative">
                      <div className="h-40 w-40 overflow-hidden rounded-2xl bg-slate-50 border-4 border-white shadow-2xl transition-all duration-700 hover:rotate-2">
                        {tutor.profilePhoto ? (
                          <img src={tutor.profilePhoto} alt={tutor.name} className="h-full w-full object-cover transition-transform hover:scale-110 duration-500" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/5">
                             <GraduationCap className="h-20 w-20 text-primary" />
                          </div>
                        )}
                      </div>
                      {tutor.isTutorAvailable && (
                        <div className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-[1.5rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 border-4 border-white">
                          <UserCheck2 className="h-6 w-6" />
                        </div>
                      )}
                    </div>
    
                     <div className="flex-1 text-center md:text-left pt-2 space-y-4">
                      <div className="space-y-2">
                         <div className="flex flex-col md:flex-row items-center md:items-baseline gap-3">
                          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800">{tutor.name}</h1>
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">
                             <Sparkles className="h-3 w-3" /> Expert Teacher
                          </span>
                        </div>
                        <p className="text-xl font-semibold text-primary/80 leading-relaxed italic">
                          {tutor.specialization ?? "Tamil Language & Culture Expert"}
                        </p>
                      </div>

                      <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                         {tutor.levelSupport?.map(lvl => (
                            <span key={lvl} className={cn("rounded-xl px-5 py-2 text-xs font-bold border capitalize transition-all hover:scale-105", levelColors[lvl])}>
                               {lvl} Level
                            </span>
                         ))}
                         <span className="inline-flex items-center gap-2 rounded-xl bg-sky-50 text-sky-700 px-5 py-2 text-xs font-bold border border-sky-100 overflow-hidden">
                            {tutor.teachingMode === "online" ? <Wifi className="h-3.5 w-3.5" /> : <Layers className="h-3.5 w-3.5" />}
                            {modeLabel[tutor.teachingMode || "online"]}
                         </span>
                      </div>

                      <div className="pt-4 flex items-center justify-center md:justify-start gap-4 border-t border-slate-50 mt-4">
                         <div className="flex items-center gap-2 group cursor-default">
                            <div className={cn("h-2.5 w-2.5 rounded-full", tutor.isTutorAvailable ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-slate-300")} />
                            <span className={cn("text-xs font-bold uppercase tracking-widest", tutor.isTutorAvailable ? "text-emerald-600" : "text-slate-400")}>
                               {tutor.isTutorAvailable ? "Accepting Students" : "Away"}
                            </span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                {tutor.bio && (
                  <div className="rounded-2xl bg-white border border-slate-100 p-10 md:p-14 shadow-xl shadow-slate-200/20">
                    <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-primary" /> Professional Background
                    </h2>
                    <p className="text-lg leading-relaxed font-medium text-slate-600 whitespace-pre-line">{tutor.bio}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="rounded-2xl bg-white border border-slate-100 p-8 flex flex-col gap-6 shadow-xl shadow-slate-200/20 transition-all hover:border-primary/20">
                     <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <Sparkles className="h-7 w-7 text-primary" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Teaching Philosophy</p>
                       <p className="text-md font-bold text-slate-800 leading-relaxed">{tutor.experience || "Native Teacher with extensive experience in conversational and formal Tamil instruction."}</p>
                     </div>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-100 p-8 flex flex-col gap-6 shadow-xl shadow-slate-200/20 transition-all hover:border-secondary/20">
                     <div className="h-14 w-14 rounded-2xl bg-secondary/5 flex items-center justify-center border border-secondary/10">
                        <Globe className="h-7 w-7 text-secondary" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Language Mastery</p>
                       <p className="text-md font-bold text-slate-800 leading-relaxed">Expert communication in {tutor.languages?.join(", ") || "Tamil and English"}.</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right Column: Booking & Actions ── */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl bg-white p-10 text-white shadow-2xl shadow-primary/20 border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-8">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Session Fee</p>
                        <p className="text-4xl font-bold text-slate-800">${tutor.hourlyRate || "10"}</p>
                     </div>
                     <div className="h-14 w-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                        <Sparkles className="h-7 w-7 text-secondary" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <button 
                       onClick={() => handleProtectedBooking("question")}
                       disabled={!tutor.isTutorAvailable}
                       className="group w-full flex items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-100 p-5 text-sm font-bold text-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                     >
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <MessageSquare className="h-5 w-5 text-primary" />
                           </div>
                           <span>Ask a Question</span>
                        </div>
                        <span className="text-[10px] bg-white px-3 py-1 rounded-full text-slate-500 font-black">$10</span>
                     </button>

                     <button 
                       onClick={() => handleProtectedBooking("live_class")}
                       disabled={!tutor.isTutorAvailable}
                       className="group w-full flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-bold text-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                     >
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <Video className="h-5 w-5 text-secondary" />
                           </div>
                           <span>Live 1:1 Class</span>
                        </div>
                        <span className="text-[10px] bg-white px-3 py-1 rounded-full text-slate-500 font-black">$30</span>
                     </button>

                     <button 
                       onClick={() => handleProtectedBooking("multi_class")}
                       disabled={!tutor.isTutorAvailable}
                       className="group w-full flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm font-bold text-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                     >
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <Layers className="h-5 w-5 text-secondary" />
                           </div>
                           <span>5-Session Package</span>
                        </div>
                        <span className="text-[10px] bg-white px-3 py-1 rounded-full text-slate-500 font-black">$100</span>
                     </button>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-100 text-center">
                     <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                        Teachers usually respond within {tutor.responseTime || "24 hours"}. Credits are fully refunded if your request is declined.
                     </p>
                  </div>
                </div>

                <Link 
                  href="/student/tutors/my-requests" 
                  className="flex items-center justify-center gap-3 w-full rounded-2xl border border-slate-100 bg-white py-5 text-xs font-bold text-slate-600 transition-all hover:border-primary hover:text-primary shadow-xl shadow-slate-200/20"
                >
                   <ArrowLeft className="h-4 w-4" /> My Tutor Requests
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
