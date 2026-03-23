import React from "react";
import { cn } from "@/lib/utils";
import { MoveUpRight, MoveDownRight } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
          {title}
        </p>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mozhi-light/50 dark:bg-mozhi-primary/20">
          <Icon className="h-5 w-5 text-mozhi-primary dark:text-mozhi-secondary" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-300">
          {value}
        </h3>
        {trend && trendValue && (
          <div className="mt-1 flex items-center gap-1 text-xs font-medium">
            {trend === "up" ? (
              <MoveUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
            ) : trend === "down" ? (
              <MoveDownRight className="h-4 w-4 text-red-600 dark:text-red-500" />
            ) : null}
            <span
              className={cn(
                trend === "up"
                  ? "text-emerald-600 dark:text-emerald-500"
                  : trend === "down"
                  ? "text-red-600 dark:text-red-500"
                  : "text-slate-600 dark:text-slate-300"
              )}
            >
              {trendValue}
            </span>
            <span className="text-slate-600 dark:text-slate-300 ml-1 font-normal">
              vs last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
