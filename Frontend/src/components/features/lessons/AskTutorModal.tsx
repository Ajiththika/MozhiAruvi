"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Loader2, User, AlertCircle, CheckCircle2, Send, Zap } from "lucide-react";
import { getAvailableTutors, requestTutor, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";

interface AskTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonTitle?: string;
  lessonModule?: number;
}

export function AskTutorModal({ isOpen, onClose, lessonId, lessonTitle, lessonModule }: AskTutorModalProps) {
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
  }, [isOpen]);

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
      description="Connect with Mozhi Aruvi scholars to resolve linguistic complexity."
      size="lg"
    >
      <div className="space-y-10">
        {/* Help Type Selection */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Intervention Type</h4>
          <div className="grid grid-cols-3 gap-4">
             {(['doubt', 'speaking', 'practice'] as const).map(type => (
               <button
                key={type}
                onClick={() => setRequestType(type)}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-tight",
                  requestType === type ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white border-slate-100 text-slate-400 hover:border-primary/30"
                )}
               >
                {type}
               </button>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Scholarly Selection</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* Auto Assign Card */}
            <button
                  onClick={() => setSelectedTutorId(null)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group",
                    selectedTutorId === null ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" : "bg-white border-slate-100 hover:border-primary/30"
                  )}
            >
                <div className="h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                   <Zap size={32} />
                </div>
                <div className="text-center">
                   <p className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight">Auto-Assign</p>
                   <p className="text-[8px] font-black uppercase text-primary tracking-widest">Recommended</p>
                </div>
            </button>

            {!tutorsLoading && tutors.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTutorId(t._id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group",
                    selectedTutorId === t._id ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" : "bg-white border-slate-100 hover:border-primary/30"
                  )}
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 group-hover:scale-110 transition-transform overflow-hidden">
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="h-full w-full bg-slate-200 flex items-center justify-center"><User className="h-8 w-8 text-primary/40" /></div>
                    )}
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-slate-800 mb-1 uppercase tracking-tight truncate w-24">{t.name}</p>
                     <p className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/5 px-2 py-0.5 rounded-md truncate w-24">{t.specialization || "Expert"}</p>
                  </div>
                </button>
            ))}

            {tutorsLoading && [1,2].map(i => (
               <div key={i} className="h-40 rounded-3xl bg-slate-50 animate-pulse border border-slate-100" />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Your Linguistic Challenge</h4>
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Cost: {requestType === 'speaking' ? 20 : requestType === 'practice' ? 15 : 10} Tokens</span>
          </div>
          <Input
            multiline
            rows={4}
            placeholder="Describe your difficulty clearly..."
            value={askQuestion}
            onChange={(e) => setAskQuestion(e.target.value)}
            className="text-lg font-medium bg-slate-50 border-transparent focus:bg-white"
          />
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          {askError && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
              <AlertCircle size={14} /> {askError}
            </p>
          )}
          <div className="flex items-center gap-4 ml-auto w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-[10px] hidden sm:flex">Abort</Button>
            <Button
              onClick={handleAskSubmit}
              isLoading={askSubmitting}
              disabled={!askQuestion.trim()}
              size="xl"
              className="w-full sm:w-auto px-12 rounded-3xl shadow-2xl shadow-primary/30"
            >
              Launch Query <Send size={16} className="ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}




export default AskTutorModal;













