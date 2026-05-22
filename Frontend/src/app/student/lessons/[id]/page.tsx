"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, HelpCircle, Loader2, AlertCircle, Zap, CheckCircle2, XCircle, Trophy } from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, generateSpeech, checkQuestionAnswer, Lesson, Question, SubmitAnswerItem } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { MatchingPairs } from "@/components/features/lessons/MatchingPairs";
import { Card } from "@/components/ui/Card";
import { QuestionCard } from "@/components/features/lessons/QuestionCard";
import { AudioRecorder } from "@/components/features/lessons/AudioRecorder";
import { AskTutorModal } from "@/components/features/lessons/AskTutorModal";
import { EnergyStatus } from "@/components/features/lessons/EnergyStatus";
import { LessonProgress } from "@/components/features/lessons/LessonProgress";
import { WritingCanvas } from "@/components/features/lessons/WritingCanvas";
import { QuestionSpeaker } from "@/components/features/lessons/QuestionSpeaker";
import { useToast } from "@/components/ui/Toast";
import { getTamilSpeechText } from "@/lib/questionTts";

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

  const [score, setScore] = useState<{ score: number; total: number; passed: boolean; nextLessonId?: string; xpEarned?: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [typingByQuestion, setTypingByQuestion] = useState<Record<string, string>>({});

  const [showAskPanel, setShowAskPanel] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [actionLocked, setActionLocked] = useState(false);
  const [questionTransition, setQuestionTransition] = useState(false);
  const { toast } = useToast();

  const [energy, setEnergy] = useState<{currentEnergy: number; maxEnergy: number; nextRecoveryIn: number; isPremium: boolean} | null>(null);

  const handlePlayAudio = async (text: string, qId: string, url?: string) => {
    const speechText = (text || "").trim();
    if (!speechText && !url) return;
    if (actionLocked && playingAudioId !== qId) return;
    try {
      setPlayingAudioId(qId);
      if (url && (url.startsWith('http') || url.startsWith('data:'))) {
        const audio = new Audio(url);
        audio.onended = () => setPlayingAudioId(null);
        audio.onerror = () => setPlayingAudioId(null);
        await audio.play();
      } else if (speechText) {
        try {
          const { audioUrl } = await generateSpeech(id as string, speechText);
          
          if (audioUrl) {
            // Backend TTS succeeded — use it
            const audio = new Audio(audioUrl);
            audio.onended = () => setPlayingAudioId(null);
            audio.onerror = () => setPlayingAudioId(null);
            await audio.play();
            return;
          }
          // audioUrl is null → backend has no TTS configured, fall through to browser TTS
        } catch {
          // Backend unreachable or errored → fall through to browser TTS
        }

        // ── Browser TTS Fallback ─────────────────────────────────────────────
        const speak = () => {
          const utterance = new SpeechSynthesisUtterance(speechText);
          // Explicit Tamil Voice Seek
          const voices = window.speechSynthesis.getVoices();
          const taVoices = voices.filter(v => v.lang.startsWith('ta'));
          
          // Selection Strategy: High-Quality Wavenet > Premium > Standard
          if (taVoices.length > 0) {
            utterance.voice = 
              taVoices.find(v => v.name.includes('Wavenet')) || 
              taVoices.find(v => v.name.includes('Premium')) ||
              taVoices.find(v => v.name.includes('Google')) || 
              taVoices[0];
          }
          
          utterance.lang = "ta-IN";
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          
          utterance.onstart = () => {
             console.log(`[TTS] Speaking via browser fallback (${utterance.voice?.name || 'default'})`);
          };

          utterance.onend = () => { 
            setPlayingAudioId(null); 
            (window as any)._activeUtterance = null; 
          };

          utterance.onerror = (e) => { 
            console.error("[TTS Fallback Error]", e);
            setPlayingAudioId(null); 
            (window as any)._activeUtterance = null; 
          };
          
          // Prevent Chrome garbage collection bug
          (window as any)._activeUtterance = utterance;
          window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
          const checkVoices = setInterval(() => {
            if (window.speechSynthesis.getVoices().length > 0) {
              clearInterval(checkVoices);
              speak();
            }
          }, 100);
          setTimeout(() => clearInterval(checkVoices), 3000);
        } else {
          speak();
        }
        
        // Final safety timeout if all events fail
        setTimeout(() => setPlayingAudioId(prev => prev === qId ? null : prev), 8000);
      }
    } catch (err) {
      console.error("Critical TTS failure:", err);
      toast("Could not play audio. Please try again.", "error");
      setPlayingAudioId(null);
    }
  };

  useEffect(() => {
    getMe()
      .then((userData) => {
        if (!userData) {
           router.push("/auth/signin");
           return;
        }
        setUser(userData);
        return Promise.all([getLessonById(id as string), getLessonQuestions(id as string)]);
      })
      .then((res) => {
        if (!res) return;
        const [l, qsData] = res;
        setLesson(l);
        setQuestions(qsData.questions);
        if (qsData.user) setUser(qsData.user);
        if (qsData.energy) setEnergy(qsData.energy);
        setPhase("preview");
      })
      .catch((err) => {
          // Check NO_ENERGY first (403 with specific error code)
          if (err.response?.status === 403 && err.response?.data?.error === 'NO_ENERGY') {
            setPhase("out_of_power");
            return;
          }
          // Redirect if backend provides a redirect path (e.g. subscription required)
          if (err.response?.data?.redirect) {
            router.push(err.response.data.redirect);
            return;
          }
          // 401 Unauthorized → send to login
          if (err.response?.status === 401) {
            router.push("/auth/signin");
            return;
          }
          // 403 Forbidden (level mismatch, plan restriction, etc.) → back to lessons
          if (err.response?.status === 403) {
            router.push("/student/lessons");
            return;
          }
          // 404 → lesson does not exist, go back to lessons list
          if (err.response?.status === 404) {
            router.push("/student/lessons");
            return;
          }
          console.error("Lesson initialization failure:", err.message);
          toast(err.response?.data?.message || "Failed to load lesson. Please try again.", "error");
          setPhase("error");
      });
  }, [id, router, toast]);

  const correctAnswersCount = Object.values(feedback).filter(f => f === "correct").length;
  const progress = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  const takePower = async (): Promise<boolean> => {
    if (energy && energy.currentEnergy <= 0 && !energy.isPremium) {
        setPhase("out_of_power");
        return false;
    }
    return true;
  };

  const handleSelect = async (qId: string, idx: number, typedAnswer?: string) => {
    if (feedback[qId] || actionLocked) return;
    setActionLocked(true);

    try {
      const res = await api.post(`/lessons/${id}/questions/${qId}/attempt`);
      if (res.data.energy) setEnergy(res.data.energy);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.error === 'NO_ENERGY') {
        setPhase("out_of_power");
        setActionLocked(false);
        return;
      }
    }

    try {
      const q = questions.find((x) => x._id === qId);
      const result = await checkQuestionAnswer(id as string, qId, {
        selectedOptionIndex: idx,
        typedAnswer: typedAnswer ?? (q?.type === "fill" ? typingByQuestion[qId] : undefined),
      });
      setSelected((prev) => ({ ...prev, [qId]: result.correct ? (idx >= 0 ? idx : 0) : -1 }));
      setFeedback((prev) => ({ ...prev, [qId]: result.correct ? "correct" : "incorrect" }));
      if (!result.correct && result.correctAnswer) {
        setBackendMessage((prev) => ({ ...prev, [qId]: `Correct answer: ${result.correctAnswer}` }));
      }
    } catch {
      toast("Could not check answer. Please try again.", "error");
    } finally {
      setActionLocked(false);
    }
  };

  const handleManualNext = () => {
    if (currentQ < questions.length - 1) {
        setQuestionTransition(true);
        setTimeout(() => {
          setCurrentQ((c) => c + 1);
          setQuestionTransition(false);
        }, 200);
    }
  };

  const handleSubmit = async () => {
    if (submitting || actionLocked) return;
    setSubmitting(true);
    try {
      const answers: SubmitAnswerItem[] = questions
        .filter((q) => feedback[q._id])
        .map((q) => ({
          questionId: q._id,
          selectedOptionIndex: selected[q._id] ?? (feedback[q._id] === "correct" ? 0 : -1),
          isSpeakingCompleted: q.type === "speaking" && feedback[q._id] === "correct",
          typedAnswer: q.type === "fill" ? typingByQuestion[q._id] : undefined,
        }));
      const res = await submitAnswers(id as string, answers);
      if (res.user) setUser(res.user);
      if (res.energy) setEnergy(res.energy);
      setScore(res);
      setPhase("completed");
    } catch (e: any) {
      if (e.response?.status === 403 && e.response?.data?.error === 'NO_ENERGY') {
        setPhase("out_of_power");
        return;
      }
      console.error(e);
      toast(e.response?.data?.message || "Submission failed. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAudioResult = (qId: string, passed: boolean, message: string) => {
    if (passed) {
      setFeedback(prev => ({ ...prev, [qId]: "correct" }));
      setBackendMessage(prev => ({ ...prev, [qId]: message }));
    } else {
      setFeedback(prev => ({ ...prev, [qId]: "incorrect" }));
      setBackendMessage(prev => ({ ...prev, [qId]: message }));
    }
  };

  const handleWritingResult = (qId: string, passed: boolean, message: string) => {
      if (passed) {
          setFeedback(prev => ({ ...prev, [qId]: "correct" }));
          setSelected((prev) => ({ ...prev, [qId]: 0 })); 
          setBackendMessage(prev => ({ ...prev, [qId]: message }));
      } else {
          setFeedback(prev => ({ ...prev, [qId]: "incorrect" }));
          setBackendMessage(prev => ({ ...prev, [qId]: message }));
      }
  };

  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const q = questions[currentQ];
    if (!q || phase !== "ready") return;
    const tamil = getTamilSpeechText(q);
    if (q.useTTS && tamil) {
      handlePlayAudio(tamil, q._id, q.audioUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQ, phase]);

  useEffect(() => {
    if (phase === "completed" && score?.nextLessonId && score.passed) {
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      
      const redirect = setTimeout(() => {
        router.push(`/student/lessons/${score.nextLessonId}`);
      }, 3000);
 
      return () => {
        clearInterval(timer);
        clearTimeout(redirect);
      };
    }
  }, [phase, score, router]);

  if (phase === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-20 w-20 animate-spin text-primary/30" />
      </div>
    );
  }

  if (phase === "error") {
      return (
        <div className="flex h-screen items-center justify-center bg-background p-6">
          <Card className="max-w-md text-center p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-black mb-4">Connection Failed</h2>
            <Button onClick={() => window.location.reload()} className="w-full">Retry</Button>
          </Card>
        </div>
      );
  }

  if (phase === "out_of_power") {
      return (
          <div className="flex h-screen items-center justify-center bg-background p-6">
            <Card className="max-w-md text-center p-12">
              <Zap className="h-24 w-24 text-amber-500 mx-auto mb-8 animate-pulse" />
              <h2 className="text-3xl font-black mb-4">Energy Depleted</h2>
              <p className="text-gray-500 mb-8">Wait for regeneration or upgrade to premium.</p>
              <Button href="/subscription" className="w-full">Upgrade Now</Button>
            </Card>
          </div>
      );
  }

  if (phase === "preview") {
    return (
       <div className="flex flex-col h-screen bg-background items-center p-6 sm:p-12 overflow-y-auto">
           <Card className="max-w-3xl w-full p-8 md:p-12 space-y-8 my-auto shrink-0">
              <div className="text-center space-y-4">
                 <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{lesson?.title}</h1>
                 {lesson?.description && <p className="text-lg text-slate-500 font-medium">{lesson.description}</p>}
              </div>
              
              {lesson?.videoUrl && (
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl">
                  <video src={lesson.videoUrl} controls className="w-full h-full object-contain" />
                </div>
              )}

              {lesson?.imageUrl && !lesson?.videoUrl && (
                <div className="w-full rounded-[2rem] overflow-hidden shadow-2xl">
                  <img src={lesson.imageUrl} alt={lesson.title} className="w-full object-cover" />
                </div>
              )}

              {lesson?.content && (
                <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100">
                  <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
                </div>
              )}

              <Button 
                onClick={() => {
                  if (questions.length === 0) {
                     handleSubmit();
                  } else {
                     setPhase("ready");
                  }
                }} 
                size="xl" 
                className="w-full rounded-2xl h-16 text-[11px] font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                 {questions.length > 0 ? "Start Quiz" : "Complete Lesson"}
              </Button>
           </Card>
       </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full text-center p-12 space-y-10 animate-in fade-in zoom-in duration-500 rounded-[3rem] border shadow-2xl">
           <div className="relative">
              <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full" />
              <Trophy className="h-32 w-32 text-emerald-500 mx-auto relative animate-bounce" />
           </div>
           
           <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight">Level Complete!</h1>
              <p className="text-slate-500 font-medium">Excellent work! You've mastered this module.</p>
           </div>

           <div className="flex justify-center gap-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col items-center">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Score</p>
                 <p className="text-5xl font-black text-primary">{score?.score}/{score?.total}</p>
                 {score?.xpEarned && (
                   <div className="mt-4 px-4 py-2 bg-amber-500 text-white text-xs font-black rounded-full shadow-lg shadow-amber-500/20 animate-bounce">
                     +{score.xpEarned} XP EARNED
                   </div>
                 )}
                 <div className="h-1.5 w-40 bg-slate-200 rounded-full mt-6 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${(score?.score || 0) / (score?.total || 1) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4">
              <Button href="/student/lessons" variant="outline" size="xl" className="flex-1 rounded-2xl h-16 text-xs font-black uppercase tracking-widest border-2">Course Path</Button>
              <Button 
                onClick={() => router.push(score?.nextLessonId ? `/student/lessons/${score.nextLessonId}` : "/student/dashboard")}
                size="xl" 
                className={cn(
                  "flex-1 rounded-2xl h-16 shadow-2xl text-xs font-black uppercase tracking-widest relative overflow-hidden transition-all hover:scale-105 active:scale-95", 
                  score?.passed ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-primary"
                )}
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {score?.nextLessonId ? (
                    <>
                      {countdown !== null && countdown > 0 ? `Next Level (${countdown}s)` : "Next Activity"} 
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : "Main Dashboard"}
                </div>
                {countdown !== null && (
                   <div 
                     className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-1000 ease-linear" 
                     style={{ width: `${(countdown / 3) * 100}%` }} 
                   />
                )}
              </Button>
           </div>
        </Card>
      </div>
    );
  }

  const q = questions[currentQ];
  const typingValue = q ? (typingByQuestion[q._id] || "") : "";
  const setTypingValue = (val: string | ((prev: string) => string)) => {
    if (!q) return;
    setTypingByQuestion((prev) => {
      const cur = prev[q._id] || "";
      const next = typeof val === "function" ? val(cur) : val;
      return { ...prev, [q._id]: next };
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/student/lessons" className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 border"><ArrowLeft size={20}/></Link>
          <div className="flex items-center gap-8 flex-1 justify-center max-w-2xl">
            <LessonProgress progress={progress} />
            {energy && (
              <EnergyStatus 
                currentEnergy={energy.currentEnergy}
                maxEnergy={energy.maxEnergy}
                nextRecoveryIn={energy.nextRecoveryIn}
                isPremium={energy.isPremium}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAskPanel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-colors font-black text-[10px] uppercase tracking-wider"
            >
              <HelpCircle size={16} />
              Need Help?
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="w-full flex-col flex items-center gap-12">
          
          <div className={cn("w-full flex flex-col items-center space-y-12 transition-opacity duration-300", questionTransition ? "opacity-0" : "opacity-100 animate-in fade-in")}>
            <div className="text-center space-y-8 w-full max-w-4xl">
               {q?.imageUrl && (
                  <div className="w-full max-w-md mx-auto rounded-[2rem] overflow-hidden border-2 border-slate-100 shadow-lg mb-4">
                    <img src={q.imageUrl} alt="" className="w-full object-cover max-h-64" />
                  </div>
               )}
               {q?.type === 'reading' && q?.paragraph && (
                  <div className="bg-gray-50 p-6 rounded-[2rem] border-2 text-left mb-8">
                      <p className="text-xl font-bold text-gray-700 leading-relaxed text-center">{q.paragraph}</p>
                  </div>
               )}

               <div className="flex flex-col items-center gap-8 w-full">
                   <div className="flex items-center justify-center gap-8 w-full">
                    {q && (
                      <QuestionSpeaker
                        question={q}
                        playingId={playingAudioId}
                        onPlay={handlePlayAudio}
                      />
                    )}

                    {q?.type !== 'match' && (
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight leading-relaxed grow text-left max-w-3xl line-clamp-3">
                            <span className="mr-4 font-mono">{currentQ + 1}.</span>
                            {q?.type === 'fill' ? (
                                q.text.split(/_{2,}/).map((part: string, i: number, arr: string[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className={cn(
                                                "inline-block mx-3 min-w-[150px] border-b-4 transition-all",
                                                feedback[q._id] === 'correct' ? "border-emerald-500 text-emerald-600" : "border-gray-200"
                                            )}>
                                                {typingValue || "..."}
                                            </span>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : q?.text}
                        </h2>
                    )}
                  </div>
               </div>
            </div>

            <div className="w-full flex justify-center py-6">
                {(q?.type === "quiz" || q?.type === "choice" || q?.type === "identify") && (
                    <QuestionCard question={q} feedback={feedback[q?._id]} selectedIndex={selected[q?._id]} credits={energy?.currentEnergy ?? 25} onSelect={handleSelect} />
                )}

                {q?.type === "match" && (
                    <MatchingPairs
                      question={q as any}
                      isCorrect={feedback[q._id] === "correct"}
                      onResult={(passed) => {
                        if (passed) {
                          setFeedback((prev) => ({ ...prev, [q._id]: "correct" }));
                          setSelected((prev) => ({ ...prev, [q._id]: 0 }));
                        }
                      }}
                      questionNumber={currentQ + 1}
                      tamilWord={getTamilSpeechText(q)}
                      audioUrl={q.audioUrl}
                      onPlayTamil={() => handlePlayAudio(getTamilSpeechText(q), q._id, q.audioUrl)}
                      playingAudio={playingAudioId === q._id}
                    />
                )}

                {q?.type === "fill" && (
                    <div className="w-full max-w-xl space-y-6">
                        {q.words && q.words.length > 0 ? (
                          // ── Tap-to-Arrange ──
                          <div className="space-y-8">
                            <div className="min-h-[100px] p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-wrap gap-3 items-center justify-center">
                              {typingValue.split(" ").filter(Boolean).map((word, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    if (feedback[q._id]) return;
                                    const newWords = typingValue.split(" ").filter(Boolean);
                                    newWords.splice(i, 1);
                                    setTypingValue(newWords.join(" "));
                                  }}
                                  className="px-5 py-3 bg-white border-2 border-primary rounded-2xl font-bold text-primary shadow-sm hover:scale-105 active:scale-95 transition-all"
                                >
                                  {word}
                                </button>
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center">
                              {q.words
                                .filter(w => !typingValue.split(" ").includes(w) || (q.words?.filter(x => x === w).length || 0) > typingValue.split(" ").filter(x => x === w).length)
                                .map((word, i) => (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      if (feedback[q._id] || actionLocked) return;
                                      setTypingValue(prev => (prev ? prev + " " + word : word));
                                    }}
                                    className="px-5 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 shadow-sm hover:border-primary hover:text-primary transition-all active:scale-95"
                                  >
                                    {word}
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        ) : (
                          // ── Standard Fill/Spelling Input ──
                          <input
                              type="text"
                              placeholder="Write here"
                              value={typingValue}
                              onChange={(e) => setTypingValue(e.target.value)}
                              disabled={!!feedback[q._id]}
                              className="w-full p-6 text-2xl font-black text-center rounded-[2rem] border-4 border-gray-100 focus:border-primary/30 outline-none shadow-inner"
                          />
                        )}
                        
                        {!feedback[q._id] && (
                            <Button 
                                onClick={() => {
                                    handleSelect(q._id, 0, typingValue);
                                }}
                                disabled={!typingValue.trim() || actionLocked}
                                size="xl"
                                className="w-full rounded-2xl bg-secondary hover:bg-secondary/90 shadow-xl shadow-secondary/20"
                            >Check Answer</Button>
                        )}
                    </div>
                )}

                {q?.type === "speaking" && (
                    <AudioRecorder lessonId={id as string} questionId={q._id} expectedAudioText={q.expectedAudioText} audioUrl={q.audioUrl} isCorrect={feedback[q._id] === "correct"} takeCredit={takePower} onResult={(passed, message) => handleAudioResult(q._id, passed, message)} backendMessage={backendMessage[q._id]} />
                )}

                {q?.type === "writing" && (
                    <WritingCanvas 
                      lessonId={id as string} 
                      questionId={q._id}
                      onResult={(passed, message) => handleWritingResult(q._id, passed, message)} 
                      expectedText={q.correctAnswer} 
                      isCorrect={feedback[q._id] === "correct"} 
                    />
                )}
            </div>
          </div>
        </div>

        {feedback[q?._id] && (
          <div className="fixed bottom-0 left-0 right-0 p-6 md:p-10 z-50 animate-in slide-in-from-bottom-full duration-500">
            <div className={cn(
              "max-w-4xl mx-auto p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center justify-between gap-8 border-t-4",
              feedback[q?._id] === "correct" ? "bg-white border-emerald-500" : "bg-white border-red-500"
            )}>
              <div className="flex items-center gap-8 flex-1">
                <div className={cn(
                  "h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl shrink-0 animate-in zoom-in duration-300", 
                  feedback[q?._id] === "correct" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                )}>
                  {feedback[q?._id] === "correct" ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className={cn("text-3xl font-black tracking-tight", feedback[q?._id] === "correct" ? "text-emerald-600" : "text-red-600")}>
                      {feedback[q?._id] === "correct" ? "Amazing!" : "Not quite yet"}
                    </h3>
                    {feedback[q?._id] === "correct" && q.xp && (
                      <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-black rounded-full animate-bounce">
                        +{q.xp} XP
                      </span>
                    )}
                  </div>
                  
                  {feedback[q._id] === 'incorrect' && backendMessage[q._id] && (
                    <p className="text-sm font-bold text-slate-800">{backendMessage[q._id]}</p>
                  )}

                  {feedback[q._id] === 'incorrect' && q.hint && (
                    <p className="text-sm font-bold text-amber-600">💡 Hint: {q.hint}</p>
                  )}

                  {q.explanation && (
                    <p className="text-sm text-slate-500 font-medium border-t border-slate-100 pt-2 leading-relaxed">
                      {q.explanation}
                    </p>
                  )}

                  {feedback[q._id] === 'correct' && backendMessage[q._id] && (
                    <p className="text-sm font-medium text-slate-500">{backendMessage[q._id]}</p>
                  )}
                </div>
              </div>
              <Button 
                onClick={currentQ === questions.length - 1 ? handleSubmit : handleManualNext}
                disabled={submitting || actionLocked}
                size="xl" 
                className={cn(
                  "w-full md:w-auto px-16 rounded-[1.5rem] shadow-2xl h-16 font-black uppercase tracking-widest text-xs", 
                  feedback[q?._id] === "correct" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                )}
              >
                {currentQ === questions.length - 1 ? "Finish Session" : "Keep Learning"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <AskTutorModal isOpen={showAskPanel} onClose={() => setShowAskPanel(false)} lessonId={id as string} lessonTitle={lesson?.title} lessonModule={lesson?.moduleNumber} />
    </div>
  );
}