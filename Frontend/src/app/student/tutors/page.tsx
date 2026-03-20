"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Filter, SlidersHorizontal, Loader2, AlertCircle } from "lucide-react";
import { TutorCard } from "@/components/student/TutorCard";
import { getAvailableTutors, Tutor } from "@/services/tutorService";

export default function StudentTutorsDirectory() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAvailableTutors()
      .then(setTutors)
      .catch(() => setError("Could not load tutors. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return tutors;
    const q = search.toLowerCase();
    return tutors.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.specialization?.toLowerCase().includes(q) ||
        t.bio?.toLowerCase().includes(q)
    );
  }, [tutors, search]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
          Find Your Perfect Tutor 👩‍🏫
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-600">
          Browse our certified teachers, check their schedules, and book 1-on-1 sessions.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or keywords..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-600 focus:border-mozhi-primary focus:ring-2 focus:ring-mozhi-primary/20 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:focus:border-mozhi-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-50">
            <Filter className="h-4 w-4" /> Specialty
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-50">
            <SlidersHorizontal className="h-4 w-4" /> More Filters
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
          <p className="text-sm font-medium text-slate-600">Loading tutors...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-600 dark:text-slate-600">
              No tutors found matching <strong>"{search}"</strong>.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((tutor) => (
                <TutorCard
                  key={tutor._id}
                  id={tutor._id}
                  name={tutor.name}
                  avatarUrl={tutor.profilePhoto ?? undefined}
                  rating={4.8}
                  reviews={0}
                  languages={tutor.languages ?? ["Tamil"]}
                  specialties={
                    tutor.specialization ? [tutor.specialization] : ["General Tamil"]
                  }
                  hourlyRate={tutor.hourlyRate ? `${tutor.hourlyRate} XP` : "—"}
                  shortBio={tutor.bio ?? "Experienced Tamil language tutor."}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}