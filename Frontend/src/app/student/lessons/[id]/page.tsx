"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, Zap, BookOpen } from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, Lesson, Question, SubmitAnswerItem } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { consumeCredit } from "@/services/userService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Trophy } from "lucide-react";
import { QuestionCard } from "@/components/features/lessons/QuestionCard";
import { AudioRecorder } from "@/components/features/lessons/AudioRecorder";
import { AskTutorModal } from "@/components/features/lessons/AskTutorModal";
import { LessonProgress } from "@/components/features/lessons/LessonProgress";
import { WritingCanvas } from "@/components/features/lessons/WritingCanvas";

type Phase = "loading" | "preview" | "ready" | "out_of_power" | "completed" | "error";

export default function LessonInteractiveSession() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);

  const [selected, setSelected] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, "correct" | "incorrect">>({});
  const [backendMessage, setBackendMessage] = useState<Record<string, string>>({});

  const [phase, setPhase] = useState<Phase>("loading");
  const [currentQ, setCurrentQ] = useState(0);

  const [score, setScore] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [powers, setPowers] = useState(25);

  const [showAskPanel, setShowAskPanel] = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getLessonById(id as string), getLessonQuestions(id as string)])
      .then(([userData, l, qsData]) => {
        setUser(userData);
        const energy = userData.progress?.energy ?? 25;
        setPowers(energy);

        if (energy <= 0 && !userData.isPremium) {
          setPhase("out_of_power");
          return;
        }

        setLesson(l);
        setQuestions(qsData.questions);
        if (qsData.user) setUser(qsData.user);
        setPhase("preview");
      })
      .catch((err) => {
          console.error(err);
          setPhase("error");
      });
  }, [id]);

  const correctAnswersCount = Object.values(feedback).filter(f => f === "correct").length;
  const progress = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  const takePower = async (): Promise<boolean> => {
    // Rely on backend for actual deduction
    if (powers <= 0 && !user?.isPremium) {
        setPhase("out_of_power");
        return false;
    }
    return true;
  };

  const handleSelect = async (qId: string, idx: number, correctIdx?: number) => {
    if (feedback[qId] === "correct") return;
    
    const hasPower = await takePower();
    if (!hasPower) return;

    setSelected((prev) => ({ ...prev, [qId]: idx }));

    if (idx === correctIdx) {
      setFeedback((prev) => ({ ...prev, [qId]: "correct" }));
      setTimeout(() => {
        if (currentQ < questions.length - 1) setCurrentQ((c) => c + 1);
      }, 1000);
    } else {
      setFeedback((prev) => ({ ...prev, [qId]: "incorrect" }));
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
      const answers: SubmitAnswerItem[] = Object.entries(selected).map(([qId, idx]) => ({
        questionId: qId,
        selectedOptionIndex: idx,
      }));
      Object.entries(feedback).forEach(([qId, status]) => {
        const q = questions.find(qu => qu._id === qId);
        if (q && q.type === "speaking" && status === "correct") {
          answers.push({ questionId: qId, selectedOptionIndex: -1, isSpeakingCompleted: true });
        }
      });
      const res = await submitAnswers(id as string, answers);
      
      if (res.user) {
        setUser(res.user);
        setPowers(res.user.progress?.energy ?? 0);
      }
      
      if (res.redirect === "/subscription") {
        router.push("/subscription");
        return;
      }

      setScore(res);
      setPhase("completed");
    } catch (e: any) {
      if (e.response?.data?.redirect) {
        router.push(e.response.data.redirect);
        return;
      }
      console.error(e);
      alert("Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudioResult = (qId: string, passed: boolean, message: string) => {
    if (passed) {
      setFeedback(prev => ({ ...prev, [qId]: "correct" }));
      setBackendMessage(prev => ({ ...prev, [qId]: message }));
      setTimeout(() => {
        if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
      }, 3000);
    } else {
      setFeedback(prev => ({ ...prev, [qId]: "incorrect" }));
      setBackendMessage(prev => ({ ...prev, [qId]: message }));
    }
  };

  const handleWritingResult = (qId: string, passed: boolean) => {
      const hasPower = takePower();
      if (!hasPower) return;

      if (passed) {
          setFeedback(prev => ({ ...prev, [qId]: "correct" }));
          // We mark selecting an option just to have an entry for submit
          setSelected((prev) => ({ ...prev, [qId]: 0 })); 
          setTimeout(() => {
              if (currentQ < questions.length - 1) setCurrentQ(c => c + 1);
          }, 1500);
      } else {
          setFeedback(prev => ({ ...prev, [qId]: "incorrect" }));
      }
  };

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
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 animate-pulse">Initializing Neural Link...</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Card variant="outline" className="max-w-md text-center border-red-500/20 bg-red-500/5">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-gray-800 mb-2">Sync Interrupted</h2>
          <p className="text-gray-500 mb-8 font-medium italic">We couldn't connect to this learning module. Please verify your connection.</p>
          <Button onClick={() => window.location.reload()} variant="danger" size="lg" className="w-full">Re-establish Uplink</Button>
        </Card>
      </div>
    );
  }

  if (phase === "out_of_power") {
    return (
        <div className="flex h-screen items-center justify-center bg-background p-6">
          <Card variant="elevated" className="max-w-md text-center border-amber-500/20 bg-amber-500/5">
             <div className="relative h-24 w-24 mx-auto mb-8">
                <Zap className="h-24 w-24 text-amber-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <AlertCircle className="h-12 w-12 text-amber-500" />
                </div>
             </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Energy Depleted</h2>
            <p className="text-gray-500 mb-10 font-medium leading-relaxed italic px-4">
              Your learning energy has reached critical levels. 1 Power regenerates every hour.
            </p>
            <div className="space-y-4">
                <Button href="/student/dashboard" variant="ghost" size="md" className="w-full font-black uppercase tracking-widest text-[10px]">Return To Dashboard</Button>
            </div>
          </Card>
        </div>
      );
  }

  if (phase === "preview") {
      return (
         <div className="flex flex-col h-screen bg-background items-center justify-center p-6 sm:p-12 animate-in fade-in zoom-in-95 duration-700">
             <Card variant="elevated" padding="xl" className="max-w-2xl w-full text-center space-y-8">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                    <BookOpen className="w-12 h-12 text-primary" />
                </div>
                <div>
                   <h2 className="text-sm font-black text-secondary tracking-[0.3em] uppercase mb-2">
                       Module {lesson?.moduleNumber || "X"} — {lesson?.category}
                   </h2>
                   <h1 className="text-4xl sm:text-5xl font-black text-gray-800 tracking-tight leading-tight">
                       {lesson?.title}
                   </h1>
                </div>

                <p className="text-lg text-gray-600 font-medium px-4">
                   {lesson?.description || "In this module, you will practice your listening, speaking, reading, and writing skills."}
                </p>

                {lesson?.examples && lesson.examples.length > 0 && (
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mt-8 mb-8 text-left">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 text-center">Preview & Learn</h3>
                        <div className="flex flex-wrap gap-4 justify-center">
                            {lesson.examples.map((ex, i) => (
                                <span key={i} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl font-bold text-xl text-primary">
                                    {ex}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-8">
                    <Button onClick={() => setPhase("ready")} size="xl" className="w-full max-w-sm mx-auto shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-lg rounded-full">
                        Start Lesson
                    </Button>
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
                <h1 className="text-5xl font-black text-gray-800 tracking-tight">Focus Achieved</h1>
                <p className="text-xl text-gray-500 font-medium italic">Linguistic sync completed with high fidelity.</p>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full max-w-sm">
                 <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Score</p>
                    <p className={cn("text-4xl font-black", score?.passed ? "text-emerald-500" : "text-red-500")}>
                        {score?.score}/{score?.total}
                    </p>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</p>
                    <p className={cn("text-xl font-black uppercase tracking-widest", score?.passed ? "text-emerald-500" : "text-red-500")}>
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
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link 
              href="/student/lessons" 
              className="flex items-center justify-center h-12 w-12 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="hidden sm:block space-y-1">
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-6 rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Module {lesson?.moduleNumber}</span>
               </div>
               <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">{lesson?.title}</h1>
            </div>
          </div>

          <LessonProgress progress={progress} credits={powers} />

          {/* Action Hub */}
          <div className="flex items-center gap-4">
             <button
               onClick={() => setShowAskPanel(true)}
               className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-secondary/10 text-secondary font-black text-[10px] uppercase tracking-widest hover:bg-secondary hover:text-white transition-all shadow-sm border border-secondary/20"
             >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden lg:inline">Ask AI Tutor</span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 lg:p-16 max-w-7xl mx-auto w-full">
        <div className="w-full flex-col flex items-center gap-12 h-full">
          
          <div className="w-full flex flex-col items-center space-y-10 animate-in slide-in-from-bottom-6 duration-700">
            
            <div className="text-center space-y-6 max-w-3xl">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest">
                  Question {currentQ + 1} of {questions.length}
               </div>
               <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800 tracking-tight leading-tight">
                 {q?.text || "Knowledge Assessment"}
               </h2>
               {q?.expectedAudioText && (
                 <p className="text-xl font-medium text-gray-500 italic bg-gray-50 inline-block px-6 py-1 rounded-full border border-gray-200">
                   / {q.expectedAudioText} /
                 </p>
               )}
            </div>

            {/* Interaction State Visualizer */}
            <div className="h-1 bg-gray-100 w-full max-w-2xl rounded-full overflow-hidden">
               <div className={cn(
                 "h-full bg-primary transition-all duration-700",
                 feedback[q?._id] === "correct" ? "w-full bg-emerald-500" :
                 feedback[q?._id] === "incorrect" ? "w-1/2 bg-red-500" : "w-1/4"
               )} />
            </div>

            {/* Input System: Multiple Choice */}
            {(!q?.type || q?.type === "quiz" || q?.type === "choice" || q?.type === "match" || q?.type === "identify") && (
              <QuestionCard
                question={q}
                feedback={feedback[q?._id]}
                selectedIndex={selected[q?._id]}
                credits={powers}
                onSelect={handleSelect}
              />
            )}

            {/* Input System: Speaking */}
            {q?.type === "speaking" && (
                <AudioRecorder
                  lessonId={id as string}
                  questionId={q._id}
                  expectedAudioText={q.expectedAudioText}
                  isCorrect={feedback[q._id] === "correct"}
                  takeCredit={takePower}
                  onResult={(passed, message) => handleAudioResult(q._id, passed, message)}
                  backendMessage={backendMessage[q._id]}
                />
            )}

            {/* Input System: Writing Canvas */}
            {q?.type === "writing" && (
                <WritingCanvas 
                   onResult={(passed) => handleWritingResult(q._id, passed)}
                   expectedText={q.text.split(' ').pop()} // Very simple fallback for expected char visually
                   isCorrect={feedback[q._id] === "correct"}
                />
            )}

            {/* Control System */}
            <div className="flex items-center gap-6 pt-16 w-full max-w-4xl border-t border-gray-200">
               <button 
                 onClick={handleManualPrev}
                 disabled={currentQ === 0}
                 className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:text-primary disabled:opacity-20 transition-all font-black shadow-sm"
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
                        "bg-gray-300 hover:bg-primary/30"
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
                   className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:text-primary transition-all font-black shadow-sm"
                 >
                    <Play className="h-5 w-5 rotate-0" />
                 </button>
               )}
            </div>
          </div>
        </div>
      </main>

      {/* Legacy Footer Support Information */}
      <footer className="w-full bg-gray-50 border-t border-gray-200 py-8 px-6 text-center mt-auto">
         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Secure Learning Environment • End-to-End Encryption Enabled
         </p>
      </footer>

      {/* Ask the Tutor Portal */}
      <AskTutorModal
        isOpen={showAskPanel}
        onClose={() => setShowAskPanel(false)}
        lessonId={id as string}
        lessonTitle={lesson?.title}
        lessonModule={lesson?.moduleNumber}
      />
    </div>
  );
}