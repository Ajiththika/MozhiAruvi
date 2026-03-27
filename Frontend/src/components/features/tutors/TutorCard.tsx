import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe, Video, Clock, Layers, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tutor } from "@/services/tutorService";

const levelColors: Record<string, string> = {
  beginner:     "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  intermediate: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  advanced:     "bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
};

const modeLabel: Record<string, string> = {
  online: "Online", offline: "In-Person", both: "Hybrid",
};

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function TutorCard({ tutor }: { tutor: Tutor }) {
  const { user } = useAuth();
  const router = useRouter();

  const { _id, name, profilePhoto, bio, specialization, experience,
          languages, teachingMode, levelSupport, responseTime, hourlyRate, isTutorAvailable } = tutor;

  const handleExploreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      const currentPath = window.location.pathname;
      router.push(`/auth/signin?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    router.push(`/tutors/${_id}`);
  };

  return (
    <div 
      onClick={handleExploreClick}
      className="group relative flex flex-col rounded-[2.5rem] bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/20 overflow-hidden cursor-pointer"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 h-32 w-32 bg-soft/10 rounded-full -mr-16 -mt-16 group-hover:bg-soft/20 transition-all duration-700" />

      <div className="flex items-start gap-5 p-7 pb-4">
        {/* Avatar Section */}
        <div className="relative shrink-0">
          <div className="relative h-20 w-20 p-1 rounded-3xl bg-gray-50 dark:bg-gray-800 ring-1 ring-slate-200 dark:ring-slate-700 shadow-inner group-hover:ring-primary/30 transition-all">
            <div className="h-full w-full rounded-2xl overflow-hidden bg-white">
               {profilePhoto ? (
                 <div className="relative h-full w-full">
                    <Image 
                       src={profilePhoto} 
                       alt={name} 
                       fill
                       className="object-cover transition-transform group-hover:scale-110 duration-500" 
                       sizes="80px"
                    />
                 </div>
               ) : (
                 <div className="h-full w-full flex items-center justify-center bg-primary/5">
                    <span className="text-3xl font-bold text-primary">
                       {name.charAt(0)}
                    </span>
                 </div>
               )}
            </div>
          </div>
          {/* Status Indicator */}
          <div className={cn(
            "absolute -bottom-1 -right-1 flex items-center gap-1 z-10 px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm text-[8px] font-black uppercase tracking-tight transition-all",
            isTutorAvailable ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
          )}>
            {isTutorAvailable ? "Online" : "Away"}
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-gray-800 leading-tight transition-colors group-hover:text-primary">
                  {name}
                </h3>
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              </div>
              <p className="text-xs font-bold text-primary/80 tracking-tight">
                {specialization ?? "Tamil Language Expert"}
              </p>
              <div className="flex items-center gap-2 pt-1">
                 <div className="flex items-center text-amber-400">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                 </div>
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified</span>
              </div>
            </div>
            {hourlyRate && (
              <div className="text-right shrink-0">
                <div className="flex flex-col items-end">
                   <span className="text-lg font-black text-gray-800 leading-none">{hourlyRate}</span>
                   <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">XP / Sess.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio / Summary */}
      <div className="px-7 flex-1">
        {bio && (
          <p className="text-[13px] font-medium text-gray-600 line-clamp-2 leading-relaxed h-[40px]">
            {bio}
          </p>
        )}
      </div>

      {/* Meta Specs */}
      <div className="mt-4 px-7 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
           {levelSupport?.map(level => (
            <span key={level} className={cn("rounded-lg px-2.5 py-1 text-[10px] font-bold capitalize border", levelColors[level])}>
              {level}
            </span>
          ))}
          {teachingMode && (
            <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700 border border-sky-100 flex items-center gap-1.5">
              {teachingMode === "online" ? <Video className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
              {modeLabel[teachingMode]}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100 /60">
           <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-soft flex items-center justify-center shrink-0">
                 <Globe className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="min-w-0">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Speaks</p>
                 <p className="text-[10px] font-bold text-gray-700 truncate">{languages?.join(", ") || "Tamil, English"}</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-soft flex items-center justify-center shrink-0">
                 <Clock className="h-3.5 w-3.5 text-secondary" />
              </div>
              <div className="min-w-0">
                 <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Response</p>
                 <p className="text-[10px] font-bold text-gray-700 truncate">~{responseTime || "24 hrs"}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="p-7 pt-0">
          {!user && (
            <p className="text-[10px] text-center font-bold text-primary italic mb-4 animate-pulse">
               Sign in to connect with this teacher
            </p>
          )}
          <div className="group/btn relative flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-secondary active:scale-95 overflow-hidden">
            <span className="relative z-10 transition-all group-hover/btn:translate-x-[-4px]">Explore Profile</span>
            <ArrowRight className="relative z-10 h-3 w-3 transition-all group-hover/btn:translate-x-4 opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
          </div>
      </div>
    </div>
  );
}

