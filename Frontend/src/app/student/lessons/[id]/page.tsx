"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  X, HelpCircle, Loader2, AlertCircle, CheckCircle2, XCircle, Play, Mic, Star, Zap
} from "lucide-react";
import { getLessonById, getLessonQuestions, submitAnswers, Lesson, Question } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";
import { consumeCredit } from "@/services/userService";

type Phase = "loading" | "ready" | "out_of_credits" | "completed" | "error";

export default function LessonInteractiveSession() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [checking, setChecking] = useState(false);
  const [scoreData, setScoreData] = useState<{ score: number; passed: boolean } | null>(null);

  // Stats
  const [correctCount, setCorrectCount] = useState(0);
  const [credits, setCredits] = useState(25);

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

  const progress = questions.length > 0 ? Math.round((currentQ / questions.length) * 100) : 0;

  async function handleCheck() {
    if (checking) return;
    const q = questions[currentQ];
    
    // Evaluate internally
    let isCorrect = false;
    if (q.type === "spelling" || q.type === "fill" || q.type === "speaking") {
      isCorrect = typedAnswer.trim().toLowerCase() === (q.correctAnswer || "").trim().toLowerCase();
    } else {
      isCorrect = selectedOption === q.correctOptionIndex;
    }

    setChecking(true);

    try {
      // Consume a credit
      await consumeCredit();
      setCredits(c => c - 1);

      setFeedback(isCorrect ? "correct" : "incorrect");
      if (isCorrect) setCorrectCount(c => c + 1);

    } catch (e: any) {
      if (e?.response?.status === 403) {
        setPhase("out_of_credits");
      }
    } finally {
      setChecking(false);
    }
  }

  async function handleContinue() {
    setFeedback(null);
    setSelectedOption(null);
    setTypedAnswer("");

    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
    } else {
      // Final submission to record score / award XP
      try {
        setPhase("loading");
        const pass = correctCount >= Math.ceil(questions.length * 0.7);
        // Using a flat random answers array since frontend does evaluation for flow
        const result = await submitAnswers(id, questions.map(q => ({ questionId: q._id, selectedOptionIndex: 0 }))); 
        setScoreData({ score: correctCount * 10, passed: pass });
        setPhase("completed");
      } catch (e) {
        setPhase("error");
      }
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-mozhi-primary" />
        <p className="mt-4 font-bold text-slate-500 text-lg">Loading lesson...</p>
      </div>
    );
  }

  if (phase === "out_of_credits") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <Zap className="h-24 w-24 text-amber-500 mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-slate-800 mb-4">Out of Energy!</h1>
        <p className="text-lg text-slate-500 mb-8 max-w-sm">
          You don't have enough daily credits left to continue this lesson. Wait a bit for them to refill!
        </p>
        <button onClick={() => router.push("/student/lessons")} className="px-8 py-4 bg-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-300 transition-colors uppercase tracking-wide">
          Return to Path
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white px-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="font-bold text-2xl text-slate-800 mb-6">Oops, something went wrong.</h1>
        <button onClick={() => router.push("/student/lessons")} className="px-8 py-3 bg-mozhi-primary text-white font-bold rounded-xl hover:bg-opacity-90">
          Return Home
        </button>
      </div>
    );
  }

  if (phase === "ready" && questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <Play className="h-20 w-20 text-blue-300 mb-6" />
        <h1 className="text-3xl font-black text-slate-800 mb-4">Coming Soon!</h1>
        <p className="text-lg text-slate-500 mb-8 max-w-md">
          This lesson doesn't have any interactive activities added to it yet. Check back later!
        </p>
        <button onClick={() => router.push("/student/lessons")} className="px-8 py-4 bg-mozhi-primary text-white font-bold rounded-2xl hover:bg-mozhi-secondary transition-colors uppercase tracking-wide shadow-md hover:shadow-lg">
          Return to Path
        </button>
      </div>
    );
  }

  if (phase === "completed") {
    const isPassed = scoreData?.passed;
    return (
      <div className="flex flex-col h-screen bg-white max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20" />
            <Star className={`w-36 h-36 ${isPassed ? "text-yellow-400 fill-yellow-400" : "text-amber-500 fill-amber-500"} relative z-10`} />
          </div>
          
          <h1 className={`text-4xl font-black mb-4 ${isPassed ? "text-yellow-500" : "text-mozhi-primary"}`}>
            {isPassed ? "Lesson Complete!" : "Good Try!"}
          </h1>
          <p className="text-xl text-slate-600 font-medium mb-8">
            You scored {scoreData?.score} XP today!
          </p>

          <div className="flex gap-4 w-full justify-center max-w-sm">
            <div className="flex-1 bg-white border-2 border-slate-200 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-1">Score</span>
              <span className="text-2xl font-black text-slate-800">{correctCount} / {questions.length}</span>
            </div>
            <div className="flex-1 bg-white border-2 border-amber-200 rounded-2xl p-4 flex flex-col items-center">
              <span className="text-amber-500 font-bold text-sm uppercase tracking-wider mb-1">XP Earned</span>
              <span className="text-2xl font-black text-amber-500">+{scoreData?.score}</span>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-slate-100 p-6">
          <button 
            onClick={() => router.push("/student/lessons")}
            className="w-full py-4 rounded-2xl bg-mozhi-primary text-white font-bold text-xl uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const isSpeaking = q.type === "speaking";
  const isTyping = q.type === "spelling" || q.type === "fill";
  const isMultipleChoice = !isSpeaking && !isTyping && q.options && q.options.length > 0;

  const canCheck = (isMultipleChoice && selectedOption !== null) || (isTyping && typedAnswer.trim().length > 0) || (isSpeaking && typedAnswer.trim().length > 0);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header / Progress */}
      <div className="flex items-center justify-between p-4 max-w-4xl mx-auto w-full">
        <button onClick={() => router.push("/student/lessons")} className="text-slate-400 hover:text-slate-600 p-2">
          <X className="w-8 h-8" />
        </button>
        <div className="flex-1 mx-4">
          <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>
        <div className="flex items-center gap-1 font-bold text-amber-500">
          <Zap className="fill-amber-500 w-6 h-6" />
          <span className="text-lg">{credits}</span>
        </div>
      </div>

      {/* Main Activity Area */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 pt-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 mb-8 leading-tight">
          {q.text}
        </h2>

        {/* Multiple Choice Blocks */}
        {isMultipleChoice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                disabled={feedback !== null}
                onClick={() => setSelectedOption(i)}
                className={`p-4 rounded-2xl border-2 text-lg font-bold transition-all text-center ${
                  selectedOption === i
                    ? feedback === "incorrect" 
                      ? "bg-red-50 border-red-500 text-red-600"
                      : "bg-blue-50 border-mozhi-primary text-mozhi-primary translate-y-1 shadow-inner"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-1 shadow-sm"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* Typing Blocks */}
        {(isTyping || isSpeaking) && (
          <div className="w-full">
            {isSpeaking && (
              <div className="flex justify-center mb-8">
                <button className="flex flex-col items-center gap-2 text-mozhi-primary hover:text-mozhi-secondary transition-colors" title="Simulated Speaking Input">
                  <div className="w-24 h-24 bg-blue-50 border-2 border-mozhi-primary rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 active:scale-95 transition-transform">
                    <Mic className="w-10 h-10" />
                  </div>
                  <span className="font-bold uppercase tracking-widest text-sm">Tap to Speak</span>
                </button>
              </div>
            )}
            <textarea
              autoFocus
              disabled={feedback !== null}
              value={typedAnswer}
              onChange={(e) => setTypedAnswer(e.target.value)}
              placeholder="Type your Tamil answer here..."
              className="w-full min-h-[120px] p-6 text-xl rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-mozhi-primary focus:ring-4 focus:ring-mozhi-primary/20 transition-all outline-none resize-none font-medium text-slate-800"
            />
          </div>
        )}
      </div>

      {/* Footer Feedback Bar */}
      <div className={`w-full border-t-2 mt-auto transition-colors duration-300 ${
        feedback === "correct" ? "bg-green-100 border-green-200/50" : 
        feedback === "incorrect" ? "bg-red-100 border-red-200/50" : "bg-white border-slate-100"
      }`}>
        <div className="max-w-4xl mx-auto w-full px-4 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex-1 w-full text-center md:text-left">
            {feedback === "correct" && (
              <div className="flex items-center gap-3 text-green-600 font-extrabold justify-center md:justify-start">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-2xl">Excellent!</span>
              </div>
            )}
            
            {feedback === "incorrect" && (
              <div className="flex items-center gap-3 text-red-500 font-extrabold justify-center md:justify-start mb-2">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-2xl">Correction</span>
              </div>
            )}
            
            {feedback === "incorrect" && (
              <p className="text-red-700 font-bold ml-1 md:ml-14 uppercase tracking-wider text-sm">
                Correct answer was expected instead.
              </p>
            )}
          </div>

          <button
            disabled={!canCheck && !feedback || checking}
            onClick={feedback ? handleContinue : handleCheck}
            className={`w-full md:w-48 py-4 rounded-2xl font-extrabold text-xl uppercase tracking-wide transition-all ${
              feedback === "correct" ? "bg-green-500 text-white hover:bg-green-600" :
              feedback === "incorrect" ? "bg-red-500 text-white hover:bg-red-600" :
              canCheck ? "bg-mozhi-primary text-white hover:bg-mozhi-secondary hover:-translate-y-1 shadow-lg hover:shadow-xl" :
              "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {checking ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : feedback ? "Continue" : "Check"}
          </button>
        </div>
      </div>
    </div>
  );
}