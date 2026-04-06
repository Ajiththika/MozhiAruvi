"use client";

import React, { useState } from "react";
import { 
  X, Send, Loader2, CheckCircle2, AlertCircle, 
  MessageSquare, Video, Layers, Calendar, Clock, Hash, BookOpen
} from "lucide-react";
import { Tutor, requestTutor, RequestTutorPayload } from "@/services/tutorService";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type RequestType = "live_class" | "multi_class";

interface TutorRequestModalProps {
  tutor: Tutor;
  onClose: () => void;
  initialType?: RequestType;
}

const REQUEST_INFO = (tutor: Tutor) => ({
  live_class: {
    label: "1h Class",
    icon: Video,
    price: tutor.oneClassFee || 30,
    description: `Private 1-hour session with ${tutor.name} ($${tutor.oneClassFee || 30})`,
    placeholder: "What specific Tamil topics would you like to cover in this session?",
  },
  multi_class: {
    label: "8-Class Mastery Hub",
    icon: Layers,
    price: tutor.eightClassFee || 200,
    description: `Intensive 8-session deep dive ($${tutor.eightClassFee || 200})`,
    placeholder: "Describe your long-term learning goals for this 8-class journey…",
  },
});

export function TutorRequestModal({ tutor, onClose, initialType = "live_class" }: TutorRequestModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<RequestType>(initialType);
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState<{
    preferredTime?: string;
    studentName?: string;
    studentAge?: string;
    studentEmail?: string;
    studentCountry?: string;
    sessionsCount?: number;
  }>({
    studentName: user?.name || "",
    studentEmail: user?.email || "",
    studentAge: user?.age ? String(user?.age) : "",
    studentCountry: user?.country || "",
  });
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    
    setSending(true);
    setError(null);
    try {
      const { data } = await api.post('/bookings/initiate', {
        tutorId: tutor._id,
        requestType: type,
        content: content.trim(),
        date: new Date().toISOString(),
        startTime: metadata.preferredTime || "TBD",
        duration: type === "multi_class" ? 45 : 60,
        isPackage: type === "multi_class",
        ...metadata,
      });

      if (data.url) window.location.href = data.url;
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to initiate payment. Please check your Stripe status.");
    } finally {
      setSending(false);
    }
  };

  const info = REQUEST_INFO(tutor)[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-100  shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {sent ? (
          <div className="flex flex-col items-center gap-6 py-16 px-10 text-center animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center mb-2 shadow-inner border border-emerald-100">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold text-slate-800">Request Sent!</h3>
              <p className="text-primary/70 font-medium leading-relaxed">
                Your <strong>{info.label}</strong> has been successfully beamed to <strong>{tutor.name}</strong>. 
                Keep an eye on your Inbox for their expert response.
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="mt-4 w-full rounded-[1.5rem] bg-primary py-4 text-sm font-bold text-white shadow-xl hover:bg-secondary transition-all duration-300 active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-slate-50/50 p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  <info.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 tracking-tight">Direct Booking</h3>
                  <p className="text-[10px] text-primary/70 font-black uppercase tracking-widest">Mentor: {tutor.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 rounded-full hover:bg-slate-200/50 flex items-center justify-center transition-colors border border-transparent hover:border-slate-100"
              >
                <X className="h-5 w-5 text-primary/60" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 scrollbar-hide" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-3 pb-1">
                {(Object.keys(REQUEST_INFO(tutor)) as RequestType[]).map((key) => {
                  const item = REQUEST_INFO(tutor)[key];
                  const Icon = item.icon;
                  const active = type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={cn(
                        "group/type flex flex-row items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                        active 
                          ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                          : "border-slate-50 hover:border-slate-100 hover:bg-slate-50/50"
                      )}
                    >
                      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", active ? "bg-primary text-white" : "bg-white text-primary/40 border border-slate-100")}>
                         <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                         <span className={cn("block text-[10px] font-black uppercase tracking-wider truncate", active ? "text-primary" : "text-primary/40")}>
                           {key.replace("_", " ")}
                         </span>
                         <span className={cn("block text-xs font-black", active ? "text-primary/60" : "text-slate-400")}>
                           ${item.price}
                         </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Student Details Verification */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5 min-w-0">
                    <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest ml-1">Student Name</label>
                    <input 
                      type="text" 
                      value={metadata.studentName} 
                      onChange={(e) => setMetadata({ ...metadata, studentName: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
                 <div className="space-y-1.5 min-w-0">
                    <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest ml-1">Age</label>
                    <input 
                      type="number" 
                      value={metadata.studentAge} 
                      onChange={(e) => setMetadata({ ...metadata, studentAge: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
                 <div className="space-y-1.5 min-w-0">
                    <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      value={metadata.studentEmail} 
                      onChange={(e) => setMetadata({ ...metadata, studentEmail: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
                 <div className="space-y-1.5 min-w-0">
                    <label className="text-[9px] font-black text-primary/70 uppercase tracking-widest ml-1">Country</label>
                    <input 
                      type="text" 
                      value={metadata.studentCountry} 
                      onChange={(e) => setMetadata({ ...metadata, studentCountry: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 px-4 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
              </div>

              {/* Main Content Area */}
              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Description
                  </label>
                  <textarea
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={info.placeholder}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                </div>

                {type === "live_class" && (
                   <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-primary/70 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Preferred Time & Day
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wednesday 6:00 PM EST"
                      value={metadata.preferredTime || ""}
                      onChange={(e) => setMetadata({ ...metadata, preferredTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {type === "multi_class" && (
                   <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary/70 uppercase tracking-widest">Sessions</label>
                        <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-primary/40">
                          8 Sessions
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-primary/70 uppercase tracking-widest">Duration</label>
                        <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-primary/40">
                          45m per session
                        </div>
                      </div>
                   </div>
                )}
              </div>
            </div>

            {/* Sticky Footnote & Footer */}
            <div className="bg-slate-50/50 p-6 space-y-4 border-t border-slate-100 shrink-0">
               {/* Price Note */}
               <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                 <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                    <Hash className="h-4 w-4 text-primary" />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest leading-none mb-1">Transaction Total</p>
                    <p className="text-sm font-black text-slate-700">${info.price} USD</p>
                 </div>
                 {(error && typeof error === 'string' && error.length > 0) && (
                   <div className="flex items-center gap-1 text-red-500 font-black text-[9px] bg-red-50 px-2 py-1 rounded-lg border border-red-100 shrink-0 animate-pulse">
                     <AlertCircle className="h-3 w-3" /> Error
                   </div>
                 )}
               </div>

               {/* Footer Actions */}
               <div className="flex gap-4">
                 <button 
                   onClick={onClose} 
                   className="flex-1 rounded-[1.5rem] border border-slate-100 bg-white py-4 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:bg-slate-50 transition-all"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handleSend}
                   disabled={sending || !content.trim()}
                   className="flex-[2] flex items-center justify-center gap-3 rounded-[1.5rem] bg-primary py-4 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:scale-[1.02] hover:bg-secondary active:scale-[0.98] disabled:opacity-30 transition-all"
                 >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <div className="h-5 w-5 rounded-full border-2 border-white/40 flex items-center justify-center text-[10px] font-bold">$</div>}
                    {sending ? "Processing..." : `Pay & Book Now`}
                 </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

















