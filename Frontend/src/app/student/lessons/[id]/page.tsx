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
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";

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

  const handleManualPrev = () => {
    if (currentQ > 0) setCurrentQ((c) => c - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitAnswers(id, selected);
      setScore(res);
      setPhase("completed");
    } catch (e) {
      console.error(e);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // --- AUDIO LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        await processAudio(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Audio Access Error:", err);
      alert("Please allow mic access.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    const q = questions[currentQ];
    if (!q) return;

    // First take credit
    const hasCredit = await takeCredit();
    if (!hasCredit) return;

    setIsProcessingAudio(true);
    try {
      const res = await evaluateSpeaking(id, q._id, audioBlob);
      if (res.isCorrect) {
        setFeedback(prev => ({ ...prev, [q._id]: "correct" }));
        setBackendMessage(prev => ({ ...prev, [q._id]: res.feedback }));
        setTimeout(() => {
          if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
        }, 3000);
      } else {
        setFeedback(prev => ({ ...prev, [q._id]: "incorrect" }));
        setBackendMessage(prev => ({ ...prev, [q._id]: res.feedback }));
      }
    } catch (e) {
      console.error(e);
      setBackendMessage(prev => ({ ...prev, [q._id]: "Recognition failed. Try again." }));
    } finally {
      setIsProcessingAudio(false);
    }
  };

  // --- RENDERS ---
  if (phase === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
           <div className="relative h-20 w-20">
              <Loader2 className="h-20 w-20 animate-spin text-primary/30" strokeWidth={1.5} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Zap className="h-8 w-8 text-primary animate-pulse" />
              </div>
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary animate-pulse">Initializing Neural Link...</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Card variant="outline" className="max-w-md text-center border-error/20 bg-error/5">
          <AlertCircle className="h-16 w-16 text-error mx-auto mb-6" />
          <h2 className="text-2xl font-black text-text-primary mb-2">Sync Interrupted</h2>
          <p className="text-text-secondary mb-8 font-medium italic">We couldn't connect to this learning module. Please verify your connection.</p>
          <Button onClick={() => window.location.reload()} variant="danger" size="lg" className="w-full">Re-establish Uplink</Button>
        </Card>
      </div>
    );
  }

  if (phase === "out_of_credits") {
    return (
        <div className="flex h-screen items-center justify-center bg-background p-6">
          <Card variant="elevated" className="max-w-md text-center border-warning/20 bg-warning/5">
             <div className="relative h-24 w-24 mx-auto mb-8">
                <Zap className="h-24 w-24 text-warning opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <AlertCircle className="h-12 w-12 text-warning" />
                </div>
             </div>
            <h2 className="text-3xl font-black text-text-primary mb-4 tracking-tight">Energy Depleted</h2>
            <p className="text-text-secondary mb-10 font-medium leading-relaxed italic px-4">
              Your learning energy has reached critical levels. Re-engage to continue your linguistic growth.
            </p>
            <div className="space-y-4">
                <Button href="/student/premium" size="xl" className="w-full shadow-xl shadow-primary/20 bg-primary">Restore Energy</Button>
                <Button href="/student/dashboard" variant="ghost" size="md" className="w-full font-black uppercase tracking-widest text-[10px]">Return To Dashboard</Button>
            </div>
          </Card>
        </div>
      );
  }

  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 sm:p-12">
        <Card variant="elevated" padding="xl" className="max-w-3xl w-full border-none shadow-3xl animate-in zoom-in-95 duration-700">
           <div className="flex flex-col items-center text-center space-y-10">
              <div className="h-32 w-32 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100 shadow-xl animate-bounce">
                 <Trophy className="h-16 w-16 text-emerald-500" />
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-black text-text-primary tracking-tight">Focus Achieved</h1>
                <p className="text-xl text-text-secondary font-medium italic">Linguistic sync completed with high fidelity.</p>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                 <div className="bg-surface-soft p-6 rounded-3xl border border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Score</p>
                    <p className={cn("text-4xl font-black", score?.passed ? "text-emerald-500" : "text-error")}>
                        {score?.score}/{score?.total}
                    </p>
                 </div>
                 <div className="bg-surface-soft p-6 rounded-3xl border border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2">Status</p>
                    <p className={cn("text-xl font-black uppercase tracking-widest", score?.passed ? "text-emerald-500" : "text-error")}>
                        {score?.passed ? "Ascended" : "Try Again"}
                    </p>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 w-full pt-4">
                <Button href="/student/lessons" size="xl" className="w-full rounded-2xl shadow-xl shadow-primary/20">Next Module</Button>
                <Button href="/student/dashboard" variant="outline" size="xl" className="w-full rounded-2xl">Return Hub</Button>
              </div>
           </div>
        </Card>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link 
              href="/student/lessons" 
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-surface border border-border text-text-secondary hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="hidden sm:block space-y-1">
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-6 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Module {lesson?.moduleNumber}</span>
               </div>
               <h1 className="text-xl font-black text-text-primary tracking-tight leading-none">{lesson?.title}</h1>
            </div>
          </div>

          {/* Core Progress UI */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="flex items-center justify-between mb-3 px-1">
               <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Progress: <span className="text-primary">{progress}%</span></span>
               <div className="flex items-center gap-2">
                  <Zap className="h-3 h-3 text-warning animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-warning">Energy: {credits}</span>
               </div>
            </div>
            <div className="h-2.5 w-full bg-surface-soft rounded-full overflow-hidden border border-border shadow-inner">
               <div 
                 className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                 style={{ width: `${progress}%` }} 
               />
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-4">
             <button
               onClick={openAskPanel}
               className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm border border-secondary/20"
             >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Ask AI Tutor</span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-start h-full">
          
          {/* Left Side: Interaction Zone */}
          <div className="lg:col-span-12 flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            
            <div className="text-center space-y-6 max-w-3xl">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                  Question {currentQ + 1} of {questions.length}
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
                 {q?.prompt || "Select the correct translation"}
               </h2>
               {q?.metadata?.phonetic && (
                 <p className="text-xl font-medium text-text-secondary italic bg-surface-soft inline-block px-6 py-1 rounded-full border border-border">
                   / {q.metadata.phonetic} /
                 </p>
               )}
            </div>

            {/* Visual Aid */}
            {q?.attachmentUrl && (
              <div className="h-64 sm:h-80 w-full max-w-2xl bg-surface rounded-[3rem] p-1 border-4 border-surface shadow-3xl overflow-hidden group">
                 <img 
                    src={q.attachmentUrl} 
                    alt="Linguistic Context" 
                    className="w-full h-full object-cover rounded-[2.8rem] transition-transform duration-700 group-hover:scale-105" 
                 />
              </div>
            )}

            {/* Input System: Multiple Choice */}
            {q?.type === "choice" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl pt-8">
                {q.options.map((opt, idx) => {
                  const isCorrect = feedback[q._id] === "correct" && selected[q._id] === idx;
                  const isIncorrect = feedback[q._id] === "incorrect" && selected[q._id] === idx;
                  const isSelected = selected[q._id] === idx;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(q._id, idx, q.correctOptionIndex)}
                      disabled={feedback[q._id] === "correct" || credits <= 0}
                      className={cn(
                        "relative flex items-center justify-between p-7 text-left rounded-[2rem] border-2 transition-all duration-300 group shadow-md",
                        isCorrect ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10" :
                        isIncorrect ? "bg-error/5 border-error/50 shadow-inner" :
                        isSelected ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" :
                        "bg-white border-border hover:border-primary/40 hover:bg-surface-soft hover:-translate-y-1 active:scale-[0.98]"
                      )}
                    >
                      <div className="flex items-center gap-5">
                         <div className={cn(
                           "flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm border-2 transition-colors",
                           isCorrect ? "bg-emerald-500 text-white border-emerald-400" :
                           isIncorrect ? "bg-error text-white border-error/50" :
                           isSelected ? "bg-primary text-white border-primary/40" :
                           "bg-surface-soft text-text-secondary border-border/80 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
                         )}>
                            {String.fromCharCode(65 + idx)}
                         </div>
                         <span className={cn(
                           "text-xl font-bold tracking-tight",
                           isCorrect ? "text-emerald-700" : isIncorrect ? "text-error" : isSelected ? "text-primary" : "text-text-primary"
                         )}>
                           {opt}
                         </span>
                      </div>
                      
                      {isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-in zoom-in" />}
                      {isIncorrect && <XCircle className="h-6 w-6 text-error animate-in shake" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Input System: Speaking */}
            {q?.type === "speaking" && (
                <div className="flex flex-col items-center gap-10 w-full max-w-2xl pt-10">
                   <div className="relative flex flex-col items-center">
                      <button
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        disabled={isProcessingAudio || feedback[q._id] === "correct"}
                        className={cn(
                          "relative h-40 w-40 rounded-full flex items-center justify-center border-8 transition-all duration-500 shadow-3xl",
                          isRecording ? "bg-error text-white border-error/20 scale-125 animate-pulse" :
                          isProcessingAudio ? "bg-primary/10 text-primary border-primary/20 animate-spin" :
                          feedback[q._id] === "correct" ? "bg-emerald-500 text-white border-emerald-200 cursor-default" :
                          "bg-surface border-border text-text-secondary hover:border-primary/40 hover:text-primary active:scale-95"
                        )}
                      >
                         {isProcessingAudio ? <Loader2 className="h-14 w-14 animate-spin" /> :
                          isRecording ? <Mic className="h-14 w-14" /> :
                          feedback[q._id] === "correct" ? <CheckCircle2 className="h-14 w-14" /> :
                          <Mic className="h-14 w-14 group-hover:scale-110 transition-transform" />}
                         
                         {isRecording && (
                            <div className="absolute -inset-8 h-56 w-56 rounded-full border-2 border-error/30 animate-ping pointer-events-none" />
                         )}
                      </button>
                      
                      <div className="mt-8 text-center bg-surface-soft px-8 py-3 rounded-full border border-border shadow-sm">
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary select-none">
                           {isRecording ? "Transcribing Pulse..." : isProcessingAudio ? "Analyzing Frequency..." : "Press and Hold to Speak"}
                         </span>
                      </div>
                   </div>

                   {backendMessage[q._id] && (
                     <Card variant="outline" className={cn(
                       "w-full text-center border-2 animate-in slide-in-from-top-4",
                       feedback[q._id] === "correct" ? "border-emerald-100 bg-emerald-50/30 font-bold" : "border-error/10 bg-error/5"
                     )}>
                        <p className={cn(
                          "text-lg italic leading-relaxed",
                          feedback[q._id] === "correct" ? "text-emerald-700" : "text-error"
                        )}>
                          "{backendMessage[q._id]}"
                        </p>
                     </Card>
                   )}
                </div>
            )}

            {/* Control System */}
            <div className="flex items-center gap-6 pt-16 w-full max-w-4xl border-t border-border/60">
               <button 
                 onClick={handleManualPrev}
                 disabled={currentQ === 0}
                 className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-text-secondary hover:text-primary disabled:opacity-20 transition-all font-black shadow-sm"
               >
                  <ArrowLeft className="h-5 w-5" />
               </button>

               <div className="flex-1 flex justify-center items-center gap-4">
                  {questions.map((_, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setCurrentQ(idx)}
                      className={cn(
                        "h-2 w-2 rounded-full cursor-pointer transition-all duration-500",
                        currentQ === idx ? "w-10 bg-primary ring-4 ring-primary/10" : 
                        feedback[questions[idx]?._id] === "correct" ? "bg-emerald-400" :
                        "bg-border hover:bg-primary/30"
                      )} 
                    />
                  ))}
               </div>

               {currentQ === questions.length - 1 ? (
                 <Button
                   onClick={handleSubmit}
                   isLoading={submitting}
                   size="lg"
                   className={cn(
                     "px-10 rounded-2xl shadow-xl shadow-primary/20",
                     submitting ? "bg-primary/50" : "bg-primary"
                   )}
                 >
                   Finalize Session
                 </Button>
               ) : (
                 <button 
                   onClick={handleManualNext}
                   className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-text-secondary hover:text-primary transition-all font-black shadow-sm"
                 >
                    <Play className="h-5 w-5 rotate-0" />
                 </button>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* Legacy Footer Support Information */}
      <footer className="w-full bg-surface-soft/40 border-t border-border py-8 px-6 text-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
            Secure Learning Environment • End-to-End Encryption Enabled
         </p>
      </footer>

      {/* Ask the Tutor Portal */}
      <Modal
        isOpen={showAskPanel}
        onClose={() => setShowAskPanel(false)}
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
               <Card variant="outline" className="text-center bg-surface-soft border-dashed">
                  <p className="text-sm font-semibold text-text-secondary italic">No mentors currently connected for this domain.</p>
               </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {tutors.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => setSelectedTutorId(t._id)}
                    className={cn(
                      "flex flex-col items-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group",
                      selectedTutorId === t._id ? "bg-primary/5 border-primary shadow-lg shadow-primary/10" : "bg-background border-border hover:border-primary/30"
                    )}
                  >
                    <div className="h-16 w-16 rounded-2xl bg-surface-soft border border-border flex items-center justify-center p-1 group-hover:scale-110 transition-transform">
                      {t.profileImage ? (
                        <img src={t.profileImage} alt={t.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <User className="h-8 w-8 text-text-tertiary" />
                      )}
                    </div>
                    <div className="text-center">
                       <p className="text-sm font-black text-text-primary mb-1 uppercase tracking-tight">{t.name}</p>
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

          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6">
            {askError && (
              <p className="text-xs font-bold text-error flex items-center gap-2">
                <AlertCircle size={14} /> {askError}
              </p>
            )}
            {askSuccess && !askError && (
              <p className="text-xs font-bold text-emerald-600 flex items-center gap-2">
                <CheckCircle2 size={14} /> Interrogatory sent to portal successfully.
              </p>
            )}
            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" onClick={() => setShowAskPanel(false)} className="font-black uppercase tracking-widest text-[10px]">Close Portal</Button>
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
    </div>
  );
}