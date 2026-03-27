"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, AlertCircle, GraduationCap, Wifi, Layers } from "lucide-react";
import { TutorCard } from "@/components/features/tutors/TutorCard";
import { getAvailableTutors, Tutor } from "@/services/tutorService";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";
type ModeFilter  = "all" | "online" | "offline" | "both";

export default function PublicTutorsPage() {
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
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-10 animate-in fade-in duration-700">
        <div className="space-y-10 pb-16">
          
          {/* --- Header Section (Clean) --- */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-l-4 border-primary pl-6 py-2">
            <div>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight uppercase">Professional Tutors</h2>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Found {totalTutors} experts ready to help</p>
            </div>
          </div>

          {/* --- Search & Filter Bar --- */}
          <div className="space-y-8 bg-gray-50/50 rounded-[2.5rem] p-8 md:p-10 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-200/50">
               <div className="relative w-full lg:max-w-md">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                 <input
                   type="text"
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search by name, skill, or language…"
                   className="w-full rounded-[2rem] border border-gray-100 bg-white py-4 pl-14 pr-6 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-xl shadow-gray-200/5"
                 />
               </div>

               <div className="flex flex-wrap items-center gap-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest hidden sm:inline">Proficiency Focus:</span>
                  <div className="flex flex-wrap gap-2">
                    {levelOpts.map(opt => (
                      <button key={opt.value} onClick={() => setLevel(opt.value)}
                        className={cn(
                          "rounded-xl border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all",
                          level === opt.value
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-gray-100 bg-white text-gray-500 hover:border-primary/30 hover:bg-gray-50"
                        )}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Environment:</span>
              {modeOpts.map(opt => (
                <button key={opt.value} onClick={() => setMode(opt.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all",
                    mode === opt.value
                      ? "border-secondary bg-secondary text-white shadow-lg shadow-secondary/20"
                      : "border-gray-100 bg-white text-gray-500 hover:border-secondary/30 hover:bg-gray-50"
                  )}>
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* --- 3. Results Section --- */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl ring-4 ring-primary/5" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing with our global network…</p>
              </div>
            ) : error ? (
              <div className="flex items-center justify-between rounded-3xl border border-red-100 bg-red-50/50 px-8 py-6 text-sm text-red-600 font-bold">
                <div className="flex items-center gap-4">
                   <AlertCircle className="h-6 w-6 shrink-0" /> 
                   <span>{error}</span>
                </div>
                <button onClick={() => loadTutors(1)} className="text-xs underline uppercase tracking-widest">Retry</button>
              </div>
            ) : (
              <>
                {tutors.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-gray-100">
                    <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <GraduationCap className="h-12 w-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-tight">No teachers found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                      {search ? <>We couldn't find matches for <strong>"{search}"</strong>. Try broadening your criteria.</> : "Expand your search filters to find more tutors."}
                    </p>
                    <Button onClick={() => {setSearch(""); setLevel("all"); setMode("all");}} variant="secondary" className="mt-8 px-10">Clear all filters</Button>
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                         Explored {totalTutors} native Tamil experts
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                      {tutors.map((tutor) => (
                        <TutorCard key={tutor._id} tutor={tutor} />
                      ))}
                    </div>
                    
                    <div className="pt-12 border-t border-gray-100">
                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

