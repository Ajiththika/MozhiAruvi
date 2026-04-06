"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowLeft, AlertCircle, Globe, Wifi, Layers,
  BookOpen, MessageSquare, GraduationCap, Video, Sparkles, UserCheck2, Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTutorById, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";
import { TutorRequestModal } from "@/components/features/tutors/TutorRequestModal";

const levelColors: Record<string, string> = {
  beginner:     "bg-indigo-50 text-indigo-700 border-indigo-100",
  intermediate: "bg-indigo-50 text-indigo-700 border-indigo-100",
  advanced:     "bg-indigo-50 text-indigo-700 border-indigo-100",
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
  const [modalState, setModalState] = useState<{ open: boolean; type: "live_class" | "multi_class" }>({
    open: false, type: "live_class"
  });

  const [isPaying, setIsPaying] = useState(false);

  const handleProtectedBooking = async (type: "live_class" | "multi_class") => {
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
        const { url } = await import("@/services/paymentService").then(m => m.createTutorPayment(id, type === "multi_class"));
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
                               {tutor.isTutorAvailable ? "Available" : "Not Available"}
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

                {tutor.weeklySchedule && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-emerald-200/20">
                     <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-emerald-100">
                        <Clock className="h-7 w-7 text-emerald-600" />
                     </div>
                     <div className="text-center md:text-left">
                        <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-[0.2em] mb-1">Standard Operating Hours</p>
                        <p className="text-lg font-bold text-emerald-900">{tutor.weeklySchedule}</p>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Column: Booking & Actions ── */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-3xl bg-white p-10 text-white shadow-2xl shadow-primary/20 border border-slate-100 overflow-hidden relative">
                   <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                   
                   <div className="space-y-6 relative">
                      <div className="text-center pb-6 border-b border-slate-50">
                         <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Mentorship Options</h3>
                         <p className="text-sm font-bold text-slate-500">Select your learning path</p>
                      </div>

                      <button 
                        onClick={() => handleProtectedBooking("live_class")}
                        disabled={!tutor.isTutorAvailable}
                        className="group w-full flex items-center justify-between gap-4 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/20 transition-all hover:scale-[1.05] active:scale-[0.98] disabled:opacity-50"
                      >
                         <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                               <Video className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                               <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-0.5">High Intensity</p>
                               <p className="text-sm font-black text-slate-800">1h Class</p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end text-primary">
                            <span className="text-xl font-black">${tutor.oneClassFee || "30"}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest">per class</span>
                         </div>
                      </button>

                      <button 
                        onClick={() => handleProtectedBooking("multi_class")}
                        disabled={!tutor.isTutorAvailable}
                        className="group w-full flex items-center justify-between gap-4 rounded-[2rem] border border-slate-100 bg-primary p-6 shadow-xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-[0.98] disabled:opacity-50 text-white"
                      >
                         <div className="flex items-center gap-5">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-primary transition-all duration-500">
                               <Layers className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                               <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-0.5">Best Value</p>
                               <p className="text-sm font-black">8-Class Package</p>
                            </div>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-white">${tutor.eightClassFee || "200"}</span>
                            <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">total bundle</span>
                         </div>
                      </button>

                      <div className="pt-4 flex flex-col items-center gap-3">
                         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 font-sans">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-[0.2em]">Secure Stripe Checkout</span>
                         </div>
                         <p className="text-[10px] text-center text-slate-400 font-medium px-4 leading-relaxed">
                            Once payment is confirmed, your session schedule will be unlocked immediately.
                         </p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
