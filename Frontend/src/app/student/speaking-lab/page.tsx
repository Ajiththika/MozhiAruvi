"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic2, Flame, Star, Volume2, Loader2, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { speakTamil } from "@/lib/speak";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import Confetti from "@/components/features/speaking-lab/Confetti";
import DragBoard from "@/components/features/speaking-lab/DragBoard";
import Leaderboard from "@/components/features/speaking-lab/Leaderboard";
import LabAudioRecorder from "@/components/features/speaking-lab/LabAudioRecorder";
import {
  getLabSession,
  getLabLeaderboard,
  LabEvaluation,
  LabProgress,
  SpeakingLabItem,
} from "@/services/speakingLabService";

const TYPE_LABELS: Record<string, string> = {
  phonetic: "Phonetic Sound",
  roleplay: "Situational Roleplay",
  dragboard: "Verbal Drag Board",
  tongue_twister: "Tongue Twister",
  fluency: "Fluency Run",
};

export default function SpeakingLabPage() {
  const [items, setItems] = useState<SpeakingLabItem[]>([]);
  const [sessionSize, setSessionSize] = useState(5);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState<LabProgress>({
    level: 1,
    xp: 0,
    itemsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    batchIndex: 0,
  });
  const [displayXp, setDisplayXp] = useState(0);
  const [confettiKey, setConfettiKey] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [itemPassed, setItemPassed] = useState(false);

  const leaderboardQ = useQuery({
    queryKey: ["speaking-lab", "leaderboard"],
    queryFn: getLabLeaderboard,
    staleTime: 30 * 1000,
  });

  const sessionQ = useQuery({
    queryKey: ["speaking-lab", "session"],
    queryFn: () => getLabSession(),
    staleTime: 0,
  });

  // Seed local state from the first session fetch.
  useEffect(() => {
    if (sessionQ.data) {
      setItems(sessionQ.data.items);
      setSessionSize(sessionQ.data.sessionSize || 5);
      setProgress(sessionQ.data.progress);
      setDisplayXp(sessionQ.data.progress.xp);
      setIndex(sessionQ.data.batchIndex ?? 0);
      setItemPassed(false);
    }
  }, [sessionQ.data]);

  // Animated XP count-up.
  const xpRef = useRef(displayXp);
  useEffect(() => {
    xpRef.current = displayXp;
  }, [displayXp]);
  useEffect(() => {
    if (progress.xp === xpRef.current) return;
    const start = xpRef.current;
    const diff = progress.xp - start;
    const steps = 20;
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      setDisplayXp(Math.round(start + (diff * step) / steps));
      if (step >= steps) {
        setDisplayXp(progress.xp);
        clearInterval(timer);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [progress.xp]);

  const reloadSession = useCallback(async () => {
    setLoadingNext(true);
    try {
      const next = await getLabSession();
      setItems(next.items);
      setSessionSize(next.sessionSize || 5);
      setProgress(next.progress);
      setIndex(next.batchIndex ?? 0);
      setItemPassed(false);
    } finally {
      setLoadingNext(false);
    }
  }, []);

  const advance = useCallback(() => {
    setItemPassed(false);
    if (index + 1 < items.length) {
      setIndex((i) => i + 1);
    } else {
      // Finished the batch — reload from server (picks up new level + fresh items).
      void reloadSession();
    }
  }, [index, items.length, reloadSession]);

  const handleResult = useCallback(
    (ev: LabEvaluation) => {
      setProgress(ev.progress);
      leaderboardQ.refetch();

      if (ev.status === "perfect" && ev.isCorrect) {
        setItemPassed(true);
        setConfettiKey((k) => k + 1);
        if (ev.leveledUp) {
          setLevelUp(true);
          setTimeout(() => setLevelUp(false), 2200);
        }
        const delay = ev.leveledUp ? 2200 : 1400;
        setTimeout(() => {
          // Level-up completes the batch — reload session for the new level.
          if (ev.leveledUp) {
            void reloadSession();
          } else {
            advance();
          }
        }, delay);
      }
    },
    [advance, leaderboardQ, reloadSession]
  );

  const level = progress.level;
  const completedInBatch = progress.batchIndex ?? 0;

  const current = items[index];
  const speechText = current?.tamilWord || current?.expectedAudioText || "";

  return (
    <div className="relative min-h-screen bg-white">
      {/* Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="fixed top-1/4 right-1/4 opacity-[0.03] font-black text-[28rem] text-primary select-none leading-none pointer-events-none rotate-12">
          ஒலி
        </div>
      </div>

      {confettiKey > 0 && <Confetti key={confettiKey} />}

      {/* Level-up overlay */}
      {levelUp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/30 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] px-12 py-10 text-center shadow-2xl border-4 border-amber-300 animate-in zoom-in-90 duration-500">
            <Sparkles className="h-14 w-14 text-amber-400 mx-auto mb-3 animate-bounce" />
            <p className="text-3xl font-black text-primary tracking-tight">Level {level}!</p>
            <p className="text-sm font-bold text-slate-500 mt-2 uppercase tracking-widest">New challenges unlocked</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto py-8 lg:py-12 px-2 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <Mic2 className="text-primary w-5 h-5" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-accent/30 text-[10px] font-black text-primary tracking-[0.2em] uppercase border border-accent/20">
              Speaking Lab
            </span>
          </div>
        </div>

        {/* HUD */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-primary tabular-nums leading-none">{displayXp}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Total XP</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
              <Flame className={cn("w-5 h-5", progress.currentStreak > 0 ? "text-orange-500" : "text-slate-300")} />
            </div>
            <div>
              <p className="text-2xl font-black text-primary tabular-nums leading-none">{progress.currentStreak}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Streak</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-black text-primary tabular-nums leading-none">{level}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                Level · {Math.min(completedInBatch, sessionSize)}/{sessionSize}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="lg" className="rounded-[2rem] border-slate-50 shadow-xl shadow-slate-200/30 min-h-[480px]">
              {sessionQ.isLoading || loadingNext ? (
                <div className="flex flex-col items-center justify-center h-[420px] gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {loadingNext ? "Loading next level…" : "Preparing your lab…"}
                  </p>
                </div>
              ) : sessionQ.isError ? (
                <div className="flex flex-col items-center justify-center h-[420px] gap-3 text-center">
                  <p className="text-sm font-bold text-red-500">Couldn't load the Speaking Lab.</p>
                  <Button onClick={() => sessionQ.refetch()} variant="secondary" size="sm">Retry</Button>
                </div>
              ) : !current ? (
                <div className="flex flex-col items-center justify-center h-[420px] gap-3 text-center">
                  <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-3xl">🎤</div>
                  <p className="text-lg font-bold text-primary">No activities yet</p>
                  <p className="text-sm text-slate-500 max-w-xs">Your tutor hasn't added Speaking Lab drills yet. Check back soon!</p>
                </div>
              ) : (
                <ErrorBoundary resetKey={current._id}>
                  <div className="flex flex-col items-center text-center gap-6">
                    {/* Type badge + progress dots */}
                    <div className="w-full flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                        {TYPE_LABELS[current.type] || current.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {items.map((_, i) => (
                          <span
                            key={i}
                            className={cn(
                              "h-1.5 rounded-full transition-all",
                              i === index ? "w-6 bg-primary" : i < index ? "w-1.5 bg-emerald-400" : "w-1.5 bg-slate-200"
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="space-y-3 pt-4">
                      <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto">{current.prompt}</p>
                      {speechText && (
                        <div className="flex items-center justify-center gap-3">
                          <h2 className="text-4xl font-black text-primary tracking-tight">{speechText}</h2>
                          <button
                            type="button"
                            onClick={() => speakTamil(speechText)}
                            className="h-10 w-10 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                            aria-label="Hear pronunciation"
                          >
                            <Volume2 className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                      {current.phoneticHint && (
                        <p className="text-xs font-semibold text-slate-400 italic">/{current.phoneticHint}/</p>
                      )}
                      {current.audioUrl && (
                        <audio controls src={current.audioUrl} className="mx-auto mt-2 h-9" />
                      )}
                    </div>

                    {/* Drag board scaffold for verbal sequencing */}
                    {current.type === "dragboard" && current.sequence && current.sequence.length > 0 && (
                      <DragBoard tokens={current.sequence} className="mx-auto" />
                    )}

                    {/* Recorder */}
                    <LabAudioRecorder
                      key={current._id}
                      item={current}
                      locked={itemPassed}
                      onResult={handleResult}
                    />
                  </div>
                </ErrorBoundary>
              )}
            </Card>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <Leaderboard data={leaderboardQ.data} isLoading={leaderboardQ.isLoading} />
            <div className="mt-6 bg-primary rounded-[2rem] p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 font-black text-[8rem] leading-none -translate-y-4 translate-x-2">க</div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Keep your streak</p>
                <p className="text-lg font-black mt-1 leading-tight">Speak daily to multiply XP!</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-white/80">
                  <Flame className="h-4 w-4" /> Best streak: {progress.bestStreak}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
