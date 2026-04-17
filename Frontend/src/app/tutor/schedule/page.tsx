"use client";

import React, { useEffect, useState } from "react";
import { 
  Clock, 
  Calendar, 
  Plus, 
  User, 
  Edit3, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Video,
  XCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { getMyBookings, Booking, rescheduleBooking, updateMeetingLink } from "@/services/bookingService";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function TutorSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [linkBookingId, setLinkBookingId] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [submiting, setSubmiting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getMyBookings();
      setBookings(data.bookings || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!editingId || !newDate || !newTime) return;
    setSubmiting(true);
    try {
      await rescheduleBooking(editingId, newDate, newTime);
      setBookings(prev => prev.map(b => b._id === editingId ? { ...b, date: newDate, startTime: newTime } : b));
      setEditingId(null);
    } catch (e) {
      alert("Failed to reschedule.");
    } finally {
      setSubmiting(false);
    }
  };

  const handleSetLink = async () => {
    if (!linkBookingId || !meetingUrl) return;
    setSubmiting(true);
    try {
      await updateMeetingLink(linkBookingId, meetingUrl);
      setBookings(prev => prev.map(b => b._id === linkBookingId ? { ...b, meetingLink: meetingUrl } : b));
      setLinkBookingId(null);
      setMeetingUrl("");
    } catch (e) {
      alert("Failed to update link.");
    } finally {
      setSubmiting(false);
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === "confirmed");

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center p-2 border border-primary/10">
                <Calendar className="text-primary w-5 h-5" />
             </div>
             <span className="text-xs font-bold text-primary tracking-widest uppercase">Class Operations</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Active Schedule</h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
             Manage your confirmed sessions, adjust timing, and provide meeting links for your students.
          </p>
        </div>
        <Link href="/tutor/dashboard" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">
           <ArrowLeft className="h-4 w-4" /> Back to stats
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <Loader2 className="h-10 w-10 animate-spin text-primary" />
           <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">Compiling sessions...</p>
        </div>
      ) : confirmedBookings.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
           <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mb-8">
              <Calendar className="h-10 w-10 text-slate-200" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">No Confirmed Classes</h3>
           <p className="text-slate-500 mt-3 font-medium max-w-sm">Any class you accept from your dashboard will appear here for management.</p>
           <Button href="/tutor/dashboard" variant="primary" className="mt-10 h-14 px-12 rounded-2xl shadow-2xl shadow-primary/20">Go to Dashboard</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {confirmedBookings.map((booking) => (
             <div key={booking._id} className="group relative bg-white rounded-[2rem] border border-slate-100 p-8 hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                   {/* Student Avatar */}
                   <div className="h-20 w-20 shrink-0 rounded-2xl bg-slate-50 border-4 border-white shadow-xl overflow-hidden shadow-slate-200 flex items-center justify-center">
                      {booking.studentId.profilePhoto ? (
                        <img src={booking.studentId.profilePhoto} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-primary/5 flex items-center justify-center text-primary font-black text-2xl">
                           {(booking.studentId.name as string).charAt(0)}
                        </div>
                      )}
                   </div>

                   {/* Info */}
                   <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{new Date(booking.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                         <span className={cn(
                           "text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border shadow-sm",
                           booking.paymentStatus === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                         )}>
                            {booking.paymentStatus === 'paid' ? "PAID" : "Awaiting Payment"}
                         </span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 tracking-tight">{booking.studentId.name}</h4>
                      <p className="flex items-center gap-2 text-sm font-bold text-slate-500">
                         <Clock className="h-4 w-4 text-primary" /> {booking.startTime} ({booking.duration} mins)
                      </p>
                      
                      {booking.meetingLink && (
                         <div className="mt-4 flex items-center gap-2">
                           <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                             <CheckCircle2 className="h-3 w-3" /> Class Link Shared
                           </span>
                           <a href={booking.meetingLink} target="_blank" className="text-primary hover:text-secondary transition-colors"><ExternalLink className="h-4 w-4" /></a>
                         </div>
                      )}
                   </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                   <button 
                     onClick={async () => {
                        try {
                          const { declineBooking: apiCancel } = await import("@/services/bookingService");
                          await apiCancel(booking._id);
                          setBookings(prev => prev.filter(b => b._id !== booking._id));
                        } catch (e) {
                          console.error("Cancel Error:", e);
                        }
                     }}
                     className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all active:scale-95 px-6 py-3 rounded-xl border border-red-50 hover:bg-red-50"
                   >
                      <XCircle className="h-4 w-4" /> Cancel Session
                   </button>

                   <button 
                     onClick={() => {
                        setEditingId(booking._id);
                        setNewDate(new Date(booking.date).toISOString().split('T')[0]);
                        setNewTime(booking.startTime);
                     }}
                     className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-all active:scale-95 px-6 py-3 rounded-xl border border-slate-100 hover:bg-slate-50"
                   >
                      <Edit3 className="h-4 w-4" /> Manage Time
                   </button>
                   
                   <button 
                     onClick={() => {
                       setLinkBookingId(booking._id);
                       setMeetingUrl(booking.meetingLink || "");
                     }}
                     className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-slate-800 text-white rounded-xl px-8 py-3.5 shadow-xl shadow-slate-800/10 hover:bg-black transition-all active:scale-95"
                   >
                      <Video className="h-4 w-4" /> 
                      {booking.meetingLink ? "Update Link" : "Share Meet Link"}
                   </button>

                </div>
             </div>
           ))}
        </div>
      )}

      {/* Reschedule Modal */}
      {editingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Adjust Session Time</h3>
                 <button onClick={() => setEditingId(null)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><XCircle className="h-5 w-5" /></button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">New Session Date</label>
                   <input 
                     type="date" 
                     value={newDate} 
                     onChange={e => setNewDate(e.target.value)}
                     className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-1">Start Time (e.g. 10:00 AM)</label>
                   <input 
                     type="text" 
                     value={newTime} 
                     onChange={e => setNewTime(e.target.value)}
                     className="w-full h-14 rounded-2xl border border-slate-100 bg-slate-50 px-5 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                   />
                </div>
              </div>

              <Button 
                onClick={handleReschedule} 
                className="w-full h-16 rounded-2xl bg-primary text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                disabled={submiting || !newDate || !newTime}
              >
                 {submiting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : "Save Reschedule Details"}
              </Button>
           </div>
        </div>
      )}

      {/* Share Link Modal */}
      {linkBookingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Share Meeting Link</h3>
                 <button onClick={() => setLinkBookingId(null)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"><XCircle className="h-5 w-5" /></button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                  Provide your Zoom, Google Meet, or Skype link. We will notify the student via email immediately.
                </p>
                <input 
                   type="url" 
                   placeholder="https://meet.google.com/abc-defg-hij"
                   value={meetingUrl} 
                   onChange={e => setMeetingUrl(e.target.value)}
                   className="w-full h-16 rounded-2xl border border-slate-100 bg-slate-50 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                />
              </div>

              <Button 
                onClick={handleSetLink} 
                className="w-full h-16 rounded-2xl bg-secondary text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-secondary/20"
                disabled={submiting || !meetingUrl.trim()}
              >
                 {submiting ? <Loader2 className="h-5 w-5 animate-spin mx-auto text-white" /> : "Send Link to Student"}
              </Button>
           </div>
        </div>
      )}
    </div>
  );
}

