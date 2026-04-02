"use client";

import React, { useEffect, useState } from "react";
import { Award, Flame, Target, Trophy, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import StatCard from "@/components/features/dashboard/StatCard";
import { useAuth } from "@/context/AuthContext";
import { getLessons, Lesson, Progress } from "@/services/lessonService";

export default function StudentProgressPage() {
   const { user } = useAuth();
   const [lessons, setLessons] = useState<Lesson[]>([]);
   const [progress, setProgress] = useState<Progress[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
     getLessons()
       .then(res => {
         setLessons(res.lessons);
         setProgress(res.progress);
       })
       .catch(() => setError("Could not load progress data."))
       .finally(() => setLoading(false));
   }, []);

   if (loading) {
     return (
       <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
         <Loader2 className="h-10 w-10 animate-spin text-primary" />
         <p className="text-sm font-semibold text-primary/70 tracking-tight animate-pulse">Calculating your achievements...</p>
       </div>
     );
   }

   const completedLessons = progress.filter(p => p.isCompleted);
   const completedCount = completedLessons.length;
   const totalLessons = lessons.length;
   const progressPercentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
   
   // Average accuracy from completed lessons
   const totalScore = completedLessons.reduce((sum, p) => sum + p.score, 0);
   const avgAccuracy = completedCount > 0 ? Math.round(totalScore / completedLessons.length) : 0;

   // Vocabulary estimate: 10 words per completed lesson
   const vocabCount = completedCount * 10;

   return (
      <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500 pb-12">
         <div className="py-6">
            <h1 className="text-3xl md:text-4xl lg:text-4xl font-black text-primary tracking-tight uppercase">
               Learning Progress
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-700 font-semibold leading-relaxed">
               Visualize your Tamil learning journey and track your real-time academic milestones.
            </p>
         </div>

         {error && (
           <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm text-red-600 font-bold">
             <AlertCircle className="h-5 w-5 shrink-0" /> {error}
           </div>
         )}

         {/* Top Metrics Row */}
         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
             <StatCard 
                title="Daily Streak" 
                value={`${user?.progress?.currentStreak || 0} Days`} 
                description={`Personal Best: ${user?.progress?.highStreak || 0} days`} 
                icon={Flame} 
                trend={(user?.progress?.currentStreak || 0) > 0 ? "up" : "neutral"}
                trendValue={(user?.progress?.currentStreak || 0) > 0 ? "Active" : "New"}
                className="border-primary/10 bg-primary/5" 
             />
             <StatCard 
                title="Average Accuracy" 
                value={`${avgAccuracy}%`} 
                description="Based on your quiz performance" 
                icon={Target} 
                trend={avgAccuracy > 80 ? "up" : "neutral"}
                trendValue={avgAccuracy > 0 ? "Real" : "No starts"} 
             />
             <StatCard 
                title="Vocabulary" 
                value={String(vocabCount)} 
                description="Estimated words learned" 
                icon={TrendingUp} 
             />
             <StatCard 
                title="Course Completion" 
                value={`${progressPercentage}%`} 
                description={`${completedCount} of ${totalLessons} finished`} 
                icon={Award} 
                trend={progressPercentage > 0 ? "up" : "neutral"}
             />
         </div>

         {/* Learning History Preview */}
         <div className="rounded-3xl border border-slate-100 bg-white p-8 md:p-10 shadow-2xl shadow-slate-200/50">
             <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                   <TrendingUp className="h-6 w-6 text-primary" />
                   Your Journey Statistics
                </h3>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-600">
                   Real-time Data Sync
                </div>
             </div>
            
             <div className="mt-10 flex flex-col items-center justify-center py-10 text-center space-y-6">
                <div className="relative h-44 w-44 flex items-center justify-center">
                   <svg className="h-full w-full transform -rotate-90">
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-50" />
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="14" fill="transparent" strokeDasharray={502.6} strokeDashoffset={502.6 - (502.6 * progressPercentage) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000 shadow-sm" />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-primary">{progressPercentage}%</span>
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight mt-1">Learned</span>
                   </div>
                </div>
                <p className="text-base text-slate-600 font-semibold max-w-xs leading-relaxed">
                   You have mastered {completedCount} lessons so far. Keep going to unlock more rewards!
                </p>
             </div>
         </div>

       </div>
    );
}
















