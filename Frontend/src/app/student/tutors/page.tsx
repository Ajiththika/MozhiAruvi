"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Loader2, AlertCircle, GraduationCap, Wifi, Layers } from "lucide-react";
import { TutorCard } from "@/components/student/TutorCard";
import { getAvailableTutors, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type ModeFilter  = "all" | "online" | "offline" | "both";

import { Pagination } from "@/components/Pagination";

export default function StudentTutorsDirectory() {
  const [tutors, setTutors]     = useState<Tutor[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [level, setLevel]       = useState<LevelFilter>("all");
  const [mode, setMode]         = useState<ModeFilter>("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);

  const loadTutors = (page: number) => {
    setLoading(true);
    getAvailableTutors(page, 6, { search, level, mode })
      .then((res) => {
        setTutors(res.tutors);
        setTotalPages(res.totalPages);
        setTotalTutors(res.totalTutors);
        setCurrentPage(res.currentPage);
      })
      .catch(() => setError("Could not load tutors. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTutors(currentPage);
  }, [currentPage]);

  // Reset page to 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadTutors(1);
    }
  }, [search, level, mode]);

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
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-16">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-mozhi-secondary" /> Find Your Tamil Tutor
        </h2>
        <p className="mt-1 text-slate-500 font-medium">
          Browse certified teachers, check availability, and send a session request — all from here.
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or keywords…"
            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-mozhi-primary focus:ring-4 focus:ring-mozhi-primary/10 shadow-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {levelOpts.map(opt => (
            <button key={opt.value} onClick={() => setLevel(opt.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                level === opt.value
                  ? "border-mozhi-primary bg-mozhi-primary text-white shadow-lg shadow-mozhi-primary/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-mozhi-primary/50 hover:bg-slate-50"
              )}>
              {opt.label}
            </button>
          ))}
          <div className="w-px bg-slate-200 mx-2 self-stretch" />
          {modeOpts.map(opt => (
            <button key={opt.value} onClick={() => setMode(opt.value)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                mode === opt.value
                  ? "border-sky-500 bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-sky-500/50 hover:bg-slate-50"
              )}>
              {opt.icon}{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
          <p className="text-sm font-bold text-slate-500">Finding available tutors…</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-100 px-4 py-4 text-sm text-red-700 font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      ) : (
        <>
          {tutors.length === 0 ? (
            <div className="py-24 text-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">No tutors found</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                {search ? <>We couldn't find any tutors matching <strong>"{search}"</strong>. Try adjusting your filters.</> : "No tutors available right now. Check back soon!"}
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <p className="text-sm font-bold text-slate-500">
                   Showing total {totalTutors} native Tamil tutors
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor._id} tutor={tutor} />
                ))}
              </div>
              
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}