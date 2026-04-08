"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Loader2, User, AlertCircle, CheckCircle2, Send, Zap } from "lucide-react";
import { getAvailableTutors, requestTutor, Tutor } from "@/services/tutorService";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface AskTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle?: string;
  lessonModule?: number;
}

export function AskTutorModal({ isOpen, onClose, lessonId, lessonTitle, lessonModule }: AskTutorModalProps) {
  const { user } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null); // null means auto-assign
  const [requestType, setRequestType] = useState<"doubt" | "speaking" | "practice">("doubt");
  const [askQuestion, setAskQuestion] = useState("");
  const [askSubmitting, setAskSubmitting] = useState(false);
  const [askSuccess, setAskSuccess] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAskSuccess(false);
      setAskError(null);
      setAskQuestion("");
      setSelectedTutorId(null); // Default to Auto-assign
      
      if (tutors.length === 0) {
        setTutorsLoading(true);
        getAvailableTutors(1, 4)
          .then(res => {
            setTutors(res.tutors);
          })
          .catch(() => {})
          .finally(() => setTutorsLoading(false));
      }
    }
  }, [isOpen, tutors.length]);

  const handleAskSubmit = async () => {
    if (!askQuestion.trim()) return;
    setAskSubmitting(true);
    setAskError(null);
    try {
      await requestTutor({
        teacherId: selectedTutorId || undefined,
        lessonId,
        requestType: requestType,
        content: askQuestion.trim(),
        metadata: {
          lessonTitle: lessonTitle || "Unknown",
          lessonModule: lessonModule || 0,
          topics: [lessonTitle || "General"],
        },
      });
      setAskSuccess(true);
      setAskQuestion("");
      
      // Auto close after success? Maybe after a delay.
      setTimeout(() => {
        if (askSuccess) onClose();
      }, 3000);
    } catch (e: any) {
      setAskError(e.response?.data?.error?.message || e.response?.data?.message || "Failed to send question.");
      if (e.response?.data?.code === 'LIMIT_REACHED' || e.response?.status === 402) {
        setTimeout(() => {
          window.location.href = "/student/subscription";
        }, 2000);
      }
    } finally {
      setAskSubmitting(false);
    }
  };

  if (askSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Request Dispatched" size="md">
        <div className="py-12 text-center space-y-8 animate-in zoom-in duration-300">
           <div className="h-24 w-24 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
              <CheckCircle2 size={48} />
           </div>
           <div className="space-y-2">
              <h3 className="text-3xl font-black">Agent Assigned</h3>
              <p className="text-slate-500 font-medium">Linguistic expert will analyze your query and respond shortly.</p>
           </div>
           <Button onClick={onClose} size="xl" className="w-full rounded-2xl bg-emerald-500">Back to Lesson</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expert Intervention"
      description="Resolve linguistic complexity with Mozhi Aruvi scholars."
      size="md"
    >
      <div className="space-y-6">
        {/* Help Type Selection */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Intervention Type</h4>
          <div className="flex flex-wrap gap-2">
             {(['doubt', 'speaking', 'practice'] as const).map(type => (
               <button
                key={type}
                onClick={() => setRequestType(type)}
                className={cn(
                  "px-6 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-wider",
                  requestType === type ? "bg-primary text-white border-primary shadow-md shadow-primary/10" : "bg-white border-slate-100 text-slate-400 hover:border-primary/20"
                )}
               >
                {type}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Scholarly Selection</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Auto Assign Card */}
            <button
                  onClick={() => setSelectedTutorId(null)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 group",
                    selectedTutorId === null ? "bg-primary/5 border-primary shadow-md shadow-primary/10" : "bg-white border-slate-100 hover:border-primary/20"
                  )}
            >
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm shrink-0">
                   <Zap size={20} />
                </div>
                <div className="text-left leading-tight">
                   <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Auto-Assign</p>
                   <p className="text-[8px] font-black uppercase text-primary tracking-widest">Speed</p>
                </div>
            </button>

            {!tutorsLoading && tutors.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTutorId(t._id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-300 group",
                    selectedTutorId === t._id ? "bg-primary/5 border-primary shadow-md shadow-primary/10" : "bg-white border-slate-100 hover:border-primary/20"
                  )}
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-0.5 shrink-0 overflow-hidden">
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center"><User className="h-5 w-5 text-primary/40" /></div>
                    )}
                  </div>
                  <div className="text-left leading-tight truncate">
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{t.name}</p>
                     <p className="text-[8px] font-black uppercase text-primary/60 tracking-widest truncate">{t.specialization || "Expert"}</p>
                  </div>
                </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linguistic Challenge</h4>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
               <CheckCircle2 size={10} className="shrink-0" />
               <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                 {(() => {
                    const plan = user?.subscription?.plan || 'FREE';
                    const limit = plan === 'PREMIUM' ? 100 : (plan === 'PRO' ? 50 : 10);
                    return `${limit - (user?.subscription?.tutorSupportUsed || 0)} ${plan} LINKS LEFT`;
                 })()}
               </span>
            </div>
          </div>
          <textarea
            rows={3}
            placeholder="Describe your difficulty clearly..."
            value={askQuestion}
            onChange={(e) => setAskQuestion(e.target.value)}
            className="w-full p-4 text-sm font-bold bg-slate-50 border-2 border-transparent focus:border-primary/10 rounded-2xl outline-none focus:bg-white transition-all placeholder:text-slate-300"
          />
        </div>

        <div className="pt-4 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 ml-auto w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-[9px] hover:bg-slate-100 h-11 px-6">CANCEL</Button>
            <Button
              onClick={handleAskSubmit}
              isLoading={askSubmitting}
              disabled={!askQuestion.trim()}
              className="flex-1 sm:flex-none h-11 px-8 rounded-xl shadow-xl shadow-primary/20 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              ASK QUESTION <Send size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}




export default AskTutorModal;













