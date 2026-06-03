"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { GripVertical, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakTamil } from "@/lib/speak";

/**
 * Verbal drag board — the learner drags tiles into the correct order, then
 * speaks the full sequence aloud (graded by the recorder). Shows a live "in
 * order" hint to scaffold the verbal sequencing exercise.
 */
interface DragBoardProps {
  tokens: string[];
  className?: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DragBoard({ tokens, className }: DragBoardProps) {
  const [order, setOrder] = useState<string[]>(() => shuffle(tokens));
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    setOrder(shuffle(tokens));
  }, [tokens]);

  const isCorrect = useMemo(() => order.join("|") === tokens.join("|"), [order, tokens]);

  const handleDrop = (target: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === target) return;
    setOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(target, 0, moved);
      return next;
    });
  };

  return (
    <div className={cn("w-full max-w-lg", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">Arrange, then say it aloud</span>
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
            isCorrect ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
          )}
        >
          {isCorrect ? "In order" : "Drag to sort"}
        </span>
      </div>
      <div className="space-y-2">
        {order.map((tok, i) => (
          <div
            key={`${tok}-${i}`}
            draggable
            onDragStart={() => (dragIndex.current = i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className={cn(
              "group flex items-center gap-3 px-4 py-3 rounded-2xl border-2 bg-white cursor-grab active:cursor-grabbing transition-all",
              isCorrect ? "border-emerald-200" : "border-slate-100 hover:border-primary/30"
            )}
          >
            <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-primary/50 shrink-0" />
            <span className="flex-1 text-lg font-bold text-slate-700">{tok}</span>
            <button
              type="button"
              onClick={() => speakTamil(tok)}
              className="text-primary/50 hover:text-primary transition-colors shrink-0"
              aria-label="Hear word"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DragBoard;
