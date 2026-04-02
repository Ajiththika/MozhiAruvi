"use client";

import React from "react";
import { Zap } from "lucide-react";

interface LessonProgressProps {
  progress: number;
}

export function LessonProgress({ progress }: LessonProgressProps) {
  return (
    <div className="flex-1 max-w-xl hidden md:block">
      <div className="flex items-center justify-between mb-3 px-1">
         <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">
           Progress: <span className="text-primary">{progress}%</span>
         </span>
      </div>
      <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
         <div 
           className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.3)]"
           style={{ width: `${progress}%` }} 
         />
      </div>
    </div>
  );
}




export default LessonProgress;













