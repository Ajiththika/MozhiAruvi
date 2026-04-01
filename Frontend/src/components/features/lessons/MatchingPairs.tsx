"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

interface MatchingPairsProps {
  question: {
    _id: string;
    pairs: Array<{ left: string; right: string }>;
    correctAnswer?: string;
  };
  onResult: (passed: boolean) => void;
  isCorrect?: boolean;
}

export function MatchingPairs({ question: q, onResult, isCorrect }: MatchingPairsProps) {
  const [leftItems, setLeftItems] = useState<string[]>([]);
  const [rightItems, setRightItems] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongMatch, setWrongMatch] = useState<[string, string] | null>(null);

  // Parse pairs once and keep them stable
  const activePairs = useMemo(() => {
    let pairs = q.pairs || [];
    if (pairs.length === 0 && q.correctAnswer) {
      try {
        const parsed = JSON.parse(q.correctAnswer);
        if (Array.isArray(parsed)) pairs = parsed;
      } catch (e) {}
    }
    return pairs;
  }, [q]);

  useEffect(() => {
    if (activePairs.length > 0) {
      setLeftItems(activePairs.map(p => p.left).sort(() => Math.random() - 0.5));
      setRightItems(activePairs.map(p => p.right).sort(() => Math.random() - 0.5));
      setMatched(new Set());
    }
  }, [activePairs]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const isMatch = activePairs.some(p => p.left === selectedLeft && p.right === selectedRight);
      if (isMatch) {
        setMatched(prev => {
          const next = new Set(prev);
          next.add(selectedLeft);
          next.add(selectedRight);
          
          if (next.size === activePairs.length * 2) {
            onResult(true);
          }
          return next;
        });
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        setWrongMatch([selectedLeft, selectedRight]);
        setTimeout(() => {
          setWrongMatch(null);
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 1000);
      }
    }
  }, [selectedLeft, selectedRight, activePairs, onResult]);

  return (
    <div className="flex flex-col items-center gap-16 w-full max-w-4xl animate-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight self-start mb-8 leading-none">
        Match the pairs
      </h2>

      <div className="grid grid-cols-2 gap-8 w-full">
        <div className="space-y-6">
          {leftItems.map((item) => (
            <button
              key={item}
              disabled={matched.has(item) || isCorrect}
              onClick={() => setSelectedLeft(item)}
              className={cn(
                "w-full py-10 px-6 text-2xl font-semibold rounded-[2rem] border-2 transition-all duration-300 text-center shadow-sm",
                matched.has(item) ? "bg-gray-100 border-transparent text-gray-300 opacity-30 scale-95" :
                wrongMatch?.[0] === item ? "bg-red-50 border-red-500 text-red-600 animate-shake" :
                selectedLeft === item ? "bg-primary/5 border-primary text-primary shadow-xl scale-105" :
                "bg-white border-gray-100 hover:border-gray-200 text-gray-700 active:scale-95"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {rightItems.map((item) => (
            <button
              key={item}
              disabled={matched.has(item) || isCorrect}
              onClick={() => setSelectedRight(item)}
              className={cn(
                "w-full py-10 px-6 text-2xl font-semibold rounded-[2rem] border-2 transition-all duration-300 text-center shadow-sm",
                matched.has(item) ? "bg-gray-100 border-transparent text-gray-300 opacity-30 scale-95" :
                wrongMatch?.[1] === item ? "bg-red-50 border-red-500 text-red-600 animate-shake" :
                selectedRight === item ? "bg-primary/5 border-primary text-primary shadow-xl scale-105" :
                "bg-white border-gray-100 hover:border-gray-200 text-gray-700 active:scale-95"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
