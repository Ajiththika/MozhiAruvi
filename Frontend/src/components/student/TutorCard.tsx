import React from "react";
import Link from "next/link";
import { Globe, Video, Wifi, WifiOff, Clock, Layers, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tutor } from "@/services/tutorService";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-500/20",
  intermediate: "bg-sky-500/10 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border border-sky-500/20",
  advanced:     "bg-violet-500/10 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 border border-violet-500/20",
};

const modeLabel: Record<string, string> = {
  online: "Online", offline: "In-Person", both: "Online & In-Person",
};

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const { _id, name, profilePhoto, bio, specialization, experience,
          languages, teachingMode, levelSupport, responseTime, hourlyRate, isTutorAvailable } = tutor;

  return (
    <div className="group relative flex flex-col rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-mozhi-primary/10 overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 h-24 w-24 bg-mozhi-primary/5 rounded-full -mr-12 -mt-12 group-hover:bg-mozhi-primary/10 transition-colors" />

      <div className="flex items-start gap-4 p-6 pb-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mozhi-light dark:bg-mozhi-primary/20 ring-2 ring-white dark:ring-slate-800">
            {profilePhoto ? (
              <img src={profilePhoto} alt={name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              <span className="text-2xl font-black text-mozhi-primary dark:text-mozhi-secondary">
                {name.charAt(0)}
              </span>
            )}
          </div>
          {/* Online dot */}
          <span className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-slate-800",
            isTutorAvailable ? "bg-emerald-500" : "bg-slate-400"
          )} title={isTutorAvailable ? "Available now" : "Currently unavailable"} />
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight group-hover:text-mozhi-primary transition-colors">{name}</h3>
              <p className="mt-1 text-[10px] font-black text-mozhi-primary dark:text-mozhi-secondary uppercase tracking-widest truncate">
                {specialization ?? "Tamil Language Guide"}
              </p>
            </div>
            {hourlyRate && (
              <div className="text-right">
                <span className="block text-sm font-black text-slate-900 dark:text-white">{hourlyRate} XP</span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Per Session</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Summary */}
      <div className="px-6 flex-1">
        {bio && (
          <p className="text-[13px] font-medium text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed py-2">
            {bio}
          </p>
        )}
      </div>

      {/* Meta pills row */}
      <div className="mt-4 flex flex-wrap gap-2 px-5">
        {/* Levels supported */}
        {levelSupport?.map(level => (
          <span key={level} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize", levelColors[level])}>
            {level}
          </span>
        ))}
        {/* Teaching mode */}
        {teachingMode && (
          <span className="rounded-full bg-sky-50 dark:bg-sky-900/30 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
            {teachingMode === "online" ? <Wifi className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
            {modeLabel[teachingMode]}
          </span>
        )}
      </div>

      {/* Language & response time */}
      <div className="mt-3 flex flex-col gap-1.5 px-5">
        {languages?.length ? (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 shrink-0 text-mozhi-secondary" />
            <span>Speaks: <span className="font-bold text-slate-800 dark:text-slate-200">{languages.join(", ")}</span></span>
          </div>
        ) : null}
        {responseTime && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 shrink-0 text-mozhi-secondary" />
            <span>Replies: <span className="font-bold text-slate-800 dark:text-slate-200">{responseTime}</span></span>
          </div>
        )}
      </div>

      {/* Bottom Info & CTA */}
      <div className="mt-6 flex flex-col gap-4 p-6 pt-0">
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-4">
             <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-mozhi-secondary" />
                <span>{languages?.[0] || "Tamil"} Expert</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-mozhi-secondary" />
                <span>~{responseTime || "24h"} reply</span>
             </div>
          </div>
        
          <Link
            href={`/student/tutors/${_id}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-mozhi-primary py-3.5 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-mozhi-primary/20 transition-all hover:bg-mozhi-primary hover:scale-[1.02] active:scale-95"
          >
            Explore Profile
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
      </div>
    </div>
  );
}
