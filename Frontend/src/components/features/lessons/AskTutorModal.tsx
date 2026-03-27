"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, User, AlertCircle, CheckCircle2, Send } from "lucide-react";
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
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [askQuestion, setAskQuestion] = useState("");
  const [askSubmitting, setAskSubmitting] = useState(false);
  const [askSuccess, setAskSuccess] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAskSuccess(false);
      setAskError(null);
      setAskQuestion("");
      setSelectedTutorId("");
      
      if (tutors.length === 0) {
        setTutorsLoading(true);
        getAvailableTutors(1, 6)
          .then(res => {
            setTutors(res.tutors);
            if (res.tutors.length > 0) setSelectedTutorId(res.tutors[0]._id);
          })
          .catch(() => {})
          .finally(() => setTutorsLoading(false));
      } else if (tutors.length > 0 && !selectedTutorId) {
        setSelectedTutorId(tutors[0]._id);
      }
    }
  }, [isOpen]);

  const handleAskSubmit = async () => {
    if (!askQuestion.trim() || !selectedTutorId) return;
    setAskSubmitting(true);
    setAskError(null);
    try {
      await requestTutor({
        teacherId: selectedTutorId,
        lessonId,
        requestType: "question",
        content: askQuestion.trim(),
        metadata: {
          lessonTitle: lessonTitle || "Unknown",
          lessonModule: lessonModule || 0,
          topics: [lessonTitle || "General"],
        },
      });
      setAskSuccess(true);
      setAskQuestion("");
    } catch (e: any) {
      setAskError(e.response?.data?.error?.message || e.response?.data?.message || "Failed to send question.");
    } finally {
      setAskSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scholar Intervention"
      description="Initiate a direct query with a linguistic expert regarding this specific module."
      size="lg"
    >
      <div className="space-y-10">
        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Available Scholarly Network</h4>
          {tutorsLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary/30" />
            </div>
          ) : tutors.length === 0 ? (
             <div className="text-center bg-gray-50 border-dashed p-6 rounded-2xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-400 italic">No mentors currently connected for this domain.</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {tutors.map((t) => (
                <button
                  key={t._id}
                  onClick={() => setSelectedTutorId(t._id)}
                  className={cn(
                    "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group",
                    selectedTutorId === t._id ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" : "bg-white border-gray-100 hover:border-primary/30"
                  )}
                >
                  <div className="h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                    {t.profilePhoto ? (
                      <img src={t.profilePhoto} alt={t.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <User className="h-8 w-8 text-gray-300" />
                    )}
                  </div>
                  <div className="text-center">
                     <p className="text-sm font-black text-gray-800 mb-1 uppercase tracking-tight">{t.name}</p>
                     <p className="text-[9px] font-black uppercase text-primary tracking-widest bg-primary/5 px-2 py-0.5 rounded-md">{t.specialization || "Tutor"}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Your Query</h4>
          <Input
            multiline
            rows={5}
            placeholder="State your linguistic challenge clearly..."
            value={askQuestion}
            onChange={(e) => setAskQuestion(e.target.value)}
            className="text-lg font-medium italic"
          />
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
          {askError && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-2">
              <AlertCircle size={14} /> {askError}
            </p>
          )}
          {askSuccess && !askError && (
            <p className="text-xs font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 size={14} /> Interrogatory sent to portal successfully.
            </p>
          )}
          <div className="flex items-center gap-4 ml-auto">
            <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-[10px]">Close Portal</Button>
            <Button
              onClick={handleAskSubmit}
              isLoading={askSubmitting}
              disabled={!askQuestion.trim() || !selectedTutorId}
              size="lg"
              className="px-12 rounded-2xl shadow-xl shadow-primary/20"
            >
              Launch Query <Send size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
