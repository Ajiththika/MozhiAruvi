"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, CheckCircle2, XCircle,
} from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, Lesson, Question } from "@/services/lessonService";

type Phase = "loading" | "error" | "ready" | "submitted";

export default function LessonDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
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

  const progress =
    questions.length > 0
      ? Math.round((Object.keys(selected).length / questions.length) * 100)
      : 0;

  const handleSelect = (qId: string, idx: number) => {
    setSelected((prev) => ({ ...prev, [qId]: idx }));
    // auto-advance
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ((c) => c + 1), 400);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = Object.entries(selected).map(([questionId, selectedOptionIndex]) => ({
        questionId,
        selectedOptionIndex,
      }));
      const result = await submitAnswers(id, answers);
      setScore(result);
      setPhase("submitted");
    } catch {
      // show inline error
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
        <p className="text-sm font-medium text-slate-">Loading lesson...</p>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="font-medium text-slate- dark:text-slate-">Could not load this lesson.</p>
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
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        ) : (
          <XCircle className="h-16 w-16 text-red-500" />
        )}
        <div>
          <h2 className="text-3xl font-extrabold text-slate- dark:text-slate-">
            {score.passed ? "Lesson Complete! 🎉" : "Keep Practicing!"}
          </h2>
          <p className="mt-2 text-lg text-slate-">
            You scored <strong className="text-slate- dark:text-slate-">{score.score}</strong> out of{" "}
            <strong className="text-slate- dark:text-slate-">{score.total}</strong>
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/student/lessons" className="rounded-xl border border-slate- px-6 py-2.5 text-sm font-bold text-slate- hover:bg-slate- dark:border-slate- dark:text-slate- dark:hover:bg-slate-">
            Back to Lessons
          </Link>
          {!score.passed && (
            <button
              onClick={() => { setPhase("ready"); setSelected({}); setCurrentQ(0); }}
              className="rounded-xl bg-mozhi-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-mozhi-primary"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQ];

  return (
    <div className="flex flex-col min-h-[80vh] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate- pb-6 dark:border-slate-">
        <div className="flex items-center gap-4">
          <Link
            href="/student/lessons"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate- text-slate- hover:bg-slate- dark:bg-slate- dark:text-slate- dark:hover:bg-slate- transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
              {lesson?.title}
            </h1>
            <p className="text-sm font-medium text-mozhi-primary dark:text-mozhi-secondary">
              Module {lesson?.moduleNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate- dark:bg-slate-">
            <div className="h-full rounded-full bg-mozhi-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-semibold text-slate-">{progress}%</span>
        </div>
      </div>

      {questions.length === 0 ? (
        /* Lesson has no quiz questions – show content */
        <div className="mx-auto mt-8 max-w-2xl flex-1">
          {lesson?.content ? (
            <div className="prose prose-zinc max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <Play className="h-12 w-12 text-mozhi-secondary" />
              <p className="text-slate- dark:text-slate-">This lesson has no quiz yet. More content coming soon!</p>
              <Link href="/student/lessons" className="text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary">← Back to Curriculum</Link>
            </div>
          )}
        </div>
      ) : (
        /* Quiz mode */
        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-1 flex-col items-center justify-center text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-">
            Question {currentQ + 1} of {questions.length}
          </p>
          <h2 className="mt-4 text-xl font-bold text-slate- dark:text-slate-">
            {currentQuestion.text}
          </h2>

          <div className="mt-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            {currentQuestion.options.map((opt, idx) => {
              const isChosen = selected[currentQuestion._id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(currentQuestion._id, idx)}
                  className={`rounded-2xl border-2 p-4 text-base font-semibold transition-all ${
                    isChosen
                      ? "border-mozhi-primary bg-mozhi-light/50 text-mozhi-primary dark:border-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary"
                      : "border-slate- bg-white text-slate- hover:border-slate- hover:bg-slate- dark:border-slate- dark:bg-slate- dark:text-slate- dark:hover:bg-slate-"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Navigation dots */}
          <div className="mt-8 flex gap-2">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => setCurrentQ(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === currentQ ? "w-6 bg-mozhi-primary" : selected[q._id] !== undefined ? "bg-emerald-500" : "bg-slate- dark:bg-slate-"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {questions.length > 0 && (
        <div className="mt-auto border-t border-slate- pt-6 dark:border-slate-">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 rounded-xl border border-slate- px-4 py-2.5 text-sm font-bold text-slate- transition hover:bg-slate- disabled:opacity-40 dark:border-slate- dark:text-slate-"
            >
              <ArrowLeft className="h-4 w-4" /> Prev
            </button>

            <div className="flex items-center gap-3">
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((c) => c + 1)}
                  className="rounded-xl bg-mozhi-primary px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(selected).length < questions.length}
                  className="rounded-xl bg-emerald-500 px-8 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Answers ✓"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}