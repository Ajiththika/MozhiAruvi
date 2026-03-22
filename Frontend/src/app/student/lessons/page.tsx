"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Loader2, AlertCircle, Lock, Circle, Star, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getLessons, Lesson } from "@/services/lessonService";
import { getMe, SafeUser } from "@/services/authService";

function groupBySection(lessons: Lesson[]) {
  const map: Record<string, Record<string, Lesson[]>> = {};
  lessons.forEach((l) => {
    const mName = l.moduleName || "General";
    const sName = l.sectionName || "Basics";
    if (!map[mName]) map[mName] = {};
    if (!map[mName][sName]) map[mName][sName] = [];
    map[mName][sName].push(l);
  });
  return map;
}

export default function StudentLessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getLessons()])
      .then(([userData, lessonsData]) => {
        if (!userData.level || userData.level === "Not Set") {
          router.push("/student/lessons/placement");
          return;
        }
        setUser(userData);
        setLessons(lessonsData);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load path. Please refresh.");
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
        <p className="text-lg font-bold text-slate-500">Building your path...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const grouped = groupBySection(lessons);
  const credits = user?.learningCredits ?? 0;
  const isOutOfEnergy = credits <= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-20 pt-8 px-4">
      {/* Top Bar for Credits and Stats */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-mozhi-primary font-extrabold text-lg">
            <span className="p-2 bg-blue-50 rounded-full"><BookOpen className="w-5 h-5" /></span>
            <span className="hidden sm:inline">Path</span>
          </div>
        </div>
        <div className="flex items-center gap-6 font-bold text-lg">
          <div className="flex items-center gap-1.5 text-orange-500" title="XP Earned">
            <Star className="w-6 h-6 fill-current" /> {user?.xp || 0}
          </div>
          <div className={`flex items-center gap-1.5 ${isOutOfEnergy ? "text-slate-400" : "text-amber-400"}`} title="Daily Credits">
            <Zap className="w-6 h-6 fill-current" /> {credits}/25
          </div>
        </div>
      </div>

      {isOutOfEnergy && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 text-center shadow-lg transform -translate-y-2">
          <Zap className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">Out of Energy!</h3>
          <p className="text-slate-600 mb-4 font-medium">
            You've used up all your daily learning credits. Take a break!
            <br />
            Credits refill automatically (1 credit per hour).
          </p>
        </div>
      )}

      {!isOutOfEnergy && Object.keys(grouped).length === 0 && (
        <div className="py-20 text-center text-slate-500 font-medium">
          No lessons are ready yet. The curriculum is being prepared!
        </div>
      )}

      {/* Path Display */}
      {Object.entries(grouped).map(([moduleName, sections], modIdx) => (
        <div key={moduleName} className="space-y-12">
          
          <div className="bg-mozhi-primary text-white p-6 rounded-3xl shadow-md mx-2 transform rotate-1">
            <h2 className="text-2xl font-black uppercase tracking-widest">{moduleName}</h2>
            <p className="font-medium text-blue-100 mt-1 opacity-90">Module {modIdx + 1}</p>
          </div>

          <div className="flex flex-col gap-10">
            {Object.entries(sections).map(([sectName, sectLessons], sectIdx) => (
              <div key={sectName} className="relative flex flex-col items-center">
                
                {/* Section Header */}
                <div className="w-full max-w-sm bg-white border-2 border-slate-200 shadow-sm rounded-2xl p-4 text-center mb-8 relative z-10 transition-transform hover:scale-105">
                  <h3 className="text-xl font-bold text-slate-800">{sectName}</h3>
                  <p className="text-sm font-semibold text-slate-500">{sectLessons.length} activities</p>
                </div>

                {/* Lesson Nodes Path */}
                <div className="flex flex-col items-center gap-8 relative">
                  <div className="absolute top-0 bottom-0 border-l-[4px] border-slate-200 border-dashed left-1/2 -translate-x-1/2 z-0" />
                  
                  {sectLessons.sort((a, b) => a.orderIndex - b.orderIndex).map((lesson, idx) => {
                    const isPremium = lesson.isPremiumOnly;
                    // Slightly stagger the nodes for a path feel
                    const offset = (idx % 2 === 0) ? -20 : 20;

                    return (
                      <Link
                        key={lesson._id}
                        href={isPremium || isOutOfEnergy ? "#" : `/student/lessons/${lesson._id}`}
                        onClick={(e) => {
                          if (isPremium || isOutOfEnergy) e.preventDefault();
                        }}
                        style={{ transform: `translateX(${offset}px)` }}
                        className={`relative z-10 flex flex-col items-center group ${isPremium || isOutOfEnergy ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1 transition-transform'}`}
                      >
                        {/* Node Bubble */}
                        <div className={`w-20 h-20 rounded-full border-b-[6px] flex items-center justify-center shadow-md transition-all ${
                            isPremium 
                            ? "bg-slate-100 border-slate-300 text-slate-400" 
                            : "bg-green-500 border-green-700 text-white group-hover:bg-green-400 group-hover:border-green-600"
                          }`}
                        >
                          {isPremium ? <Lock className="w-8 h-8" /> : <Star className="w-8 h-8 fill-current opacity-80" />}
                        </div>

                        {/* Title Bubble */}
                        <div className="mt-4 bg-white px-4 py-2 rounded-xl shadow border border-slate-200 font-bold text-slate-700 text-sm max-w-[150px] text-center">
                          {lesson.title}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
}