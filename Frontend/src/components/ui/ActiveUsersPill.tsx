"use client";

import React, { useEffect, useState } from "react";
import { getPublicStats } from "@/services/authService";

export function ActiveUsersPill() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getPublicStats()
      .then((data) => {
        setCount(data.totalUsers);
      })
      .catch(() => {
        // Fallback to a safe number if API fails
        setCount(1200);
      });
  }, []);

  const displayCount = count !== null ? (count >= 1000 ? `${(count / 1000).toFixed(1)}k+` : `${count}+`) : "1.2k+";
  const realCountLabel = count !== null ? `${count.toLocaleString()}+` : "1,240+";

  return (
    <div className="mt-14 flex items-center justify-center gap-6 p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 max-w-sm mx-auto shadow-2xl shadow-slate-200/40 hover:shadow-primary/5 transition-all cursor-default scale-90 animate-in fade-in zoom-in duration-700">
      <div className="flex -space-x-4">
        <div className="w-12 h-12 rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center font-black text-primary shadow-sm">A</div>
        <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center font-black text-emerald-600 shadow-sm">M</div>
        <div className="w-12 h-12 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center font-black text-purple-600 shadow-sm">S</div>
        <div className="w-12 h-12 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg">
          {displayCount}
        </div>
      </div>
      <div className="text-left">
        <div className="flex items-center gap-0.5 text-amber-500">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
          ))}
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
          {realCountLabel} ACTIVE SYNCS
        </p>
      </div>
    </div>
  );
}
