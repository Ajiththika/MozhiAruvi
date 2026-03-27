"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: any;
  feedback: "correct" | "incorrect" | undefined;
  credits: number;
  selectedIndex?: number;
  onSelect: (qId: string, idx: number, correctIdx?: number) => void;
}

export function QuestionCard({ question: q, feedback, credits, selectedIndex, onSelect }: QuestionCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl pt-8">
      {q.options?.map((opt: string, idx: number) => {
        const isCorrect = feedback === "correct" && selectedIndex === idx;
        const isIncorrect = feedback === "incorrect" && selectedIndex === idx;
        const isSelected = selectedIndex === idx;

        return (
          <button
            key={idx}
            onClick={() => onSelect(q._id, idx, q.correctOptionIndex)}
            disabled={feedback === "correct" || credits <= 0}
            className={cn(
              "relative flex items-center justify-between p-7 text-left rounded-2xl border-2 transition-all duration-300 group shadow-md",
              isCorrect ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-105 z-10" :
              isIncorrect ? "bg-red-50 border-red-500/50 shadow-inner" :
              isSelected ? "bg-primary/5 border-primary shadow-xl shadow-primary/10" :
              "bg-white border-gray-100 hover:border-primary/40 hover:bg-gray-50 hover:-translate-y-1 active:scale-[0.98]"
            )}
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm border-2 transition-colors",
                isCorrect ? "bg-emerald-500 text-white border-emerald-400" :
                isIncorrect ? "bg-red-500 text-white border-red-500/50" :
                isSelected ? "bg-primary text-white border-primary/40" :
                "bg-gray-50 text-gray-400 border-gray-200 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
              )}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={cn(
                "text-xl font-bold tracking-tight",
                isCorrect ? "text-emerald-700" : isIncorrect ? "text-red-500" : isSelected ? "text-primary" : "text-gray-800"
              )}>
                {opt}
              </span>
            </div>
            {isCorrect && <CheckCircle2 className="h-6 w-6 text-emerald-500 animate-in zoom-in" />}
            {isIncorrect && <XCircle className="h-6 w-6 text-red-500 animate-in shake" />}
          </button>
        );
      })}
    </div>
  );
}
