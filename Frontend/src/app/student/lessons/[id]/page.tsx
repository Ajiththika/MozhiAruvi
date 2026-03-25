"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, CheckCircle2, XCircle, Info, BookOpen, Mic, MicOff, SettingsIcon, Zap, MessageCircle, X, Send, User } from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, evaluateSpeaking, Lesson, Question } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { consumeCredit } from "@/services/userService";
import { getAvailableTutors, requestTutor, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";

type Phase = "loading" | "ready" | "out_of_credits" | "completed" | "error";

export default function LessonInteractiveSession() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect">>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [backendMessage, setBackendMessage] = useState<Record<string, string>>({});

  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQ, setCurrentQ] = useState(0);

  const [score, setScore] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credits, setCredits] = useState(25);

  // Ask-a-Tutor state
  const [showAskPanel, setShowAskPanel] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [askQuestion, setAskQuestion] = useState("");
  const [askSubmitting, setAskSubmitting] = useState(false);
  const [askSuccess, setAskSuccess] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    Promise.all([getMe(), getLessonById(id), getLessonQuestions(id)])
      .then(([userData, l, qs]) => {
        setUser(userData);
        setCredits(userData.learningCredits || 0);

        if ((userData.learningCredits || 0) <= 0) {
          setPhase("out_of_credits");
          return;
        }

        setLesson(l);
        setQuestions(qs);
        setPhase("ready");
      })
      .catch(() => setPhase("error"));
  }, [id]);

  const openAskPanel = async () => {
    setShowAskPanel(true);
    setAskSuccess(false);
    setAskError(null);
    setAskQuestion("");
    setSelectedTutorId("");
    if (tutors.length === 0) {
      setTutorsLoading(true);
      try {
        const res = await getAvailableTutors(1, 6);
        setTutors(res.tutors);
        if (res.tutors.length > 0) setSelectedTutorId(res.tutors[0]._id);
      } catch { /* silent */ } finally { setTutorsLoading(false); }
    } else if (tutors.length > 0 && !selectedTutorId) {
      setSelectedTutorId(tutors[0]._id);
    }
  };

  const handleAskSubmit = async () => {
    if (!askQuestion.trim() || !selectedTutorId) return;
    setAskSubmitting(true);
    setAskError(null);
    try {
      await requestTutor({
        teacherId: selectedTutorId,
        lessonId: id,
        requestType: "question",
        content: askQuestion.trim(),
        metadata: {
          lessonTitle: lesson?.title,
          lessonModule: lesson?.moduleNumber,
          topics: [lesson?.title ?? "General"],
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

  const correctAnswersCount = Object.values(feedback).filter(f => f === "correct").length;
  const progress = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  const takeCredit = async (): Promise<boolean> => {
    try {
      await consumeCredit();
      setCredits(c => c - 1);
      return true;
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setPhase("out_of_credits");
      }
      return false;
    }
  };

  const handleSelect = async (qId: string, idx: number, correctIdx?: number) => {
    if (feedback[qId] === "correct") return;
    
    // consume credit first
    const hasCredit = await takeCredit();
    if (!hasCredit) return;

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
    
    // Consume credit
    const hasCredit = await takeCredit();
    if (!hasCredit) {
       setIsProcessingAudio(false);
       return;
    }

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
    if (submitting) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(selected).map(([questionId, selectedOptionIndex]) => {
         const isSpeaking = questions.find(q => q._id === questionId)?.type === 'speaking';
         return { questionId, selectedOptionIndex: isSpeaking ? 0 : selectedOptionIndex, isSpeakingCompleted: isSpeaking ? true : undefined };
      });
      const result = await submitAnswers(id, answers);
      setScore({ ...result, score: correctAnswersCount * 10, total: questions.length * 10, passed: correctAnswersCount >= questions.length * 0.7 });
      setPhase("completed");
    } catch {
      alert("Failed to save progress");
    } finally {
      setSubmitting(false);
    }
  };

  if (phase === "loading") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-mozhi-primary" />
        <p className="max-w-[80vw] mt-4 font-bold text-gray-500 text-lg">Loading lesson...</p>
      </div>
    );
  }

  if (phase === "out_of_credits") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <Zap className="h-24 w-24 text-amber-500 mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-4">Out of Energy!</h1>
        <p className="text-lg text-gray-500 mb-8 max-w-sm">
          You don't have enough daily credits left to continue this lesson. Wait a bit for them to refill!
        </p>
        <button onClick={() => router.push("/student/lessons")} className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors uppercase tracking-wide">
          Return to Path
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 dark:bg-white">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="font-medium text-gray-600 dark:text-gray-200">Could not load this lesson.</p>
        <button onClick={() => router.back()} className="text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary">
          ← Go Back
        </button>
      </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 auto-x-scroll pt-20 pb-20 text-center animate-in fade-in zoom-in-95 duration-500 dark:bg-white">
        {score?.passed ? (
          <CheckCircle2 className="h-24 w-24 text-emerald-500" />
        ) : (
          <XCircle className="h-24 w-24 text-red-500" />
        )}
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 dark:text-slate-100 mb-2">
            {score?.passed ? "Lesson Complete! 🎉" : "Keep Practicing!"}
          </h2>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            You scored <strong className="text-gray-800 dark:text-white">{score?.score}</strong> out of{" "}
            <strong className="text-gray-800 dark:text-white">{score?.total}</strong>
          </p>
        </div>

        <div className="flex gap-4 mt-4">
          <Link href="/student/lessons" className="rounded-2xl border-2 border-gray-100 px-8 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors  dark:text-gray-300 dark:hover:bg-gray-800">
            Back to Path
          </Link>
          {!score?.passed && (
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
    <div className="flex flex-col min-h-[85vh] animate-in fade-in duration-500 max-w-4xl mx-auto dark:bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-6 pt-4  px-4">
        <div className="flex items-center gap-4">
          <Link
            href="/student/lessons"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-slate-100">
              {lesson?.title}
            </h1>
            <p className="text-sm font-bold text-mozhi-primary dark:text-mozhi-secondary uppercase tracking-wider mt-0.5">
              Level {lesson?.moduleNumber || 1}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Zap className="fill-amber-500 w-5 h-5" />
            <span className="text-lg">{credits}</span>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="h-3 w-40 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-in-out" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{progress}%</span>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="mt-8 flex-1 px-4">
          {lesson?.content ? (
            <div className="prose prose-lg prose-slate max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: lesson.content }} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-gray-100 ">
              <BookOpen className="h-16 w-16 text-mozhi-secondary/50" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">This active lesson module has no graded exercises yet.</p>
              <Link href="/student/lessons" className="mt-2 text-sm font-bold text-mozhi-primary hover:text-mozhi-secondary transition-colors">← Return to Learning Path</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 flex w-full flex-1 flex-col items-center justify-start text-center pt-8 px-4">
          {currentQuestion.type === 'speaking' && (
             <div className="flex items-center gap-2 mb-6 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-sm font-bold dark:bg-indigo-900/40 dark:border-indigo-800 dark:text-indigo-300">
               <Mic className="w-4 h-4" /> Speaking Practice
             </div>
          )}

          <h2 className={cn("font-bold text-gray-800 dark:text-slate-100", currentQuestion.type === 'speaking' ? "text-2xl" : "text-3xl")}>
            {currentQuestion.text}
          </h2>
          
          {currentQuestion.type === 'speaking' && currentQuestion.expectedAudioText && (
             <h3 className="mt-8 text-5xl font-black text-mozhi-primary dark:text-mozhi-secondary">
               {currentQuestion.expectedAudioText}
             </h3>
          )}

          {currentQuestion.type === 'speaking' ? (
             <div className="mt-14 w-full max-w-xl flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500 font-bold mb-6 dark:text-gray-400">
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
                           ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
                           : "bg-mozhi-primary text-white hover:bg-opacity-90 shadow-mozhi-primary/40 focus:ring-mozhi-primary/30 hover:scale-105"
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
              {currentQuestion.options?.map((opt, idx) => {
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
                          : "border-gray-100 bg-white text-gray-700 hover:border-mozhi-primary hover:bg-mozhi-primary/5 active:scale-95  dark:bg-gray-800 dark:text-gray-200 dark:hover:border-mozhi-primary dark:hover:bg-gray-800/80"
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {currFeedback === "incorrect" && (
             <div className="mt-8 flex items-start gap-3 text-left w-full max-w-2xl bg-red-50 border border-red-200 rounded-2xl p-4 dark:bg-red-950/20 dark:border-red-900/40 animate-in slide-in-from-bottom-2">
                <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold text-red-800 dark:text-red-400">
                     {currentQuestion.type === 'speaking' ? "We couldn't quite catch that." : "Not quite right."}
                   </p>
                   {attempts === 1 && <p className="text-sm font-medium text-red-700 mt-1 dark:text-red-300">
                     {currentQuestion.type === 'speaking' ? "Make sure you're in a quiet place and speaking clearly." : "Try sounding out the letters carefully."}
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

      {questions.length > 0 && (
        <div className="mt-12 sticky bottom-0 bg-white border-t border-gray-100  py-6 mb-6 px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 rounded-2xl border-2 border-gray-100 px-6 py-3.5 font-bold text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed  dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" /> Previous
            </button>

            <div className="flex items-center gap-3">
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={handleManualNext}
                  className="rounded-2xl bg-gray-100 text-gray-700 px-8 py-3.5 font-bold shadow-sm transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-slate-700"
                >
                  Skip →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || correctAnswersCount < questions.length * 0.7}
                  className={cn(
                     "rounded-2xl px-8 py-3.5 font-bold text-white shadow-lg transition-all",
                     correctAnswersCount < questions.length * 0.7
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
    {/* Ask-a-Tutor floating button */}
    {phase === "ready" && (
      <>
        <button
          onClick={openAskPanel}
          className="fixed bottom-28 right-4 md:right-8 z-40 flex items-center gap-2 rounded-full bg-mozhi-primary px-5 py-3 text-xs font-bold text-white shadow-2xl shadow-mozhi-primary/30 hover:bg-mozhi-primary/90 transition-all hover:-translate-y-0.5 active:scale-95 border border-mozhi-primary/20"
        >
          <MessageCircle className="h-4 w-4" />
          Ask a Tutor
        </button>

        {showAskPanel && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" onClick={() => setShowAskPanel(false)} />

            {/* Panel */}
            <div className="relative w-full sm:max-w-lg bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl p-8 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-y-auto max-h-[85vh]">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-1 w-6 rounded-full bg-mozhi-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-mozhi-primary">Lesson Support</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ask a Tutor</h3>
                </div>
                <button
                  onClick={() => setShowAskPanel(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Lesson context chip */}
              {lesson && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-mozhi-primary/5 border border-mozhi-primary/10 px-4 py-2.5">
                  <BookOpen className="h-4 w-4 text-mozhi-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-mozhi-primary uppercase tracking-wider">In context of:</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{lesson.title}</p>
                  </div>
                </div>
              )}

              {askSuccess ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="font-bold text-gray-800 dark:text-white">Question sent!</p>
                  <p className="text-sm text-gray-500">Your tutor will reply in your question history. You'll see it in your student dashboard.</p>
                  <button
                    onClick={() => setShowAskPanel(false)}
                    className="mt-2 text-xs font-bold text-mozhi-primary hover:underline"
                  >
                    Back to Lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Tutor selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 tracking-tight">Select a Tutor</label>
                    {tutorsLoading ? (
                      <div className="flex items-center gap-2 py-3 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading tutors...
                      </div>
                    ) : tutors.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-gray-100 py-6 text-center text-sm text-gray-400">
                        No tutors available right now. Try again later.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {tutors.map(t => (
                          <button
                            key={t._id}
                            onClick={() => setSelectedTutorId(t._id)}
                            className={cn(
                              "w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                              selectedTutorId === t._id
                                ? "border-mozhi-primary bg-mozhi-primary/5 shadow-sm"
                                : "border-gray-100 bg-white dark:bg-gray-800  hover:border-mozhi-primary/30"
                            )}
                          >
                            {t.profilePhoto ? (
                              <img src={t.profilePhoto} alt={t.name} className="h-9 w-9 rounded-xl object-cover shrink-0" />
                            ) : (
                              <div className="h-9 w-9 rounded-xl bg-mozhi-primary/10 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-mozhi-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{t.name}</p>
                              <p className="text-[11px] text-gray-500 truncate">{t.specialization || "Tamil Tutor"}</p>
                            </div>
                            {selectedTutorId === t._id && (
                              <CheckCircle2 className="h-4 w-4 text-mozhi-primary shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Question textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 tracking-tight">Your Question</label>
                    <textarea
                      rows={4}
                      value={askQuestion}
                      onChange={e => setAskQuestion(e.target.value)}
                      placeholder={`What's confusing you in "${lesson?.title || 'this lesson'}"?`}
                      className="w-full resize-none rounded-2xl border border-gray-100  bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 outline-none focus:ring-4 focus:ring-mozhi-primary/10 focus:border-mozhi-primary transition-all"
                    />
                  </div>

                  {askError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                      <AlertCircle size={14} className="shrink-0" /> {askError}
                    </div>
                  )}

                  <button
                    onClick={handleAskSubmit}
                    disabled={askSubmitting || !askQuestion.trim() || !selectedTutorId}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all",
                      askSubmitting || !askQuestion.trim() || !selectedTutorId
                        ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                        : "bg-mozhi-primary hover:bg-mozhi-primary/90 shadow-lg shadow-mozhi-primary/20 active:scale-[0.98]"
                    )}
                  >
                    {askSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {askSubmitting ? "Sending..." : "Send Question"}
                  </button>
                   <p className="text-center text-[11px] text-gray-400 font-semibold">This will deduct 10 XP from your balance</p>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    )}
  </div>
  );
}