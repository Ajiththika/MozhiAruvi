"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";

import { Suspense } from "react";

function RoleSelectionContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleSelectStudent = () => {
    // If they were trying to go somewhere, go there
    router.push(redirect || "/student/dashboard");
  };

  const handleSelectTutor = () => {
    router.push("/tutor/apply");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tight uppercase leading-tight mb-4">
            How would you like <br /> to use Mozhi Aruvi?
          </h1>
          <p className="text-slate-500 font-medium text-lg">Choose your journey and start exploring the heritage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Role */}
          <button
            onClick={handleSelectStudent}
            className="group relative flex flex-col items-center p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center overflow-hidden"
          >
            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Join as Student</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Learn Tamil through interactive lessons, practice with natives, and explore cultural heritage.
            </p>
            <div className="mt-auto flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                Start Learning <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Decoration */}
            <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />
          </button>

          {/* Tutor Role */}
          <button
            onClick={handleSelectTutor}
            className="group relative flex flex-col items-center p-10 bg-white border border-slate-100 rounded-[3rem] shadow-xl shadow-slate-200/50 hover:border-secondary/30 hover:shadow-2xl hover:shadow-secondary/5 transition-all text-center overflow-hidden"
          >
            <div className="h-24 w-24 bg-secondary/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <GraduationCap className="h-10 w-10 text-secondary" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Apply as Tutor</h3>
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Share your knowledge, mentor students, and earn by teaching what you love about Tamil.
            </p>
            <div className="mt-auto flex items-center gap-2 text-secondary font-black uppercase text-xs tracking-widest">
                Join Faculty <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
            {/* Decoration */}
            <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-secondary/5 rounded-full blur-3xl" />
          </button>
        </div>

        <div className="mt-12 text-center">
            <p className="text-xs font-black text-primary/40 uppercase tracking-widest">You can always change your preference in settings later.</p>
        </div>
      </div>
    </div>
  );
}

export default function RoleSelectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <RoleSelectionContent />
    </Suspense>
  );
}
