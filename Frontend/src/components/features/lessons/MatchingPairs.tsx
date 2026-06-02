"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type LeftItem = { left: string; tamilWord?: string; audioUrl?: string };

interface MatchingPairsProps {
  question: {
    _id: string;
    // Secure shape (students): linkage-stripped, server-shuffled columns.
    matchLefts?: LeftItem[];
    matchRights?: string[];
    // Legacy / admin preview shape (full linkage present).
    pairs?: Array<{ left: string; right: string; tamilWord?: string; audioUrl?: string }>;
    correctAnswer?: string;
  };
  /** Fired once the student has matched every left item. The server grades it. */
  onComplete: (mapping: { left: string; right: string }[]) => void;
  /** Lock the board once an answer has been registered (correct or incorrect). */
  locked?: boolean;
  /** True when the server confirmed a correct match (keeps the correct styling). */
  isCorrect?: boolean;
  questionNumber?: number;
  tamilWord?: string;
  audioUrl?: string;
  onPlayTamil?: () => void;
  playingAudio?: boolean;
}

export function MatchingPairs({
  question: q,
  onComplete,
  locked,
  isCorrect,
  questionNumber,
  tamilWord,
  audioUrl,
  onPlayTamil,
  playingAudio,
}: MatchingPairsProps) {
  // Resolve the two columns. Prefer the secure server shape; fall back to legacy
  // `pairs` (admin preview) by splitting + shuffling locally so behaviour is identical.
  const { leftItems, rightItems } = useMemo(() => {
    if (Array.isArray(q.matchLefts) && Array.isArray(q.matchRights)) {
      return { leftItems: q.matchLefts, rightItems: q.matchRights };
    }
    let pairs = q.pairs || [];
    if (pairs.length === 0 && q.correctAnswer) {
      try {
        const parsed = JSON.parse(q.correctAnswer);
        if (Array.isArray(parsed)) pairs = parsed;
      } catch {}
    }
    const lefts: LeftItem[] = pairs
      .map((p) => ({ left: p.left, tamilWord: p.tamilWord, audioUrl: p.audioUrl }))
      .sort(() => Math.random() - 0.5);
    const rights = pairs.map((p) => p.right).sort(() => Math.random() - 0.5);
    return { leftItems: lefts, rightItems: rights };
  }, [q]);

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  // mapping: left value -> chosen right value
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const firedRef = useRef(false);

  const usedRights = useMemo(() => new Set(Object.values(mapping)), [mapping]);
  const totalPairs = leftItems.length;

  useEffect(() => {
    if (firedRef.current || locked) return;
    if (totalPairs > 0 && Object.keys(mapping).length === totalPairs) {
      firedRef.current = true;
      const result = leftItems.map((l) => ({ left: l.left, right: mapping[l.left] }));
      onComplete(result);
    }
  }, [mapping, totalPairs, leftItems, locked, onComplete]);

  const handleLeftClick = (left: string) => {
    if (locked) return;
    // Tapping an already-linked left unlinks it (lets the student fix a choice).
    if (mapping[left] !== undefined) {
      setMapping((prev) => {
        const next = { ...prev };
        delete next[left];
        return next;
      });
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft((prev) => (prev === left ? null : left));
  };

  const handleRightClick = (right: string) => {
    if (locked) return;
    if (usedRights.has(right)) {
      // Unlink whichever left currently owns this right.
      setMapping((prev) => {
        const owner = Object.keys(prev).find((k) => prev[k] === right);
        if (!owner) return prev;
        const next = { ...prev };
        delete next[owner];
        return next;
      });
      return;
    }
    if (!selectedLeft) return;
    setMapping((prev) => ({ ...prev, [selectedLeft]: right }));
    setSelectedLeft(null);
  };

  const showSpeaker = !!(tamilWord || audioUrl);

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center gap-6 self-start mb-6 w-full">
        {showSpeaker && onPlayTamil && (
          <button
            type="button"
            onClick={onPlayTamil}
            disabled={playingAudio}
            className={cn(
              "flex items-center justify-center h-16 w-16 rounded-[1.5rem] border-2 transition-all shadow-lg shrink-0",
              playingAudio ? "bg-primary/10 animate-pulse" : "bg-white hover:bg-primary/5"
            )}
            aria-label="Play Tamil pronunciation"
          >
            {playingAudio ? (
              <Loader2 size={28} className="animate-spin text-primary" />
            ) : (
              <Volume2 size={28} className="text-primary" />
            )}
          </button>
        )}
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none flex items-center">
          {questionNumber && <span className="mr-4 font-mono">{questionNumber}.</span>}
          Match the pairs
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-8 w-full">
        <div className="space-y-6">
          {leftItems.map((item) => {
            const isLinked = mapping[item.left] !== undefined;
            return (
              <button
                key={item.left}
                disabled={locked}
                onClick={() => handleLeftClick(item.left)}
                className={cn(
                  "w-full py-6 px-4 text-xl font-semibold rounded-[1.5rem] border-2 transition-all duration-300 text-center shadow-sm",
                  isCorrect && isLinked ? "bg-emerald-50 border-emerald-500 text-emerald-600" :
                  isLinked ? "bg-primary/5 border-primary/60 text-primary" :
                  selectedLeft === item.left ? "bg-primary/5 border-primary text-primary shadow-xl scale-105" :
                  "bg-white border-slate-100 hover:border-slate-200 text-slate-700 active:scale-95"
                )}
              >
                {item.left}
              </button>
            );
          })}
        </div>

        <div className="space-y-6">
          {rightItems.map((item) => {
            const isUsed = usedRights.has(item);
            return (
              <button
                key={item}
                disabled={locked}
                onClick={() => handleRightClick(item)}
                className={cn(
                  "w-full py-6 px-4 text-xl font-semibold rounded-[1.5rem] border-2 transition-all duration-300 text-center shadow-sm",
                  isCorrect && isUsed ? "bg-emerald-50 border-emerald-500 text-emerald-600" :
                  isUsed ? "bg-primary/5 border-primary/60 text-primary" :
                  "bg-white border-slate-100 hover:border-slate-200 text-slate-700 active:scale-95"
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MatchingPairs;
