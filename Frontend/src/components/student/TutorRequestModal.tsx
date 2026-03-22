"use client";

import React, { useState } from "react";
import { 
  X, Send, Loader2, CheckCircle2, AlertCircle, 
  MessageSquare, Video, Layers, Calendar, Clock, Hash, BookOpen
} from "lucide-react";
import { Tutor, requestTutor, RequestTutorPayload } from "@/services/tutorService";
import { cn } from "@/lib/utils";

type RequestType = "question" | "live_class" | "multi_class";

interface TutorRequestModalProps {
  tutor: Tutor;
  onClose: () => void;
  initialType?: RequestType;
}

const REQUEST_INFO = {
  question: {
    label: "Ask a Question",
    icon: MessageSquare,
    price: 10,
    description: "Brief question or clarification (10 XP)",
    placeholder: "Type your Tamil learning question here…",
  },
  live_class: {
    label: "Live 1-on-1 Class",
    icon: Video,
    price: 30,
    description: "Request a 45-min live session (30 XP)",
    placeholder: "What would you like to learn in this session?",
  },
  multi_class: {
    label: "Multi-Session Package",
    icon: Layers,
    price: 100,
    description: "Intensive 5-session package (100 XP)",
    placeholder: "Describe your learning goals for this package…",
  },
};

export function TutorRequestModal({ tutor, onClose, initialType = "question" }: TutorRequestModalProps) {
  const [type, setType] = useState<RequestType>(initialType);
  const [content, setContent] = useState("");
  const [metadata, setMetadata] = useState<{
    preferredTime?: string;
    sessionsCount?: number;
    additionalNotes?: string;
    topics?: string[];
  }>({});
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!content.trim()) return;
    
    setSending(true);
    setError(null);
    try {
      const payload: RequestTutorPayload = {
        teacherId: tutor._id,
        requestType: type,
        content: content.trim(),
        metadata: {
          ...metadata,
          sessionsCount: type === "multi_class" ? 5 : undefined,
        }
      };
      
      await requestTutor(payload);
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to send request. Check your balance.");
    } finally {
      setSending(false);
    }
  };

  const info = REQUEST_INFO[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-12 px-8 text-center">
            <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100">Request Sent!</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Your <strong>{info.label}</strong> request has been sent to <strong>{tutor.name}</strong>. 
              We'll notify you when the teacher responds.
            </p>
            <button 
              onClick={onClose} 
              className="mt-6 w-full rounded-2xl bg-mozhi-primary py-4 text-sm font-bold text-white shadow-lg shadow-mozhi-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center">
                  <info.icon className="h-5 w-5 text-mozhi-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Request</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Send to {tutor.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="h-10 w-10 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(REQUEST_INFO) as RequestType[]).map((key) => {
                  const item = REQUEST_INFO[key];
                  const Icon = item.icon;
                  const active = type === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center",
                        active 
                          ? "border-mozhi-primary bg-mozhi-primary/[0.03] ring-2 ring-mozhi-primary/20" 
                          : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-mozhi-primary" : "text-slate-400")} />
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", active ? "text-mozhi-primary" : "text-slate-500")}>
                        {key.replace("_", " ")}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3" /> Description
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={info.placeholder}
                    className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-mozhi-primary/20 transition-all resize-none"
                  />
                </div>

                {type === "live_class" && (
                   <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Preferred Time & Day
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wednesday 6:00 PM EST"
                      value={metadata.preferredTime || ""}
                      onChange={(e) => setMetadata({ ...metadata, preferredTime: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-mozhi-primary/20"
                    />
                  </div>
                )}

                {type === "multi_class" && (
                   <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sessions</label>
                        <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                          5 Sessions
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</label>
                        <div className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                          45m per session
                        </div>
                      </div>
                   </div>
                )}
              </div>

              {/* Price Note */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-mozhi-primary/5 border border-mozhi-primary/10">
                <Hash className="h-5 w-5 text-mozhi-primary" />
                <div className="flex-1">
                   <p className="text-[10px] font-bold text-mozhi-primary uppercase tracking-widest">Service Cost</p>
                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{info.price} XP points</p>
                </div>
                {error && (
                  <div className="flex items-center gap-1 text-red-500 font-bold text-xs">
                    <AlertCircle className="h-3 w-3" /> Balance low
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {/* Footer */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={onClose} 
                  className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={sending || !content.trim()}
                  className="flex-[2] flex items-center justify-center gap-2 rounded-2xl bg-mozhi-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-mozhi-primary/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 transition-all"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Sending Request..." : `Request for ${info.price} XP`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
