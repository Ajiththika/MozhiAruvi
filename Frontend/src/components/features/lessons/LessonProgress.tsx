"use client";

import React from "react";
import { Zap } from "lucide-react";

interface LessonProgressProps {
  progress: number;
  credits: number;
}

export function LessonProgress({ progress, credits }: LessonProgressProps) {
  return (
    <div className="flex-1 max-w-xl hidden md:block">
      <div className="flex items-center justify-between mb-3 px-1">
         <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
           Progress: <span className="text-primary">{progress}%</span>
         </span>
         <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Power: {credits}</span>
         </div>
      </div>
      <div className="h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100 shadow-inner">
         <div 
           className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
           style={{ width: `${progress}%` }} 
         />
      </div>
    </div>
  );
}
