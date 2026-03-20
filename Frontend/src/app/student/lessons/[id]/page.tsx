"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, CheckCircle2, XCircle, Info, BookOpen, Mic, MicOff, SettingsIcon
} from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, evaluateSpeaking, Lesson, Question } from "@/services/lessonService";
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
  const [backendMessage, setBackendMessage] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("loading");
  const [score, setScore] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

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
    if (feedback[qId] === "correct") return;
    setSelected((prev) => ({ ...prev, [qId]: idx }));

    if (idx === correctIdx) {
      setFeedback((prev) => ({ ...prev, [qId]: "correct" }));
      setTimeout(() => {
        if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1);
      }, 1000);
    } else {
      setFeedback((prev) => ({ ...prev, [qId]: "incorrect" }));
      setWrongAttempts((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
    }
  };

  const handleManualNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await processSpeakingAttempt(base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access is required for speaking exercises.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessingAudio(true);
    }
  };

  const processSpeakingAttempt = async (base64Audio: string) => {
    const qId = questions[currentQ]._id;
    try {
      const result = await evaluateSpeaking(id, qId, base64Audio);
      if (result.passed) {
        setFeedback((prev) => ({ ...prev, [qId]: "correct" }));
        setBackendMessage((prev) => ({ ...prev, [qId]: result.message }));
        setSelected((prev) => ({ ...prev, [qId]: 0 })); // mark as answered internally
        setTimeout(() => {
          if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1);
        }, 2000);
      } else {
        setFeedback((prev) => ({ ...prev, [qId]: "incorrect" }));
        setWrongAttempts((prev) => ({ ...prev, [qId]: (prev[qId] || 0) + 1 }));
        setBackendMessage((prev) => ({ ...prev, [qId]: result.message }));
      }
    } catch {
      alert("Failed to evaluate speech. Please try again.");
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = Object.entries(selected).map(([questionId, selectedOptionIndex]) => {
         const isSpeaking = questions.find(q => q._id === questionId)?.type === 'speaking';
         return { questionId, selectedOptionIndex: isSpeaking ? 0 : selectedOptionIndex, isSpeakingCompleted: isSpeaking ? true : undefined };
      });
      const result = await submitAnswers(id, answers);
      setScore({ ...result, score: correctAnswersCount * 10, total: questions.length * 10 });
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
              onClick={() => { setPhase("ready"); setSelected({}); setFeedback({}); setWrongAttempts({}); setCurrentQ(0); setBackendMessage({}); }}
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
  const backendMsg = qId ? backendMessage[qId] : null;

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
          {currentQuestion.type === 'speaking' ? (
             <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-sm font-bold dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300">
               <Mic className="w-4 h-4" /> Speaking Practice
             </div>
          ) : null}

          <h2 className={cn("font-bold text-slate-800 dark:text-slate-100", currentQuestion.type === 'speaking' ? "text-2xl" : "text-3xl")}>
            {currentQuestion.text}
          </h2>
          
          {currentQuestion.type === 'speaking' && currentQuestion.expectedAudioText && (
             <h3 className="mt-8 text-5xl font-black text-mozhi-primary dark:text-mozhi-secondary">
               {currentQuestion.expectedAudioText}
             </h3>
          )}

          {currentQuestion.type === 'speaking' ? (
             <div className="mt-14 w-full max-w-xl flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 font-bold mb-6 dark:text-slate-400">
                   {isRecording ? "Recording... Tap to stop" : isProcessingAudio ? "Checking pronunciation..." : currFeedback === "correct" ? "Great job!" : "Tap the microphone and say it aloud"}
                </p>
                <div className="relative">
                   {isRecording && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30 scale-150" />}
                   <button
                     onClick={isRecording ? handleStopRecording : handleStartRecording}
                     disabled={isProcessingAudio || currFeedback === "correct"}
                     className={cn(
                        "relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all focus:outline-none focus:ring-4 focus:ring-offset-4 dark:focus:ring-offset-slate-900",
                        isRecording 
                           ? "bg-red-500 text-white hover:bg-red-600 shadow-red-500/40 focus:ring-red-500/30 scale-105"
                           : isProcessingAudio || currFeedback === "correct"
                           ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                           : "bg-mozhi-primary text-white hover:bg-mozhi-primary-dark shadow-mozhi-primary/40 focus:ring-mozhi-primary/30 hover:scale-105"
                     )}
                   >
                     {isProcessingAudio ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                     ) : isRecording ? (
                        <MicOff className="h-10 w-10" />
                     ) : (
                        <Mic className="h-10 w-10" />
                     )}
                   </button>
                </div>
             </div>
          ) : (
            <div className="mt-12 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selected[qId] === idx;
                let btnState = "default";
                if (isSelected && currFeedback === "correct") btnState = "correct";
                if (isSelected && currFeedback === "incorrect") btnState = "incorrect";
                if (currFeedback === "correct" && idx === currentQuestion.correctOptionIndex) btnState = "correct"; 

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
          )}

          {/* Logic Retry Feedback */}
          {currFeedback === "incorrect" && (
             <div className="mt-8 flex items-start gap-3 text-left w-full max-w-2xl bg-red-50 border border-red-200 rounded-2xl p-4 dark:bg-red-950/20 dark:border-red-900/40 animate-in slide-in-from-bottom-2">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-red-800 dark:text-red-400">
                     {currentQuestion.type === 'speaking' ? "We couldn't quite catch that." : "Not quite right."}
                   </p>
                   {attempts === 1 && <p className="text-sm font-medium text-red-700 mt-1 dark:text-red-300">
                     {currentQuestion.type === 'speaking' ? "Make sure you're in a quiet place and speaking clearly. Let's try once more." : "Try sounding out the letters carefully."}
                   </p>}
                   {attempts >= 2 && <p className="text-sm font-medium text-red-700 mt-1 dark:text-red-300">
                     {currentQuestion.type === 'speaking' ? "Remember to emphasize the vowel sound completely before ending the word. You can do this!" : "Think about standard grammatical shapes. Try again."}
                   </p>}
                   {backendMsg && <p className="text-xs font-semibold text-red-900/50 mt-2 dark:text-red-200/50">{backendMsg}</p>}
                </div>
             </div>
          )}

          {currFeedback === "correct" && (
             <div className="mt-8 flex items-start gap-3 text-left w-full max-w-2xl bg-emerald-50 border border-emerald-200 rounded-2xl p-4 dark:bg-emerald-950/30 dark:border-emerald-900/50 animate-in slide-in-from-bottom-2">
                <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-400 mt-0.5">
                   <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                   <p className="font-bold text-emerald-800 dark:text-emerald-400 text-lg">Excellent!</p>
                   {backendMsg && (
                     <div className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-500 flex items-center gap-1.5 opacity-80 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded inline-flex">
                       <SettingsIcon className="h-3 w-3" /> {backendMsg}
                     </div>
                   )}
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