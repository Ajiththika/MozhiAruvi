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
        "flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-primary/20",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-light/30">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        {trend && (
           <div className={cn(
             "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
             trend === "up" ? "bg-success/10 text-success" : 
             trend === "down" ? "bg-error/10 text-error" : 
             "bg-slate-100 text-slate-500"
           )}>
             {trend === "up" ? <MoveUpRight className="h-3 w-3" /> : 
              trend === "down" ? <MoveDownRight className="h-3 w-3" /> : 
              null}
             {trendValue}
           </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {description && (
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
