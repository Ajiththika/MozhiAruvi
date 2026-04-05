"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  day: string;
  count: number;
}

interface WeeklyProgressChartProps {
  data?: DataPoint[];
  title?: string;
}

const DEFAULT_DATA: DataPoint[] = [
  { day: "Mon", count: 12 },
  { day: "Tue", count: 18 },
  { day: "Wed", count: 15 },
  { day: "Thu", count: 25 },
  { day: "Fri", count: 20 },
  { day: "Sat", count: 32 },
  { day: "Sun", count: 28 },
];

export default function WeeklyProgressChart({ data = DEFAULT_DATA, title }: WeeklyProgressChartProps) {
  const max = Math.max(...data.map((d) => d.count), 10);

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-xl font-black text-slate-800 tracking-tight">{title || "Weekly Learning Activity"}</h4>
          <p className="text-sm font-medium text-slate-500 mt-1">Consistency is key to mastery.</p>
        </div>
        <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span className="h-2 w-2 rounded-full bg-primary/20" /> Sessions
            </span>
        </div>
      </div>

      <div className="relative h-48 w-full flex items-end justify-between gap-2 px-2">
        {/* Horizontal Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="absolute left-0 right-0 border-t border-slate-50 pointer-events-none" 
            style={{ bottom: `${(i / 3) * 100}%` }} 
          />
        ))}

        {data.map((d, i) => {
          const height = (d.count / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="relative flex-1 w-full flex items-end justify-center">
                <div 
                  className={cn(
                    "w-full max-w-[40px] rounded-t-xl bg-primary/10 border-t-2 border-primary/20 transition-all duration-700 ease-out group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 group-hover:scale-x-110 group-hover:border-primary",
                    i === 5 ? "bg-primary/20 border-primary/40" : ""
                  )}
                  style={{ height: `${height}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                    {d.count} Units
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
