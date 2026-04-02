"use client";

import React, { useEffect } from "react";
import { CheckCircle2, ArrowRight, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate dashboard query to fetch new plan status
    queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] });
  }, [queryClient]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-6 text-center animate-in zoom-in-95 duration-700">
      <div className="mb-8 p-6 bg-emerald-50 rounded-full shadow-2xl shadow-emerald-500/10 scale-110">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in spin-in-12" />
      </div>
      
      <div className="space-y-4 mb-12">
        <h1 className="text-4xl md:text-4xl font-black text-slate-800 tracking-tight">Access Unlocked!</h1>
        <p className="text-xl text-primary/70 font-medium max-w-xl mx-auto">
          Welcome to your new membership. Your subscription has been activated successfully.
        </p>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl max-w-md w-full mb-12 flex items-center justify-center gap-6">
           <div className="p-4 bg-primary/5 rounded-2xl">
             <Award className="w-10 h-10 text-primary" />
           </div>
           <div className="text-left">
             <p className="font-black text-slate-800 uppercase tracking-widest text-xs">New Achievement</p>
             <p className="text-lg font-bold text-primary">Pathfinder Subscriber</p>
           </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Button
          onClick={() => router.push("/student/lessons")}
          className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
        >
          Explore Lessons <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/student/dashboard")}
          className="h-14 px-10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 bg-white"
        >
          View Dashboard
        </Button>
      </div>
    </div>
  );
}
















