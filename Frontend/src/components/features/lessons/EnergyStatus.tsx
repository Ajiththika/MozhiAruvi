"use client";

import React, { useState, useEffect } from "react";
import { Zap, Heart, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnergyStatusProps {
  currentEnergy: number;
  maxEnergy: number;
  nextRecoveryIn: number; // ms
  isPremium?: boolean;
  className?: string;
}

export function EnergyStatus({ 
  currentEnergy, 
  maxEnergy, 
  nextRecoveryIn, 
  isPremium,
  className 
}: EnergyStatusProps) {
  const [timeLeft, setTimeLeft] = useState(nextRecoveryIn);

  useEffect(() => {
    setTimeLeft(nextRecoveryIn);
  }, [nextRecoveryIn]);

  useEffect(() => {
    if (timeLeft <= 0 || isPremium || currentEnergy >= maxEnergy) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPremium, currentEnergy, maxEnergy]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isLow = currentEnergy < 5;

  return (
    <div className={cn("flex flex-col items-end gap-2", className)}>
      <div className="flex items-center gap-4">
        {/* Timer Component */}
        {!isPremium && currentEnergy < maxEnergy && timeLeft > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 animate-in fade-in slide-in-from-right-4">
            <Clock className="w-3 h-3 text-primary/60" />
            <span className="text-[10px] font-bold text-primary/70 tabular-nums">
              Next in {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {/* Energy Display */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-2xl border-2 transition-all duration-500 shadow-sm",
          isPremium ? "bg-amber-50 border-amber-200 text-amber-600 ring-4 ring-amber-500/5" :
          isLow ? "bg-red-50 border-red-200 text-red-600 animate-pulse" :
          "bg-white border-slate-100 text-slate-700"
        )}>
          {isPremium ? (
             <>
               <Zap className="w-5 h-5 fill-amber-500" />
               <span className="font-black text-sm uppercase tracking-widest">Unlimited</span>
             </>
          ) : (
             <>
               <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className={cn(
                        "w-4 h-4 transition-all duration-500",
                        i < Math.floor(currentEnergy / 5) ? "fill-red-500 text-red-500" : "text-slate-200"
                      )} 
                    />
                  ))}
               </div>
               <span className="font-black text-lg tabular-nums">
                 {currentEnergy}
               </span>
             </>
          )}
        </div>
      </div>
      
      {isLow && !isPremium && (
        <span className="text-[9px] font-black uppercase tracking-widest text-red-400 animate-pulse mr-2">
          Low Energy Warning
        </span>
      )}
    </div>
  );
}




export default EnergyStatus;













