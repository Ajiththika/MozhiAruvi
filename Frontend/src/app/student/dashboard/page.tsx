"use client";

import React, { useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { BookOpen, Trophy, AlertCircle, ArrowRight, Clock, BookMarked, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getDashboardData } from "@/services/authService";
import { useQuery } from "@tanstack/react-query";
import { DashboardSkeleton } from "./DashboardSkeleton";

export default function StudentDashboard() {
  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: () => {
      console.log("[DEBUG] Fetching student dashboard data...");
      return getDashboardData();
    },
    staleTime: 2 * 60 * 1000,
  });

  const user = data?.user || null;
  const lessons = data?.lessons || [];
  const progress = data?.progress || [];

  const nextLesson = data?.statistics?.nextLesson || (lessons.length > 0 ? lessons[0] : null);
  const completedCount = data?.statistics?.completedCount ?? progress.filter(p => p.isCompleted).length;
  const progressPercentage = data?.statistics?.progressPercentage ?? (lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0);
  const totalLessons = data?.statistics?.totalLessons ?? lessons.length;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="relative min-h-screen bg-white">
      {/* Tamil Watermark Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
        <div className="fixed top-1/4 right-1/4 opacity-[0.03] font-black text-[30rem] text-primary select-none leading-none pointer-events-none rotate-12">
          அ
        </div>
      </div>

      <div className="relative z-10 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-8 lg:py-12 px-2 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center p-2 border border-primary/10">
             <Trophy className="text-primary w-5 h-5" />
          </div>
          <span className="text-[10px] font-black text-primary tracking-widest uppercase">Student Hub</span>
        </div>
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 tracking-tight leading-tight">
            Vanakkam, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-lg text-gray-500 font-medium leading-relaxed mt-4">
            Continuing your journey into the world's oldest living classical language. Here's your current progress and curriculum milestones.
          </p>
        </div>
      </div>

      {isError && (
        <Card variant="outline" className="border-red-100 bg-red-50/30 flex items-center gap-4 text-red-600">
           <AlertCircle className="shrink-0 w-6 h-6" />
           <p className="font-bold tracking-tight">{(queryError as any)?.message || "Could not load dashboard data."}</p>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Points Earned"
          value={user?.points || user?.xp || 0}
          description="Total learning points"
          icon={Star}
        />
        <StatCard
          title="Powers"
          value={`${user?.power ?? 30}/30`}
          description="Daily energy"
          icon={Zap}
        />
        <StatCard
          title="Current Level"
          value={user?.level || "Beginner"}
          description="Learning stage"
          icon={Trophy}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          description={`${progressPercentage}% Path done`}
          icon={BookOpen}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mt-8">
         <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-black uppercase tracking-widest text-primary">Path Progress</span>
            <span className="text-sm font-bold text-gray-500">{progressPercentage}%</span>
         </div>
         <div className="h-4 bg-gray-100 rounded-full overflow-hidden w-full">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
         </div>
      </div>

      {/* Section: Learning Roadmap */}
      <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <h3 className="text-2xl font-black text-gray-800 tracking-tight">Active Learning Path</h3>
            <Button href="/student/lessons" variant="ghost" size="sm" className="text-primary uppercase tracking-widest text-[10px] font-black">
              Full Curriculum <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
          </div>

          {nextLesson ? (
            <Card variant="elevated" padding="lg" className="group relative overflow-hidden bg-primary shadow-2xl shadow-primary/20">
              {/* Decorative Background */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute top-1/2 left-0 opacity-[0.02] font-black text-[15rem] text-white select-none pointer-events-none -translate-x-1/4 -translate-y-1/2">
                 க
              </div>

              <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 space-y-6 text-white text-center md:text-left">
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">
                      <Clock className="w-3.5 h-3.5" /> Resume Activity
                    </span>
                    <h4 className="text-3xl lg:text-4xl font-black tracking-tight drop-shadow-sm leading-tight">
                      {nextLesson.title}
                    </h4>
                    <p className="text-lg text-white/70 font-medium leading-relaxed line-clamp-2 italic">
                      "{nextLesson.description || "Continue where you left off in the foundational modules."}"
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                    <Button
                      href={`/student/lessons/${nextLesson._id}`}
                      className="bg-white text-primary hover:bg-white/90 border-none h-14 px-10 rounded-2xl shadow-xl shadow-black/10 w-full sm:w-auto"
                    >
                       Start Lesson <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded-full px-4 py-3">
                       <span className="">Level: {user?.level || "Beginner"}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex shrink-0 w-48 h-48 rounded-2xl bg-white/5 items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                   <BookMarked className="w-20 h-20 text-white/50" />
                </div>
              </div>
            </Card>
          ) : (
            <Card variant="outline" padding="xl" className="flex flex-col items-center justify-center text-center border-dashed bg-gray-50/50">
              <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl mb-6">📚</div>
              <p className="text-xl font-black text-gray-800 uppercase tracking-widest">Awaiting Knowledge</p>
              <p className="text-gray-500 font-medium my-4 max-w-sm">You haven't begun any modules yet. Embark on your linguistic journey today.</p>
              <Button href="/student/lessons" variant="primary" size="lg" className="rounded-2xl shadow-xl shadow-primary/20 mt-4">Explore the Curriculum <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
