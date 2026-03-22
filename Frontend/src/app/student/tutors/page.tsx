"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Loader2, AlertCircle, GraduationCap, Wifi, Layers } from "lucide-react";
import { TutorCard } from "@/components/student/TutorCard";
import { getAvailableTutors, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type ModeFilter  = "all" | "online" | "offline" | "both";

export default function StudentTutorsDirectory() {
  const [tutors, setTutors]     = useState<Tutor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [level, setLevel]       = useState<LevelFilter>("all");
  const [mode, setMode]         = useState<ModeFilter>("all");

  useEffect(() => {
    getAvailableTutors()
      .then(setTutors)
      .catch(() => setError("Could not load tutors. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return tutors.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q);
      const matchesLevel = level === "all" || t.levelSupport?.includes(level as any);
      const matchesMode  = mode === "all" || t.teachingMode === mode || t.teachingMode === "both";
      return matchesSearch && matchesLevel && matchesMode;
    });
  }, [tutors, search, level, mode]);

  const levelOpts: { value: LevelFilter; label: string }[] = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const modeOpts: { value: ModeFilter; label: string; icon: React.ReactNode }[] = [
    { value: "all",     label: "Any Mode",    icon: null },
    { value: "online",  label: "Online",       icon: <Wifi className="h-3.5 w-3.5" /> },
    { value: "offline", label: "In-Person",    icon: <Layers className="h-3.5 w-3.5" /> },
    { value: "both",    label: "Both",         icon: null },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-mozhi-secondary" /> Find Your Tamil Tutor
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Browse certified teachers, check availability, and send a session request — all from here.
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or keywords…"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-mozhi-primary focus:ring-2 focus:ring-mozhi-primary/20 dark:text-slate-200"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {levelOpts.map(opt => (
            <button key={opt.value} onClick={() => setLevel(opt.value)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                level === opt.value
                  ? "border-mozhi-primary bg-mozhi-primary text-white shadow-sm shadow-mozhi-primary/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-mozhi-primary/50"
              )}>
              {opt.label}
            </button>
          ))}
          <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1 self-stretch" />
          {modeOpts.map(opt => (
            <button key={opt.value} onClick={() => setMode(opt.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition-all",
                mode === opt.value
                  ? "border-sky-500 bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-sky-500/50"
              )}>
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
          <p className="text-sm font-medium text-slate-500">Finding available tutors…</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">
                {search ? <>No tutors matching <strong>"{search}"</strong></> : "No tutors available right now. Check back soon!"}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {filtered.length} tutor{filtered.length !== 1 ? "s" : ""} available
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}