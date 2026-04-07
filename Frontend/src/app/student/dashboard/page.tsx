"use client";

import React, { useState } from "react";
import StatCard from "@/components/features/dashboard/StatCard";
import { BookOpen, Trophy, AlertCircle, ArrowRight, Clock, BookMarked, Flame, Zap, Crown, Calendar, Headphones, Hourglass, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getDashboardData } from "@/services/authService";
import { getMyBookings, Booking } from "@/services/bookingService";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "./DashboardSkeleton";
import WeeklyProgressChart from "@/components/features/dashboard/WeeklyProgressChart";

export default function StudentDashboard() {
  const [submitingPay, setSubmitingPay] = useState<string | null>(null);
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: async () => {
      const [dash, bks] = await Promise.all([getDashboardData(), getMyBookings()]);
      return { ...dash, bookings: bks?.bookings || [] };
    },
    staleTime: 2 * 60 * 1000,
  });

  const user = data?.user || null;
  const lessons = data?.lessons || [];
  const progress = data?.progress || [];
  const bookings = (data as any)?.bookings || [];

  const nextLesson = data?.statistics?.nextLesson || (lessons.length > 0 ? lessons[0] : null);
  const completedCount = data?.statistics?.completedCount ?? progress.filter(p => p.isCompleted).length;
  const progressPercentage = data?.statistics?.progressPercentage ?? (lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0);
  
  // Subscription stats
  const plan = user?.subscription?.plan || "FREE";
  
  // Energy Timer logic
  const EnergyTimer = ({ initialMs, isPremium, energy, max }: { initialMs: number, isPremium: boolean, energy: number, max: number }) => {
    const [timeLeft, setTimeLeft] = React.useState(initialMs);

    React.useEffect(() => {
      if (timeLeft <= 0 || isPremium || energy >= max) return;
      const interval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1000));
      }, 1000);
      return () => clearInterval(interval);
    }, [timeLeft, isPremium, energy, max]);

    if (isPremium) return <span className="text-amber-500">Unlimited power</span>;
    if (energy >= max) return <span>Full energy</span>;
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return (
      <span className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Next energy in {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    );
  };

  const REGEN_RATE_MS = 60 * 60 * 1000;
  const lastUpdate = user?.progress?.lastEnergyUpdate ? new Date(user.progress.lastEnergyUpdate).getTime() : Date.now();
  const nextRecoveryIn = Math.max(0, REGEN_RATE_MS - (Date.now() - lastUpdate));
  const isPremium = plan !== 'FREE';

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Tamil Watermark Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="fixed top-1/4 right-1/4 opacity-[0.03] font-black text-[30rem] text-primary select-none leading-none pointer-events-none rotate-12">
          அ
        </div>
      </div>

      <div className="relative z-10 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-8 lg:py-12 px-2 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center p-2 border border-primary/10">
             <Trophy className="text-primary w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-primary tracking-widest uppercase">Learning Hub</span>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-xl md:text-2xl font-black text-primary tracking-tight leading-tight">
            Vanakkam, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-semibold leading-relaxed mt-4">
            Continuing your journey into the world's oldest living classical language. Here's your current progress and curriculum milestones.
          </p>
        </div>
      </div>

      {/* Tutor Application Notice */}
      {user?.tutorStatus === 'pending' && (
         <Card variant="outline" padding="lg" className="border-indigo-100 bg-indigo-50/50 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-indigo-50 animate-in slide-in-from-top-4 duration-1000 rounded-[2rem]">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
               <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-indigo-100/50 flex items-center justify-center shrink-0">
                  <Hourglass className="h-7 w-7 text-indigo-600 animate-pulse" />
               </div>
               <div>
                  <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tutor Application Under Review</h4>
                  <p className="text-sm font-medium text-slate-600">Our academic team is currently evaluating your credentials. We'll be in touch soon.</p>
               </div>
            </div>
            <Button href="/tutor/apply/status" variant="secondary" size="sm" className="h-11 px-8 bg-white border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-100/50 hover:border-indigo-300 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100/20 transition-all active:scale-95 shrink-0">
               Check Full Status
            </Button>
         </Card>
      )}

      {isError && (
        <Card variant="outline" className="border-red-100 bg-red-50/30 flex items-center gap-4 text-red-600">
           <AlertCircle className="shrink-0 w-6 h-6" />
           <p className="font-bold tracking-tight">{(queryError as any)?.message || "Could not load dashboard data."}</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Daily Streak"
          value={`${user?.progress?.currentStreak || 0} Days`}
          description={`Personal Best: ${user?.progress?.highStreak || 0} days`}
          icon={Flame}
          trend={(user?.progress?.currentStreak || 0) > 0 ? "up" : "neutral"}
          trendValue={(user?.progress?.currentStreak || 0) > 0 ? "Active" : "New"}
        />
        <StatCard
          title="Daily Energy"
          value={isPremium ? "∞" : `${user?.progress?.energy ?? 25}/25`}
          description={
            <EnergyTimer 
              initialMs={nextRecoveryIn} 
              isPremium={isPremium} 
              energy={user?.progress?.energy ?? 25} 
              max={25} 
            />
          }
          icon={Zap}
        />
        <StatCard
          title="Current Plan"
          value={user?.subscription?.plan !== 'FREE' && (new Date(user?.subscription?.currentPeriodEnd || 0) > new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) ? `${plan} (Trial)` : plan}
          description={
            user?.subscription?.plan !== 'FREE' 
              ? `Ends on ${new Date(user?.subscription?.currentPeriodEnd || 0).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}`
              : "Basic access"
          }
          icon={Crown}
          trend={user?.subscription?.plan !== 'FREE' ? "up" : "neutral"}
          trendValue={user?.subscription?.plan !== 'FREE' ? "Premium" : "Free"}
        />
      </div>

      {/* Activity Chart & Progress Bar Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <WeeklyProgressChart />
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <span className="text-sm font-bold uppercase tracking-widest text-primary">Academy Progress</span>
                    <p className="text-xs font-medium text-slate-500 mt-1">Overall curriculum completion</p>
                </div>
                <span className="text-2xl font-black text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden w-full p-1 border border-slate-50">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden" style={{ width: `${progressPercentage}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent animate-shimmer" />
                </div>
            </div>
            <div className="mt-8 flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-800 tracking-tight">Milestone Reached</p>
                    <p className="text-[10px] font-medium text-primary uppercase tracking-widest mt-0.5">Level: {user?.level || "Beginner"}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Section: Marketplace Sessions */}
      {bookings.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                 <div className="h-8 w-8 rounded-lg bg-secondary/10 flex items-center justify-center p-1 border border-secondary/10">
                    <Calendar className="text-secondary w-4 h-4" />
                 </div>
                 <h3 className="text-xl font-black text-primary tracking-tight">Scheduled Sessions</h3>
              </div>
              <Button href="/student/bookings" variant="ghost" size="sm" className="text-secondary uppercase tracking-widest text-[10px] font-black">
                Full Schedule <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {bookings.filter((b: Booking) => b.status === 'confirmed' || b.status === 'pending').slice(0, 2).map((booking: any) => (
                <Card key={booking._id} variant="elevated" className="group rounded-[2rem] border-slate-50 shadow-xl shadow-slate-200/20 hover:shadow-secondary/20 hover:border-secondary/20 transition-all duration-500 overflow-hidden">
                   <div className="flex items-center gap-6 p-8">
                      <div className="shrink-0 h-20 w-20 rounded-[1.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group-hover:rotate-3 transition-transform">
                         {booking.tutorId.profilePhoto ? (
                           <img src={booking.tutorId.profilePhoto} className="h-full w-full object-cover" />
                         ) : (
                           <div className="h-full w-full bg-secondary/5 flex items-center justify-center text-secondary font-black text-2xl">
                              {booking.tutorId.name.charAt(0)}
                           </div>
                         )}
                      </div>
                      <div className="flex-1 space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{new Date(booking.date).toLocaleDateString()}</span>
                            <span className={cn(
                               "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                               booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                               {booking.status}
                            </span>
                         </div>
                         <h4 className="text-xl font-black text-slate-800 tracking-tight">{booking.tutorId.name}</h4>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.startTime} ({booking.duration} mins)</p>
                      </div>
                   </div>
                   <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 capitalize">{booking.tutorId.specialization || "Language Session"}</p>
                      <div className="flex gap-3">
                         {booking.status === 'confirmed' && booking.paymentStatus !== 'paid' && (
                            !booking.tutorId.stripeAccountId ? (
                               <div className="flex items-center gap-1.5 text-amber-500">
                                   <AlertCircle className="w-3 h-3" />
                                   <span className="text-[9px] font-black uppercase tracking-widest">Teacher Setup Pending</span>
                               </div>
                            ) : (
                               <button 
                                  disabled={submitingPay === booking._id}
                                  onClick={async (e) => {
                                     e.preventDefault();
                                     setSubmitingPay(booking._id);
                                     try {
                                        const { payBooking: apiPay } = await import("@/services/bookingService");
                                        const { url } = await apiPay(booking._id);
                                        if (url) window.location.href = url;
                                        else throw new Error("No URL received");
                                     } catch (e) {
                                        alert("Mentor has not finished Stripe account setup yet. Please try again later.");
                                     } finally {
                                        setSubmitingPay(null);
                                     }
                                  }}
                                  className={cn(
                                     "text-[10px] font-black text-secondary uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50",
                                     submitingPay === booking._id && "animate-pulse"
                                  )}
                               >
                                  {submitingPay === booking._id ? (
                                     <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                     <Zap className="h-3 w-3 fill-current" />
                                  )}
                                  <span>{submitingPay === booking._id ? "Initializing..." : "Pay Now"}</span>
                               </button>
                            )
                         )}
                         {(booking.status === 'confirmed' && booking.paymentStatus === 'paid') && (
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-secondary transition-colors cursor-default">Join Class</button>
                         )}
                         {booking.status === 'pending' && (
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Tutor...</span>
                         )}
                      </div>
                   </div>
                </Card>
              ))}
           </div>
        </div>
      )}

      {/* Section: Learning Roadmap */}
      <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-6">
            <h3 className="text-xl font-black text-primary tracking-tight">Active Learning Path</h3>
            <Button href="/student/lessons" variant="ghost" size="sm" className="text-primary uppercase tracking-widest text-xs font-bold">
              Full Curriculum <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {nextLesson ? (
            <Card variant="elevated" padding="lg" className="group relative overflow-hidden bg-primary shadow-2xl shadow-primary/25 hover:shadow-primary/40 transition-all duration-500">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute top-1/2 left-0 opacity-[0.02] font-black text-[15rem] text-white select-none pointer-events-none -translate-x-1/4 -translate-y-1/2">
                 க
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6 text-white text-center md:text-left">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/20 shadow-sm">
                      <Clock className="w-4 h-4" /> Resume Activity
                    </span>
                    <h4 className="text-2xl lg:text-3xl font-black tracking-tight drop-shadow-sm leading-tight">
                      {nextLesson.title}
                    </h4>
                    <p className="text-lg text-white/80 font-semibold leading-relaxed line-clamp-2">
                       {nextLesson.description || "Continue where you left off in the foundational modules."}
                    </p>
                    {progress.find(p => String(p.lessonId) === String(nextLesson._id))?.isCompleted && (
                      <span className="inline-block mt-2 px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm">
                        Finished • Ready for Retake
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <Button
                      href={(user?.progress?.energy ?? 0) <= 0 && !isPremium ? "/student/premium" : "/student/lessons"}
                      className={cn(
                        "h-14 px-10 rounded-2xl shadow-2xl transition-all w-full sm:w-auto",
                        (user?.progress?.energy ?? 0) <= 0 && !isPremium 
                          ? "bg-amber-400 text-slate-900 hover:bg-amber-300 shadow-amber-400/30" 
                          : "bg-white text-primary hover:bg-slate-50"
                      )}
                    >
                       {(user?.progress?.energy ?? 0) <= 0 && !isPremium ? (
                         <>Claim Daily Bonus <Zap className="ml-3 h-5 w-5 fill-current" /></>
                       ) : (
                         <>Start Learning <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                       )}
                    </Button>
                    <div className="flex items-center gap-3 text-white/70 text-xs font-bold uppercase tracking-widest border border-white/10 rounded-full px-5 py-3.5 bg-white/5 shadow-inner">
                       <span className="">Level: {user?.level || "Beginner"}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex shrink-0 w-48 h-48 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                   <BookMarked className="w-20 h-20 text-white/50" />
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="outline" padding="xl" className="flex flex-col items-center justify-center text-center border-dashed bg-slate-50/50">
              <div className="h-20 w-20 rounded-full bg-white shadow-2xl flex items-center justify-center text-4xl mb-6">📚</div>
              <p className="text-xl font-bold text-primary uppercase tracking-widest">Awaiting Knowledge</p>
              <p className="text-slate-600 font-semibold my-4 max-w-sm">You haven't begun any modules yet. Embark on your linguistic journey today.</p>
              <Button href="/student/lessons" variant="primary" size="lg" className="rounded-2xl shadow-xl shadow-primary/25 mt-4">Explore the Curriculum <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
