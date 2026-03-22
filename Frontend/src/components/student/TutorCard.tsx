import React from "react";
import Link from "next/link";
import { Globe, Video, Wifi, WifiOff, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tutor } from "@/services/tutorService";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  intermediate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  advanced:     "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
};

const modeLabel: Record<string, string> = {
  online: "Online", offline: "In-Person", both: "Online & In-Person",
};

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const { _id, name, profilePhoto, bio, specialization, experience,
          languages, teachingMode, levelSupport, responseTime, hourlyRate, isTutorAvailable } = tutor;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800/60">
      {/* Header strip */}
      <div className="flex items-start gap-4 p-5 pb-4">
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

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">{name}</h3>
              <p className="mt-0.5 text-xs font-semibold text-mozhi-primary dark:text-mozhi-secondary truncate">
                {specialization ?? "Tamil Language Tutor"}
              </p>
            </div>
            {hourlyRate ? (
              <span className="shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                {hourlyRate} XP<span className="font-normal text-slate-400">/hr</span>
              </span>
            ) : null}
          </div>

          {experience && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{experience}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="px-5 text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{bio}</p>
      )}

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
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Speaks: <span className="font-semibold text-slate-700 dark:text-slate-300">{languages.join(", ")}</span></span>
          </div>
        ) : null}
        {responseTime && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Replies: <span className="font-semibold text-slate-700 dark:text-slate-300">{responseTime}</span></span>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="mt-5 flex gap-2 px-5 pb-5">
        <Link
          href={`/student/tutors/${_id}`}
          className="flex-1 flex items-center justify-center rounded-xl bg-mozhi-primary py-2.5 text-sm font-bold text-white transition-all hover:bg-mozhi-primary focus:outline-none focus:ring-2 focus:ring-mozhi-primary/50 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
