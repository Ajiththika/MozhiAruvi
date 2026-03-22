import React from "react";
import Link from "next/link";
import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LessonCardProps {
  id: string;
  title: string;
  description: string;
  duration: string;
  xpReward: number;
  status: "locked" | "active" | "completed";
  thumbnailUrl?: string; // Optional image overlay
}

export function LessonCard({
  id,
  title,
  description,
  duration,
  xpReward,
  status,
  thumbnailUrl,
}: LessonCardProps) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        isLocked
          ? "border-slate-200 bg-slate-/50 dark:border-slate-200 dark:bg-slate-900/50"
          : isCompleted
          ? "border-emerald-200 bg-emerald-50/10 shadow-sm hover:shadow-md dark:border-emerald-900/30 dark:bg-emerald-950/10"
          : "border-mozhi-light bg-white shadow-sm hover:shadow-md dark:border-blue-900/30 dark:bg-slate-50"
      )}
    >
      {/* Thumbnail Area */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-50 dark:bg-slate-50">
        {thumbnailUrl ? (
           <img
             src={thumbnailUrl}
             alt={title}
             className={cn(
                "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
                isLocked && "opacity-50 grayscale"
             )}
           />
        ) : (
           <div className={cn(
              "flex h-full w-full items-center justify-center transition-transform duration-500 group-hover:scale-105",
              isLocked ? "bg-slate-50 dark:bg-slate-50" : "bg-mozhi-light dark:bg-mozhi-primary/20"
           )}>
               <PlayCircle className={cn(
                  "h-12 w-12",
                  isLocked ? "text-slate-600 dark:text-slate-600" : "text-mozhi-secondary dark:text-mozhi-secondary"
               )} />
           </div>
        )}

        {/* Status Overlay icon */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm dark:bg-slate-/90">
          {isLocked ? (
            <Lock className="h-4 w-4 text-slate-600 dark:text-slate-600" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
          ) : (
             <PlayCircle className="h-4 w-4 text-mozhi-primary dark:text-mozhi-secondary" />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            "text-lg font-bold leading-tight",
            isLocked ? "text-slate-600 dark:text-slate-600" : "text-slate-600 dark:text-slate-600"
          )}
        >
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-600">
          {description}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-xs font-semibold">
           <span className="text-slate-600 dark:text-slate-600">
              {duration}
           </span>
           <span className="rounded-md bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500">
              +{xpReward} XP
           </span>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {isLocked ? (
             <button disabled className="w-full rounded-xl bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 dark:bg-slate-50 dark:text-slate-600">
                Locked
             </button>
          ) : (
             <Link
               href={`/student/lessons/${id}`}
               className={cn(
                  "flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-950",
                  isCompleted
                    ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-50 focus:ring-slate-300"
                    : "bg-mozhi-primary text-white hover:bg-mozhi-primary focus:ring-mozhi-primary"
               )}
             >
                {isCompleted ? "Review Lesson" : "Start Learning"}
             </Link>
          )}
        </div>
      </div>
    </div>
  );
}
