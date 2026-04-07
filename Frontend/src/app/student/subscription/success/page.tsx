"use client";

import React, { useEffect } from "react";
import { CheckCircle2, ArrowRight, Award } from "lucide-react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { verifySubscriptionSession } from "@/services/paymentService";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { authStore } from "@/lib/authStore";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = React.useState(!!sessionId);

  useEffect(() => {
    if (sessionId) {
      verifySubscriptionSession(sessionId)
        .then((res) => {
           // Proactively refresh the local session token to prevent logout if old one expired while on Stripe
           if (res.accessToken) authStore.set(res.accessToken);
           // Update global user state with new plan data
           if (res.user) setUser(res.user);
           
           queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] });
           setVerifying(false);
        })
        .catch(() => {
           setVerifying(false);
        });
    } else {
       queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] });
    }
  }, [sessionId, queryClient, setUser]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
         <Loader2 className="w-20 h-20 text-primary animate-spin" />
         <h1 className="text-3xl font-black text-slate-800 tracking-tight">Syncing Membership...</h1>
         <p className="text-lg text-primary/70 font-medium">Finalizing your access with Stripe.</p>
      </div>
    );
  }

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
















