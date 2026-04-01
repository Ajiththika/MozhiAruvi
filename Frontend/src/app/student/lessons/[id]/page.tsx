"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Play, HelpCircle, Loader2, AlertCircle, Zap, BookOpen, User, CheckCircle2, XCircle, Volume2, Trophy } from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, generateSpeech, Lesson, Question, SubmitAnswerItem } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
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

  const [score, setScore] = useState<{ score: number; total: number; passed: boolean; nextLessonId?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [typingValue, setTypingValue] = useState("");

  const [showAskPanel, setShowAskPanel] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const [energy, setEnergy] = useState<{currentEnergy: number; maxEnergy: number; nextRecoveryIn: number; isPremium: boolean} | null>(null);

  const handlePlayAudio = async (text: string, qId: string) => {
    if (!text) return;
    try {
      setPlayingAudioId(qId);
      const { audioUrl } = await generateSpeech(id as string, text);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setPlayingAudioId(null);
    } catch (err) {
      console.error("TTS playback failed:", err);
      setPlayingAudioId(null);
    }
  };

  useEffect(() => {
    getMe()
      .then((userData) => {
        if (!userData) {
           router.push("/auth/login");
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
        setPhase("ready");
      })
      .catch((err) => {
          if (err.response?.status === 403 && err.response?.data?.error === 'NO_ENERGY') {
            setPhase("out_of_power");
            return;
          }
          if (err.response?.data?.redirect) {
            router.push(err.response.data.redirect);
            return;
          }
          console.error("Lesson initialization error:", err);
          setPhase("error");
      });
  }, [id, router]);

  const correctAnswersCount = Object.values(feedback).filter(f => f === "correct").length;
  const progress = questions.length > 0 ? Math.round((correctAnswersCount / questions.length) * 100) : 0;

  const takePower = async (): Promise<boolean> => {
    if (energy && energy.currentEnergy <= 0 && !energy.isPremium) {
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
    } else {
      setFeedback((prev) => ({ ...prev, [qId]: "incorrect" }));
    }
  };

  const handleManualNext = () => {
    if (currentQ < questions.length - 1) {
        setTypingValue("");
        setCurrentQ((c) => c + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers: SubmitAnswerItem[] = Object.entries(selected).map(([qId, idx]) => ({
        questionId: qId,
        selectedOptionIndex: idx,
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
      alert("Submission failed.");
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

  const handleWritingResult = (qId: string, passed: boolean) => {
      if (passed) {
          setFeedback(prev => ({ ...prev, [qId]: "correct" }));
          setSelected((prev) => ({ ...prev, [qId]: 0 })); 
      } else {
          setFeedback(prev => ({ ...prev, [qId]: "incorrect" }));
      }
  };

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
       <div className="flex flex-col h-screen bg-background items-center justify-center p-6 sm:p-12">
           <Card className="max-w-2xl w-full text-center p-12 space-y-8">
              <BookOpen className="w-16 h-16 text-primary mx-auto" />
              <h1 className="text-4xl font-black">{lesson?.title}</h1>
              <p className="text-lg text-gray-500">{lesson?.description}</p>
              <Button onClick={() => setPhase("ready")} size="xl" className="w-full rounded-2xl">Start Lesson</Button>
           </Card>
       </div>
    );
  }

  if (phase === "completed") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full text-center p-12 space-y-10">
           <Trophy className="h-24 w-24 text-emerald-500 mx-auto animate-bounce" />
           <h1 className="text-5xl font-black">Level Complete!</h1>
           <div className="flex justify-center gap-8">
              <div className="p-6 bg-gray-50 rounded-2xl">
                 <p className="text-sm font-bold text-gray-400">Score</p>
                 <p className="text-4xl font-black text-primary">{score?.score}/{score?.total}</p>
              </div>
           </div>
           <Button href="/student/dashboard" size="xl" className="w-full rounded-2xl">Back to Course</Button>
        </Card>
      </div>
    );
  }

  const q = questions[currentQ];

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
          <div className="w-10" />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="w-full flex-col flex items-center gap-12">
          
          <div className="w-full flex flex-col items-center space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-8 w-full max-w-4xl">
               {q?.type === 'reading' && q?.paragraph && (
                  <div className="bg-gray-50 p-8 rounded-[2rem] border-2 text-left mb-12">
                      <p className="text-2xl font-bold text-gray-700 leading-relaxed text-center">{q.paragraph}</p>
                  </div>
               )}

               <div className="flex flex-col items-center gap-8 w-full">
                  <div className="flex items-center justify-center gap-8 w-full">
                    {(q?.type === 'speaking' || q?.type === 'quiz') && (
                      <button
                          onClick={() => handlePlayAudio(q?.text || "", q?._id)}
                          disabled={playingAudioId === q?._id}
                          className={cn(
                          "flex items-center justify-center h-20 w-20 rounded-[2rem] border-2 transition-all shadow-lg active:scale-95 shrink-0",
                          playingAudioId === q?._id ? "bg-primary/10 animate-pulse" : "bg-white hover:bg-primary/5"
                          )}
                      >
                          {playingAudioId === q?._id ? <Loader2 size={32} className="animate-spin text-primary" /> : <Volume2 size={40} className="text-primary" />}
                      </button>
                    )}

                    {q?.type !== 'match' && (
                        <h2 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight leading-tight grow text-left max-w-3xl">
                            {q?.type === 'fill' ? (
                                q.text.split('_____').map((part: string, i: number, arr: string[]) => (
                                    <React.Fragment key={i}>
                                        {part}
                                        {i < arr.length - 1 && (
                                            <span className={cn(
                                                "inline-block mx-3 min-w-[180px] border-b-8 transition-all",
                                                feedback[q._id] === 'correct' ? "border-emerald-500 text-emerald-600" : "border-gray-200"
                                            )}>
                                                {feedback[q._id] ? (q.options?.find((o: string, idx: number) => idx === q.correctOptionIndex) || q.correctAnswer) : (typingValue || "...")}
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
                    <MatchingPairs question={q as any} isCorrect={feedback[q._id] === "correct"} onResult={(passed) => passed ? setFeedback(prev => ({ ...prev, [q._id]: "correct" })) : null} />
                )}

                {q?.type === "fill" && (
                    <div className="w-full max-w-xl space-y-6">
                        <input
                            type="text"
                            placeholder="Type the missing word..."
                            value={typingValue}
                            onChange={(e) => setTypingValue(e.target.value)}
                            disabled={!!feedback[q._id]}
                            className="w-full p-8 text-3xl font-black text-center rounded-[2rem] border-4 border-gray-100 focus:border-primary/30 outline-none shadow-inner"
                        />
                        {!feedback[q._id] && (
                            <Button 
                                onClick={() => {
                                    const correct = (q.correctAnswer || q.options?.[q.correctOptionIndex ?? 0]).toLowerCase().trim();
                                    const isCorrect = typingValue.toLowerCase().trim() === correct;
                                    handleSelect(q._id, isCorrect ? (q.correctOptionIndex ?? 0) : -1, q.correctOptionIndex);
                                }}
                                disabled={!typingValue}
                                size="xl"
                                className="w-full rounded-2xl bg-secondary hover:bg-secondary/90"
                            >Check Answer</Button>
                        )}
                    </div>
                )}

                {q?.type === "speaking" && (
                    <AudioRecorder lessonId={id as string} questionId={q._id} expectedAudioText={q.expectedAudioText} isCorrect={feedback[q._id] === "correct"} takeCredit={takePower} onResult={(passed, message) => handleAudioResult(q._id, passed, message)} backendMessage={backendMessage[q._id]} />
                )}

                {q?.type === "writing" && (
                    <WritingCanvas onResult={(passed) => handleWritingResult(q._id, passed)} expectedText={q.text.split(' ').pop()} isCorrect={feedback[q._id] === "correct"} />
                )}
            </div>
          </div>
        </div>

        {feedback[q?._id] && (
          <div className={cn(
            "fixed bottom-0 left-0 right-0 py-10 px-6 border-t animate-in slide-in-from-bottom-full duration-500 z-50 shadow-2xl",
            feedback[q?._id] === "correct" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
          )}>
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className={cn("h-20 w-20 rounded-3xl flex items-center justify-center shadow-lg", feedback[q?._id] === "correct" ? "bg-emerald-500 text-white" : "bg-red-500 text-white")}>
                  {feedback[q?._id] === "correct" ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
                </div>
                <div className="space-y-1">
                  <h3 className={cn("text-3xl font-black", feedback[q?._id] === "correct" ? "text-emerald-700" : "text-red-700")}>
                    {feedback[q?._id] === "correct" ? "Great!" : "The answer was:"}
                  </h3>
                  <p className="text-xl font-bold opacity-80">{feedback[q?._id] === "correct" ? backendMessage[q?._id] : q.correctAnswer || q.options?.[q.correctOptionIndex ?? 0]}</p>
                </div>
              </div>
              <Button onClick={currentQ === questions.length - 1 ? handleSubmit : handleManualNext} size="xl" className={cn("w-full sm:w-auto px-16 rounded-2xl shadow-xl", feedback[q?._id] === "correct" ? "bg-emerald-500" : "bg-red-500")}>
                {currentQ === questions.length - 1 ? "Finish" : "Continue"}
              </Button>
            </div>
          </div>
        )}
      </main>
      <AskTutorModal isOpen={showAskPanel} onClose={() => setShowAskPanel(false)} lessonId={id as string} lessonTitle={lesson?.title} lessonModule={lesson?.moduleNumber} />
    </div>
  );
}