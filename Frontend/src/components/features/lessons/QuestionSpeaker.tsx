"use client";

import React from "react";
import { Volume2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/services/lessonService";
import { shouldShowSpeaker } from "@/lib/questionTts";

interface QuestionSpeakerProps {
  question: Question;
  playingId: string | null;
  onPlay: (tamilText: string, questionId: string, audioUrl?: string) => void;
  className?: string;
  size?: "md" | "lg";
}

export function QuestionSpeaker({
  question,
  playingId,
  onPlay,
  className,
  size = "lg",
}: QuestionSpeakerProps) {
  if (!shouldShowSpeaker(question)) return null;

  const tamilText = (question.tamilWord || question.expectedAudioText || "").trim();
  const isPlaying = playingId === question._id;
  const dim = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const iconSize = size === "lg" ? 40 : 28;

  return (
    <button
      type="button"
      onClick={() => onPlay(tamilText, question._id, question.audioUrl)}
      disabled={isPlaying || (!tamilText && !question.audioUrl)}
      aria-label="Play Tamil pronunciation"
      className={cn(
        "flex items-center justify-center rounded-[2rem] border-2 transition-all shadow-lg active:scale-95 shrink-0",
        dim,
        isPlaying ? "bg-primary/10 animate-pulse" : "bg-white hover:bg-primary/5",
        className
      )}
    >
      {isPlaying ? (
        <Loader2 size={iconSize} className="animate-spin text-primary" />
      ) : (
        <Volume2 size={iconSize} className="text-primary" />
      )}
    </button>
  );
}
