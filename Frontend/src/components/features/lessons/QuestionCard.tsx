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
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl animate-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 gap-4 w-full">
        {q.options?.map((opt: string, idx: number) => {
          const isCorrect = feedback === "correct" && selectedIndex === idx;
          const isIncorrect = feedback === "incorrect" && selectedIndex === idx;
          const isSelected = selectedIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => onSelect(q._id, idx, q.correctOptionIndex)}
              disabled={!!feedback || credits <= 0}
              className={cn(
                "group relative flex items-center gap-6 p-6 md:p-8 text-left rounded-3xl border-2 transition-all duration-300",
                isCorrect ? "bg-emerald-50 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]" :
                isIncorrect ? "bg-red-50 border-red-500 shadow-xl shadow-red-500/10 scale-[1.02]" :
                isSelected ? "bg-primary/5 border-primary shadow-xl shadow-primary/10 scale-[1.02]" :
                "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-lg active:scale-[0.98]"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl font-black text-lg border-2 shrink-0 transition-colors shadow-sm",
                isCorrect ? "bg-emerald-500 text-white border-emerald-400" :
                isIncorrect ? "bg-red-500 text-white border-red-400" :
                isSelected ? "bg-primary text-white border-primary/40" :
                "bg-gray-50 text-gray-400 border-gray-100 group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20"
              )}>
                {idx + 1}
              </div>
              <span className={cn(
                "text-2xl md:text-3xl font-bold tracking-tight leading-snug",
                isCorrect ? "text-emerald-700" : 
                isIncorrect ? "text-red-700" : 
                isSelected ? "text-primary" : "text-gray-800"
              )}>
                {opt}
              </span>
              
              <div className="absolute right-8">
                {isCorrect && <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in spin-in-12" />}
                {isIncorrect && <XCircle className="h-8 w-8 text-red-500 animate-in shake" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
