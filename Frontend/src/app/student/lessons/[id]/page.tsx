"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, CheckCircle2, XCircle, Info, BookOpen
} from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, Lesson, Question } from "@/services/lessonService";
import { cn } from "@/lib/utils";

type Phase = "loading" | "error" | "ready" | "submitted";

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect">>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>("loading");
  const [score, setScore] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  useEffect(() => {
    Promise.all([getLessonById(id), getLessonQuestions(id)])
      .then(([l, qs]) => {
        setLesson(l);
        setQuestions(qs);
        setPhase("ready");
      })
      .catch(() => setPhase("error"));
  }, [id]);

  const correctAnswersCount = Object.values(feedback).filter(f => f === "correct").length;
  const progress = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  const handleSelect = (qId: string, idx: number, correctIdx?: number) => {
    // Lock if already correctly answered
    if (feedback[qId] === "correct") return;

    setSelected((prev) => ({ ...prev, [qId]: idx }));

    if (idx === correctIdx) {
      setFeedback((prev) => ({ ...prev, [qId]: "correct" }));
      setTimeout(() => {
        if (currentQ < questions.length - 1) {
          setCurrentQ((c) => c + 1);
        }
      }, 1000);
    } else {
      setFeedback((prev) => ({ ...prev, [qId]: "incorrect" }));
      setWrongAttempts((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
    }
  };

  const handleManualNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Create answers payload only using selected responses
      const answers = Object.entries(selected).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      }));
      const result = await submitAnswers(id, answers);
      setScore({ ...result, score: correctAnswersCount * 10, total: questions.length * 10 }); // Frontend override for UI simplicity
      setPhase("submitted");
    } catch {
      alert("Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
        <p className="text-sm font-medium text-slate-600">Loading lesson...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="font-medium text-slate-600 dark:text-slate-200">Could not load this lesson.</p>
        <button onClick={() => router.back()} className="text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  if (phase === "submitted" && score) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center animate-in fade-in zoom-in-95 duration-500">
        {score.passed ? (
          <CheckCircle2 className="h-20 w-20 text-emerald-500" />
        ) : (
          <XCircle className="h-20 w-20 text-red-500" />
        )}
        <div>
          <h2 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">
            {score.passed ? "Lesson Complete! 🎉" : "Keep Practicing!"}
          </h2>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            You scored <strong className="text-slate-900 dark:text-white">{score.score}</strong> out of{" "}
            <strong className="text-slate-900 dark:text-white">{score.total}</strong>
          </p>
        </div>
        <div className="flex gap-4 mt-4">
          <Link href="/student/lessons" className="rounded-2xl border-2 border-slate-200 px-8 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            Back to Path
          </Link>
          {!score.passed && (
            <button
              onClick={() => { setPhase("ready"); setSelected({}); setFeedback({}); setWrongAttempts({}); setCurrentQ(0); }}
              className="rounded-2xl bg-mozhi-primary px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-mozhi-primary/20 transition-transform active:scale-95 hover:bg-mozhi-primary-dark"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];
  const qId = currentQuestion?._id;
  const currFeedback = qId ? feedback[qId] : null;
  const attempts = qId ? (wrongAttempts[qId] || 0) : 0;

  return (
    <div className="flex flex-col min-h-[85vh] animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/student/lessons"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {lesson?.title}
            </h1>
            <p className="text-sm font-bold text-mozhi-primary dark:text-mozhi-secondary uppercase tracking-wider mt-0.5">
              Level {lesson?.moduleNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 w-40 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-spring" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{progress}%</span>
        </div>
      </div>

      {questions.length === 0 ? (
        /* Lesson has no quiz questions – show content */
        <div className="mt-8 flex-1">
          {lesson?.content ? (
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
              <BookOpen className="h-16 w-16 text-mozhi-secondary/50" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">This active lesson module has no graded exercises yet.</p>
              <Link href="/student/lessons" className="mt-2 text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary transition-colors">← Return to Learning Path</Link>
            </div>
          )}
        </div>
      ) : (
        /* Quiz mode (Duolingo Style Progression) */
        <div className="mt-8 flex w-full flex-1 flex-col items-center justify-start text-center pt-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {currentQuestion.text}
          </h2>

          <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selected[qId] === idx;
              let btnState = "default";
              
              if (isSelected && currFeedback === "correct") btnState = "correct";
              if (isSelected && currFeedback === "incorrect") btnState = "incorrect";
              if (currFeedback === "correct" && idx === currentQuestion.correctOptionIndex) btnState = "correct"; // Highlight correct answer if they failed earlier? (Optional, let's keep it clean)

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(qId, idx, currentQuestion.correctOptionIndex)}
                  disabled={currFeedback === "correct"}
                  className={cn(
                     "relative rounded-2xl border-2 p-5 text-lg font-bold transition-all disabled:opacity-90",
                     btnState === "correct" 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 scale-[1.02]"
                        : btnState === "incorrect"
                        ? "border-red-400 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-400"
                        : "border-slate-200 bg-white text-slate-700 hover:border-mozhi-primary hover:bg-mozhi-primary/5 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-mozhi-primary dark:hover:bg-slate-800/80"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Logic Retry Feedback */}
          {currFeedback === "incorrect" && (
             <div className="mt-8 flex items-start gap-3 text-left w-full max-w-2xl bg-red-50 border border-red-200 rounded-2xl p-4 dark:bg-red-950/20 dark:border-red-900/40">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-red-800 dark:text-red-400">Not quite right.</p>
                   {attempts === 1 && <p className="text-sm font-medium text-red-700 mt-1 dark:text-red-300">Try sounding out the letters carefully.</p>}
                   {attempts >= 2 && <p className="text-sm font-medium text-red-700 mt-1 dark:text-red-300">Think about standard grammatical shapes. Try again.</p>}
                </div>
             </div>
          )}

          {currFeedback === "correct" && (
             <div className="mt-8 flex items-center justify-between gap-3 text-left w-full max-w-2xl bg-emerald-50 border border-emerald-200 rounded-2xl p-4 dark:bg-emerald-950/30 dark:border-emerald-900/50">
                <div className="flex items-center gap-3 text-emerald-800 dark:text-emerald-400 font-bold text-lg">
                   <CheckCircle2 className="h-6 w-6" /> Excellent!
                </div>
             </div>
          )}

        </div>
      )}

      {/* Footer Controls */}
      {questions.length > 0 && (
        <div className="mt-12 sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-6 py-3.5 font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={handleManualNext}
                  className="rounded-2xl bg-slate-100 text-slate-700 px-8 py-3.5 font-bold shadow-sm transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Skip →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || correctAnswersCount < questions.length}
                  className={cn(
                     "rounded-2xl px-8 py-3.5 font-bold text-white shadow-lg transition-all",
                     correctAnswersCount < questions.length
                        ? "bg-slate-300 opacity-50 cursor-not-allowed dark:bg-slate-700"
                        : "bg-emerald-500 hover:bg-emerald-600 hover:-translate-y-0.5"
                  )}
                >
                  {submitting ? "Finishing..." : "Complete Lesson 🎉"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}