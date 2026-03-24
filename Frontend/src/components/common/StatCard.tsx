import React from "react";
import { cn } from "@/lib/utils";
import { MoveUpRight, MoveDownRight } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:border-primary/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-primary/40",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 dark:bg-primary/10 dark:border-primary/20">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        {trend && (
           <div className={cn(
             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors",
             trend === "up" ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30" : 
             trend === "down" ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/10 dark:border-red-900/30" : 
             "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:border-slate-700"
           )}>
             <div className="flex items-center gap-1">
                {trend === "up" ? <MoveUpRight className="h-3 w-3" /> : 
                 trend === "down" ? <MoveDownRight className="h-3 w-3" /> : 
                 null}
                {trendValue}
             </div>
           </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
        {description && (
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
