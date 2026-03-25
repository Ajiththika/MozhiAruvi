"use client";

import React from "react";
import Link from "next/link";
import { Lock, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  const { user } = useAuth();
  const router = useRouter();
  const isLocked = status === "locked";
  const isCompleted = status === "completed";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300",
        isLocked
          ? "border-gray-100 bg-gray-50  dark:bg-white/50"
          : isCompleted
          ? "border-success/20 bg-success/5 shadow-sm hover:shadow-md dark:border-success/10 dark:bg-success/5"
          : "border-accent bg-white shadow-sm hover:shadow-md  dark:bg-white"
      )}
    >
      {/* Thumbnail Area */}
      <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
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
              isLocked ? "bg-gray-100 dark:bg-gray-800" : "bg-accent/30 dark:bg-primary/20"
           )}>
               <PlayCircle className={cn(
                  "h-12 w-12",
                  isLocked ? "text-gray-400 dark:text-gray-500" : "text-secondary dark:text-secondary"
               )} />
           </div>
        )}

        {/* Status Overlay icon */}
        <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm dark:bg-white/90">
          {isLocked ? (
            <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
             <PlayCircle className="h-4 w-4 text-primary dark:text-secondary" />
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        <h3
          className={cn(
            "text-lg font-bold leading-tight",
            isLocked ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-white"
          )}
        >
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
           <span className="text-gray-400 dark:text-gray-500">
              {duration}
           </span>
           <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-600 border border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-500 dark:border-amber-900/40">
              +{xpReward} XP
           </span>
        </div>

        {/* Action Button */}
        <div className="mt-5">
          {isLocked ? (
             <button disabled className="w-full rounded-xl bg-gray-100 py-2 text-sm font-bold text-gray-400 dark:bg-gray-800 dark:text-gray-600">
                Locked
             </button>
          ) : (
             <button
               onClick={() => {
                 const target = `/student/lessons/${id}`;
                 if (!user) {
                   router.push(`/auth/signin?redirect=${encodeURIComponent(target)}`);
                 } else {
                   router.push(target);
                 }
               }}
               className={cn(
                  "flex w-full items-center justify-center rounded-xl py-2.5 text-[13px] font-bold transition-all active:scale-95 focus:outline-none focus:ring-4 focus:ring-primary/10",
                   isCompleted
                    ? "border border-gray-100 bg-white text-gray-600 hover:bg-gray-50  dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 hover:shadow-sm"
                    : "bg-primary text-white hover:bg-secondary shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5"
               )}
             >
                {isCompleted ? "Review Lesson" : "Start Learning"}
             </button>
          )}
        </div>
      </div>
    </div>
  );
}
