"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, AlertCircle, GraduationCap } from "lucide-react";
import { TutorCard } from "@/components/features/tutors/TutorCard";
import { getAvailableTutors } from "@/services/tutorService";
import Button from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useQuery } from "@tanstack/react-query";

export default function PublicTutorsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Search Debounce Logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // Reset to page 1 on search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["tutors", currentPage, debouncedSearch, "all", "all"],
    queryFn: () => {
      console.log(`[DEBUG] Fetching tutors... Page: ${currentPage}, Search: ${debouncedSearch}`);
      return getAvailableTutors(currentPage, 6, { search: debouncedSearch, level: "all", mode: "all" });
    },
    staleTime: 5 * 60 * 1000,
  });

  const tutors = data?.tutors || [];
  const totalPages = data?.totalPages || 1;
  const totalTutors = data?.totalTutors || 0;

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

          {/* --- Search Bar --- */}
          <div className="bg-gray-50/50 rounded-2xl p-8 md:p-10 border border-gray-100">
            <div className="relative w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, skill, or language…"
                className="w-full rounded-[2rem] border border-gray-100 bg-white py-4 pl-14 pr-6 text-sm font-semibold text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/5 shadow-xl shadow-gray-200/5"
              />
            </div>
          </div>

           <div className="min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-xl ring-4 ring-primary/5" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing with our global network…</p>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-between rounded-3xl border border-red-100 bg-red-50/50 px-8 py-6 text-sm text-red-600 font-bold">
                <div className="flex items-center gap-4">
                   <AlertCircle className="h-6 w-6 shrink-0" /> 
                   <span>{error?.message || "Could not load tutors. Please try again."}</span>
                </div>
                <button onClick={() => refetch()} className="text-xs underline uppercase tracking-widest">Retry</button>
              </div>
            ) : (
              <>
                {tutors.length === 0 ? (
                  <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-gray-100">
                    <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                      <GraduationCap className="h-12 w-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3 uppercase tracking-tight">No teachers found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto font-medium">
                      {searchInput ? <>We couldn't find matches for <strong>"{searchInput}"</strong>. Try broadening your criteria.</> : "Check back later for more tutors."}
                    </p>
                    <Button onClick={() => setSearchInput("")} variant="secondary" className="mt-8 px-10">Clear search</Button>
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
