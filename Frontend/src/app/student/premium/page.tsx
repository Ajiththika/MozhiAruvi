"use client";

import React, { useState } from "react";
import { Check, Star, Zap, ShieldCheck, Users, Sparkles, Loader2, Crown, ArrowRight, Activity, Building, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { createSubscriptionSession } from "@/services/paymentService";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/authService";

const FEATURES = [
  { name: "Full Curriculum Access", free: true, pro: true, premium: true, business: true },
  { name: "First Category per Level", free: true, pro: true, premium: true, business: true },
  { name: "Read Blog Posts", free: true, pro: true, premium: true, business: true },
  { name: "Full Lessons Access", free: false, pro: true, premium: true, business: true },
  { name: "Up to 10 Categories", free: false, pro: true, premium: true, business: true },
  { name: "Unlimited Categories", free: false, pro: false, premium: true, business: true },
  { name: "Tutor Support Days", free: "0", pro: "2/mo", premium: "8/mo", business: "8/mo" },
  { name: "Free Premium Events", free: "0", pro: "1/mo", premium: "5/mo", business: "5/mo" },
  { name: "Team Invitations", free: false, pro: false, premium: false, business: true },
];

export default function StudentPremiumPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<'pro' | 'premium'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: userStats } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: getDashboardData,
  });

  const currentPlan = userStats?.user?.subscription?.plan || 'FREE';

  const handleUpgrade = (planId: 'PRO' | 'PREMIUM' | 'BUSINESS', seats?: number) => {
    // We navigate to our custom checkout page first to give a premium confirm experience
    // like the user requested. The checkout page then handles the Stripe redirect.
    router.push(`/student/checkout?plan=${planId}&cycle=${billingCycle}&seats=${seats || 0}`);
  };

  const isMonthly = billingCycle === 'monthly';

  return (
    <div className="relative min-h-screen bg-white">
      {/* Dynamic Background Watermark */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/2" />
        <div className="fixed top-1/2 right-0 opacity-[0.02] font-black text-[40rem] text-primary rotate-12 leading-none">
           க
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-32 space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Step 1: Branding and High-Impact Hero */}
        <div className="text-center space-y-6">
           <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary shadow-lg shadow-primary/10">
              <Sparkles className="h-4 w-4 animate-pulse" /> Language Excellence
           </div>
           <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Unlock Your <span className="text-primary">Linguistic Potential</span>.
           </h1>
           <p className="mx-auto max-w-2xl text-base md:text-lg text-slate-700 font-semibold leading-relaxed">
              Choose the path that fits your learning journey. From personal mastery to institutional excellence.
           </p>

           {/* Step 2: Main Tier Selector (The Separation) */}
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12">
              <button
                onClick={() => setSelectedTier('pro')}
                className={cn(
                  "group relative flex items-center gap-4 px-10 py-5 rounded-2xl border-2 transition-all duration-300 w-full sm:w-auto",
                  selectedTier === 'pro' 
                    ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30" 
                    : "bg-white text-slate-700 border-slate-100 hover:border-primary/40 hover:bg-slate-50"
                )}
              >
                 <ShieldCheck className={cn("h-6 w-6", selectedTier === 'pro' ? "text-white" : "text-primary")} />
                 <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Tier One</p>
                    <p className="text-lg font-black tracking-tight">Pro Discovery</p>
                 </div>
                 {selectedTier === 'pro' && <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg"><Check className="w-3 h-3 stroke-[4]" /></div>}
              </button>

              <button
                onClick={() => setSelectedTier('premium')}
                className={cn(
                  "group relative flex items-center gap-4 px-10 py-5 rounded-2xl border-2 transition-all duration-300 w-full sm:w-auto",
                  selectedTier === 'premium' 
                    ? "bg-slate-900 text-white border-slate-900 shadow-2xl shadow-slate-900/30" 
                    : "bg-white text-slate-700 border-slate-100 hover:border-slate-900/40 hover:bg-slate-50"
                )}
              >
                 <Crown className={cn("h-6 w-6", selectedTier === 'premium' ? "text-amber-500 fill-current" : "text-amber-500")} />
                 <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest">Tier Two</p>
                    <p className="text-lg font-black tracking-tight">Premium Mastery</p>
                 </div>
                 {selectedTier === 'premium' && <div className="absolute -top-3 -right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg"><Check className="w-3 h-3 stroke-[4]" /></div>}
              </button>
           </div>

           {/* Step 3: Billing Toggle */}
           <div className="flex items-center justify-center gap-8 pt-8">
              <span className={cn("text-xs font-bold uppercase tracking-widest transition-opacity", !isMonthly ? "opacity-30" : "opacity-100 text-slate-900")}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-16 h-9 bg-slate-100 rounded-full p-1.5 transition-all hover:bg-slate-200 relative shadow-inner"
              >
                 <div className={cn(
                   "h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 border border-slate-200",
                   !isMonthly ? "translate-x-7" : "translate-x-0"
                 )} />
              </button>
              <div className="flex items-center gap-3">
                 <span className={cn("text-xs font-bold uppercase tracking-widest transition-opacity", isMonthly ? "opacity-30" : "opacity-100 text-slate-900")}>Yearly</span>
                 <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce">SAVE 15%</span>
              </div>
           </div>
        </div>

        {/* Step 4: The Pricing Cards (Personal & Business Separation) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto items-stretch">
          
          {/* PERSONAL CARD */}
          <Card 
            variant="elevated" 
            className="group relative flex flex-col p-10 rounded-[2.5rem] border-2 border-slate-100 bg-white transition-all duration-500 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Briefcase className="w-32 h-32" />
             </div>
             <div className="mb-12">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary shadow-inner">
                   {selectedTier === 'pro' ? <Zap className="w-7 h-7 fill-current" /> : <Sparkles className="w-7 h-7 fill-current" />}
                </div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Individual {selectedTier === 'pro' ? "Explorer" : "Scholar"}</h4>
                <p className="text-sm font-bold text-slate-600 mt-2 uppercase tracking-widest">Personal Journey</p>
             </div>

             <div className="mb-12">
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-bold text-slate-500">$</span>
                   <span className="text-6xl font-black text-slate-900 tracking-tighter">
                      {selectedTier === 'pro' ? (isMonthly ? "3.81" : "42") : (isMonthly ? "7.94" : "90")}
                   </span>
                   <span className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">/ {isMonthly ? "mo" : "yr"}</span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-2">Billed {isMonthly ? "monthly" : "annually"}. Cancel anytime.</p>
             </div>

             <div className="space-y-6 mb-12 flex-1">
                {FEATURES.slice(0, selectedTier === 'pro' ? 7 : 8).map((feat) => (
                   <div key={feat.name} className="flex gap-4">
                      <div className="h-5 w-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                         <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-bold text-slate-900 tracking-tight">{feat.name}</span>
                         {typeof feat[selectedTier] === 'string' && <span className="text-[10px] font-bold text-primary uppercase">{feat[selectedTier]}</span>}
                      </div>
                   </div>
                ))}
             </div>

             <div className="mt-auto">
               <Button 
                 onClick={() => handleUpgrade(selectedTier.toUpperCase() as any)}
                 className={cn(
                   "w-full py-7 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-2xl transition-all",
                   selectedTier === 'pro' ? "bg-primary shadow-primary/25" : "bg-slate-900 shadow-slate-900/25"
                 )}
                 disabled={currentPlan === selectedTier.toUpperCase() || !!loadingPlan}
               >
                  {loadingPlan === selectedTier.toUpperCase() ? <Loader2 className="animate-spin" /> : (currentPlan === selectedTier.toUpperCase() ? "Current Plan" : "Empower Myself")}
               </Button>
             </div>
          </Card>

          {/* BUSINESS / BUNDLE CARD */}
          <Card 
            variant="elevated" 
            className="group relative flex flex-col p-10 rounded-[2.5rem] border-2 border-indigo-100 bg-slate-50 transition-all duration-500 hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-900/15 overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 text-indigo-600">
                <Building className="w-32 h-32" />
             </div>
             <div className="absolute -top-4 -right-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3 rounded-bl-3xl shadow-xl animate-pulse">
                Bundle Efficiency
             </div>

             <div className="mb-12">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-6 text-white shadow-xl shadow-indigo-600/30">
                   <Users className="w-7 h-7" />
                </div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Institutional {selectedTier === 'pro' ? "Plus" : "Elite"}</h4>
                <p className="text-sm font-bold text-indigo-600 mt-2 uppercase tracking-widest">Teams & Classes (30 Students)</p>
             </div>

             <div className="mb-12">
                <div className="flex items-baseline gap-1">
                   <span className="text-xl font-bold text-slate-500">$</span>
                   <span className="text-6xl font-black text-indigo-600 tracking-tighter">
                      {selectedTier === 'pro' ? (isMonthly ? "85.50" : "855") : (isMonthly ? "170" : "1700")}
                   </span>
                   <span className="text-xs font-bold text-slate-500 uppercase ml-2 tracking-widest">/ {isMonthly ? "mo" : "yr"}</span>
                </div>
                <p className="text-xs font-bold text-slate-600 mt-2">Perfect for language schools and community centers.</p>
             </div>

             <div className="space-y-6 mb-12 flex-1">
                <div className="flex gap-4">
                   <div className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="h-3 w-3 stroke-[3]" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 tracking-tight">30 Student Licenses Managed</span>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase">Universal Shared Access</span>
                   </div>
                </div>
                {FEATURES.slice(0, 8).map((feat) => (
                   <div key={feat.name} className="flex gap-4">
                      <div className="h-5 w-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                         <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 tracking-tight">{feat.name}</span>
                   </div>
                ))}
             </div>

             <div className="mt-auto">
               <Button 
                onClick={() => handleUpgrade('BUSINESS', selectedTier === 'pro' ? 30 : 60)}
                className="w-full py-7 rounded-2xl text-xs font-bold uppercase tracking-widest bg-indigo-600 shadow-2xl shadow-indigo-600/30 text-white border-none"
                disabled={!!loadingPlan}
               >
                  {loadingPlan === 'BUSINESS' ? <Loader2 className="animate-spin" /> : "Deploy for My Team"}
               </Button>
             </div>
          </Card>
        </div>

        {/* Comparison Table Link */}
        <div className="mt-12 text-center">
           <p className="text-slate-600 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" /> All plans include full mobile app access and daily backups.
           </p>
        </div>
      </div>
    </div>
  );
}




