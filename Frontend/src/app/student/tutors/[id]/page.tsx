"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Loader2, AlertCircle, Globe, Clock, Wifi, Layers,
  BookOpen, MessageSquare, CheckCircle2, X, GraduationCap, Send,
} from "lucide-react";
import { getTutorById, requestTutor, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  intermediate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  advanced:     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};

const modeLabel: Record<string, string> = {
  online: "Online", offline: "In-Person", both: "Online & In-Person",
};

// ── Ask-Question Modal ────────────────────────────────────────────────────────
function AskModal({
  tutor,
  onClose,
}: {
  tutor: Tutor;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!question.trim()) return;
    setSending(true);
    setError(null);
    try {
      await requestTutor({ teacherId: tutor._id, question: question.trim() });
      setSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to send. Please check your credits and try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        {sent ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Question Sent!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              <strong>{tutor.name}</strong> will respond soon. You'll receive their answer in your requests section.
            </p>
            <button onClick={onClose} className="mt-2 rounded-2xl bg-mozhi-primary px-8 py-3 text-sm font-bold text-white hover:bg-mozhi-primary-dark transition-colors">
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ask {tutor.name} a Question</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Costs 10 credits · Tutor will answer directly</p>
              </div>
              <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <textarea
              autoFocus
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your Tamil learning question here… e.g. 'Can you explain the difference between ழ (zha) and ல (la)?'"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mozhi-primary/30 resize-none"
            />

            {error && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl px-3 py-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}

            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={onClose} className="rounded-2xl border border-slate-200 dark:border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !question.trim()}
                className="flex items-center gap-2 rounded-2xl bg-mozhi-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-mozhi-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending…" : "Send Question"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function TutorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);

  useEffect(() => {
    getTutorById(id)
      .then(setTutor)
      .catch(() => setError("Could not load tutor profile."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
    </div>
  );

  if (error || !tutor) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="font-semibold text-slate-600 dark:text-slate-300">{error ?? "Tutor not found."}</p>
      <Link href="/student/tutors" className="text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary">← Back to Tutors</Link>
    </div>
  );

  return (
    <>
      {showAskModal && <AskModal tutor={tutor} onClose={() => setShowAskModal(false)} />}

      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        {/* Back nav */}
        <Link
          href="/student/tutors"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-mozhi-primary dark:text-slate-400 dark:hover:text-mozhi-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tutors
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ── Left: Profile Content ── */}
          <div className="flex flex-col gap-6 lg:col-span-2">

            {/* Profile header card */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm overflow-hidden">
              {/* Top gradient band */}
              <div className="h-20 bg-gradient-to-r from-mozhi-primary/10 via-mozhi-secondary/10 to-transparent" />
              <div className="flex flex-col sm:flex-row gap-5 px-6 pb-6 -mt-10">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-mozhi-light dark:bg-mozhi-primary/30 ring-4 ring-white dark:ring-slate-800 shadow-md">
                    {tutor.profilePhoto ? (
                      <img src={tutor.profilePhoto} alt={tutor.name} className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-mozhi-primary dark:text-mozhi-secondary">{tutor.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-slate-800",
                    tutor.isTutorAvailable ? "bg-emerald-500" : "bg-slate-400"
                  )} />
                </div>

                <div className="flex-1 pt-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{tutor.name}</h1>
                      <p className="text-sm font-bold text-mozhi-primary dark:text-mozhi-secondary mt-0.5">
                        {tutor.specialization ?? "Tamil Language Tutor"}
                      </p>
                      {tutor.experience && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{tutor.experience}</p>
                      )}
                    </div>
                    <span className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      tutor.isTutorAvailable
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    )}>
                      {tutor.isTutorAvailable ? "● Available" : "● Unavailable"}
                    </span>
                  </div>

                  {/* Quick meta tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tutor.levelSupport?.map(level => (
                      <span key={level} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", levelColors[level])}>
                        {level}
                      </span>
                    ))}
                    {tutor.teachingMode && (
                      <span className="flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-900/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300">
                        {tutor.teachingMode === "online" ? <Wifi className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
                        {modeLabel[tutor.teachingMode]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About section */}
            {tutor.bio && (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm p-6">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-mozhi-secondary" /> About {tutor.name.split(" ")[0]}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line">{tutor.bio}</p>
              </div>
            )}

            {/* Teaching details */}
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-mozhi-secondary" /> Teaching Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tutor.languages?.length ? (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <Globe className="h-5 w-5 text-mozhi-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Languages</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{tutor.languages.join(", ")}</p>
                    </div>
                  </div>
                ) : null}
                {tutor.responseTime && (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <Clock className="h-5 w-5 text-mozhi-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Response Time</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{tutor.responseTime}</p>
                    </div>
                  </div>
                )}
                {tutor.teachingMode && (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    {tutor.teachingMode === "online" ? <Wifi className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" /> : <Layers className="h-5 w-5 text-sky-500 mt-0.5 shrink-0" />}
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mode</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{modeLabel[tutor.teachingMode]}</p>
                    </div>
                  </div>
                )}
                {tutor.levelSupport?.length ? (
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
                    <BookOpen className="h-5 w-5 text-mozhi-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Supports</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200 capitalize">{tutor.levelSupport.join(", ")}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Placeholder testimonials banner */}
            <div className="rounded-3xl border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">Student Reviews</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Reviews from previous students will appear here once sessions are completed.
              </p>
            </div>
          </div>

          {/* ── Right: Booking Widget ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-md p-6">
              {/* Rate */}
              {tutor.hourlyRate ? (
                <div className="flex items-baseline justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{tutor.hourlyRate} XP</span>
                  <span className="text-sm text-slate-400">/ session</span>
                </div>
              ) : null}

              {/* Availability indicator */}
              <div className={cn(
                "flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold",
                tutor.isTutorAvailable
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
              )}>
                <span className={cn("h-2.5 w-2.5 rounded-full", tutor.isTutorAvailable ? "bg-emerald-500" : "bg-slate-400")} />
                {tutor.isTutorAvailable ? "Available for questions" : "Currently unavailable"}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col gap-3 pt-1">
                <button
                  onClick={() => setShowAskModal(true)}
                  disabled={!tutor.isTutorAvailable}
                  className="flex items-center justify-center gap-2 w-full rounded-2xl bg-mozhi-primary py-3.5 text-sm font-bold text-white shadow-sm shadow-mozhi-primary/20 transition-all hover:bg-mozhi-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-mozhi-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask a Question
                </button>
                <Link
                  href="/student/progress"
                  className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-slate-200 dark:border-slate-700 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-mozhi-primary hover:text-mozhi-primary dark:hover:border-mozhi-secondary dark:hover:text-mozhi-secondary transition-colors"
                >
                  View My Requests
                </Link>
              </div>

              {/* Credit note */}
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Asking a question costs <strong className="text-slate-600 dark:text-slate-300">10 credits</strong>. Credits are refunded if declined.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}