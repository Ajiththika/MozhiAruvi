"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/features/dashboard/StatCard";
import { Users, MessageSquare, Star, ToggleRight, ToggleLeft, Loader2, AlertCircle, ArrowRight, Video, Layers, Sparkles, CheckCircle2, PenTool, Calendar, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getMe, SafeUser } from "@/services/authService";
import { getPendingRequests, TutorRequest, updateTutorAvailability } from "@/services/tutorService";
import { getMyEvents, MozhiEvent } from "@/services/eventService";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

import StripeOnboardingNotice from "@/components/features/tutors/StripeOnboardingNotice";
import { getMyBookings, Booking } from "@/services/bookingService";

export default function TutorDashboard() {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [pendingQs, setPendingQs] = useState<TutorRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([getMe(), getPendingRequests(), getMyEvents(), getMyBookings()])
      .then(([u, qs, evs, bks]) => {
        setUser(u);
        setIsAvailable(u.isTutorAvailable ?? false);
        setPendingQs(qs.filter((q) => q.status === "pending" || q.status === "accepted"));
        setEvents(evs.filter(e => e.date >= today));
        setBookings(bks.bookings || []);
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
        <p className="text-sm font-semibold text-primary/70 tracking-tight animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const activeRequests = pendingQs.length;

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="space-y-6">
        {!user?.isStripeVerified && (
           <StripeOnboardingNotice isVerified={false} />
        )}

        <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-b border-slate-100 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
                <span className="h-1.5 w-10 rounded-full bg-secondary" />
                <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Tutor Operations</span>
            </div>
            <h1 className="text-4xl md:text-4xl font-bold text-slate-800 tracking-tight">Welcome, {user?.name?.split(" ")[0]}</h1>
            <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              You have <span className="text-primary font-bold">{activeRequests} active questions</span> and <span className="text-secondary font-bold">{bookings.filter(b => b.status === 'pending').length} new bookings</span> awaiting you.
            </p>
          </div>

          {/* Availability Quick Toggle */}
          <button
            onClick={handleAvailabilityToggle}
            disabled={toggling}
            className={cn(
              "flex items-center gap-4 rounded-2xl border-2 px-8 py-4 text-xs font-bold transition-all shadow-xl shadow-slate-200/10 active:scale-95",
              isAvailable
                ? "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-slate-100 bg-white text-primary/70 hover:border-secondary/30"
            )}
          >
            {isAvailable ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {isAvailable ? "Status: Accepting Students" : "Status: Away"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-error bg-error/10 px-6 py-4 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Direct Bookings"
          value={String(bookings.length)}
          description="Total marketplace sessions"
          icon={Calendar}
          className="border-secondary/10 bg-secondary/5"
        />
        <StatCard
          title="Account Status"
          value={user?.isStripeVerified ? "Verified" : "Pending Setup"}
          description={user?.isStripeVerified ? "Direct payouts active" : "Payments disabled"}
          icon={ShieldCheck}
          className={user?.isStripeVerified ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}
        />
        <StatCard
          title="Marketplace Rate"
          value={`$${user?.hourlyRate || "0"}/hr`}
          description="Your public hourly fee"
          icon={Sparkles}
        />
        <StatCard
          title="Quick Status"
          value={isAvailable ? "Online" : "Away"}
          description={isAvailable ? "Visible to students" : "Hidden from search"}
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Marketplace Bookings Preview */}
        <div className="lg:col-span-8 flex flex-col rounded-[2rem] bg-white border border-slate-100 p-10 md:p-14 shadow-2xl shadow-slate-200/5">
           <div className="mb-10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Upcoming Marketplace Sessions</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">Confirmed appointments & legacy requests</p>
              </div>
              <Button href="/tutor/schedule" variant="outline" size="sm" className="text-[10px] uppercase font-black px-6">View Agenda</Button>
           </div>

           {bookings.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 grayscale opacity-40">
                <Calendar className="h-16 w-16 text-slate-300" />
                <p className="text-sm font-bold text-primary/60 max-w-xs uppercase tracking-widest leading-loose">No active bookings. Promote your profile to students.</p>
             </div>
           ) : (
             <div className="space-y-4">
                {bookings.slice(0, 3).map(booking => (
                  <div key={booking._id} className="group flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-500">
                     <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-xl bg-white border border-slate-100 p-1 shadow-sm overflow-hidden flex items-center justify-center">
                           {booking.studentId.profilePhoto ? (
                             <img src={booking.studentId.profilePhoto} className="h-full w-full object-cover rounded-lg" />
                           ) : (
                             <div className="h-full w-full bg-primary/5 flex items-center justify-center text-primary font-black uppercase text-xl">
                               {booking.studentId.name ? (booking.studentId.name as string).charAt(0) : 'S'}
                             </div>
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">{new Date(booking.date).toLocaleDateString()} • {booking.startTime}</p>
                           <h5 className="text-lg font-black text-slate-800 tracking-tight">{booking.studentId.name}</h5>
                           <div className="flex items-center gap-4 mt-2">
                              <span className={cn(
                                "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                                booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              )}>
                                {booking.status}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 capitalize">{booking.duration} Minute Session</span>
                           </div>
                        </div>
                     </div>
                     <div className="mt-6 md:mt-0 flex flex-wrap gap-4 items-center justify-center">
                        {booking.status === 'pending' && (
                          <>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="px-8 h-12 shadow-xl shadow-primary/20 bg-emerald-600 hover:bg-emerald-700"
                              onClick={async () => {
                                try {
                                  const { confirmBooking: apiAccept } = await import("@/services/bookingService");
                                  await apiAccept(booking._id);
                                  setBookings(prev => prev.map(b => b._id === booking._id ? { ...b, status: 'confirmed' } : b));
                                } catch (e) {
                                  alert("Failed to accept booking.");
                                }
                              }}
                            >
                              Accept Class
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="px-8 h-12 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                              onClick={async () => {
                                if (confirm("Are you sure you want to decline this request?")) {
                                  try {
                                    const { declineBooking: apiDecline } = await import("@/services/bookingService");
                                    await apiDecline(booking._id);
                                    setBookings(prev => prev.filter(b => b._id !== booking._id));
                                  } catch (e) {
                                    alert("Failed to decline booking.");
                                  }
                                }
                              }}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <div className="flex flex-col items-center gap-2">
                             <Button variant="outline" size="sm" className="px-8 h-12 border-primary/20 text-primary">Pre-Session Brief</Button>
                             {booking.paymentStatus === 'paid' ? (
                               <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Ready to Start</span>
                             ) : (
                               <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-100">Awaiting Payment</span>
                             )}
                          </div>
                        )}
                     </div>
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* Inbox Preview */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl bg-white border border-slate-100 p-10 shadow-2xl shadow-slate-200/10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-bold text-slate-800">Live Inbox</h3>
            {activeRequests > 0 && (
              <span className="inline-flex h-8 px-4 items-center justify-center rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                {activeRequests} New
              </span>
            )}
          </div>

          {activeRequests === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-100 p-10 text-center space-y-4">
               <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                  <CheckCircle2 className="h-8 w-8 text-slate-200" />
               </div>
               <p className="text-sm font-bold text-primary/60">Everything resolved for now.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingQs.slice(0, 3).map((q) => (
                <div key={q._id} className="flex flex-col gap-4 rounded-[2rem] border border-slate-50 bg-soft/10 p-6 hover:bg-white hover:border-secondary/30 transition-all duration-300 shadow-sm hover:shadow-xl">
                   <div className="flex items-center justify-between">
                       <div className={cn(
                            "text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest",
                            q.requestType === 'question' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        )}>
                            {q.requestType || 'Request'}
                       </div>
                       <span className="text-[10px] text-primary/60 font-bold uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</span>
                   </div>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                    "{q.content}"
                  </p>
                  <Link href="/tutor/questions" className="text-xs font-bold text-primary flex items-center gap-2 group/reply">
                    <span>Attend to student</span> 
                    <ArrowRight className="h-4 w-4 group-hover/reply:translate-x-1 transition-transform" />
                  </Link>
                </div>
              ))}
              {activeRequests > 3 && (
                <Link href="/tutor/questions" className="block text-center text-xs font-bold text-primary/60 hover:text-primary mt-6 tracking-widest uppercase py-4 rounded-2xl border border-dashed border-slate-100 hover:border-primary/20 transition-all">
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
















