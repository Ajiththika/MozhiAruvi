"use client";

import React, { useState } from "react";
import { Check, Star, Zap, ShieldCheck, Users, Sparkles, Loader2, Crown } from "lucide-react";
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

const PLANS = [
  {
    id: 'FREE',
    name: 'Basic Learner',
    tagline: 'Start your Tamil journey.',
    priceMonthly: 0,
    priceYearly: 0,
    color: 'border-slate-200 text-slate-500',
    icon: <Zap className="w-6 h-6 text-slate-400" />,
    buttonText: 'Current Plan',
    disabled: true
  },
  {
    id: 'PRO',
    name: 'Pro Explorer',
    tagline: 'Deeper dive into classics.',
    priceMonthly: 3.81,
    priceYearly: 42,
    color: 'border-primary/40 text-primary',
    icon: <ShieldCheck className="w-6 h-6 text-primary" />,
    buttonText: 'Upgrade',
    disabled: false
  },
  {
    id: 'PREMIUM',
    name: 'Fluent Premium',
    tagline: 'Mastery without limits.',
    priceMonthly: 7.94,
    priceYearly: 90,
    color: 'border-amber-400/50 text-amber-600',
    icon: <Crown className="w-6 h-6 text-amber-500 fill-current" />,
    buttonText: 'Upgrade',
    highlight: true,
    disabled: false
  },
  {
    id: 'BUSINESS',
    name: 'Business Team',
    tagline: 'Empower your organization.',
    priceMonthly: 85.50,
    priceYearly: 855,
    color: 'border-indigo-400/50 text-indigo-600',
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    buttonText: 'Upgrade',
    disabled: false
  }
];

export default function StudentPremiumPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: userStats } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: getDashboardData,
  });

  const currentPlan = userStats?.user?.subscription?.plan || 'FREE';

  const handleUpgrade = async (planId: 'PRO' | 'PREMIUM' | 'BUSINESS') => {
    try {
      setLoadingPlan(planId);
      const { url } = await createSubscriptionSession(planId, billingCycle, planId === 'BUSINESS' ? 30 : undefined);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-6 duration-1000 py-20 px-8">
      {/* Header section with refined typography */}
      <div className="text-center space-y-8 mb-24">
         <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-8 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-primary shadow-2xl shadow-primary/10">
            <Sparkles className="h-4 w-4 animate-pulse" /> Precision Learning
         </div>
         <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter leading-[1.1] max-w-4xl mx-auto">
            Choose Your <span className="text-primary relative inline-block">
               Legacy
               <div className="absolute -bottom-2 left-0 w-full h-1 bg-primary/20 rounded-full" />
            </span>.
         </h1>
         <p className="mx-auto mt-6 max-w-2xl text-xl text-text-secondary font-medium leading-relaxed italic opacity-80">
            Select a plan that matches your ambition. Unlock ancient wisdom with modern tools.
         </p>

         {/* Billing Toggle */}
         <div className="flex items-center justify-center gap-6 pt-10">
            <span className={cn("text-xs font-black uppercase tracking-widest transition-colors", billingCycle === 'monthly' ? "text-text-primary" : "text-text-tertiary")}>Monthly</span>
            <button 
               onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
               className="w-16 h-9 bg-surface-soft border border-border/50 rounded-full p-1.5 transition-all hover:border-primary/40 relative group"
            >
               <div className={cn(
                  "h-5 w-5 bg-primary rounded-full shadow-lg shadow-primary/30 transition-all duration-500",
                  billingCycle === 'yearly' ? "translate-x-7" : "translate-x-0"
               )} />
            </button>
            <span className={cn("text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2", billingCycle === 'yearly' ? "text-text-primary" : "text-text-tertiary")}>
               Yearly <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] rounded-full">Save ~15%</span>
            </span>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
         {PLANS.map((plan) => {
            const isActive = currentPlan === plan.id;
            const price = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

            return (
               <Card 
                  key={plan.id}
                  variant={plan.highlight ? 'elevated' : 'outline'}
                  className={cn(
                     "relative flex flex-col p-8 rounded-[2.5rem] border-2 transition-all duration-500",
                     plan.color,
                     plan.highlight ? "shadow-[0_40px_80px_-15px_rgba(245,158,11,0.15)] ring-4 ring-amber-400/5 -translate-y-4" : "hover:border-primary/30 hover:-translate-y-2"
                  )}
               >
                  {plan.highlight && (
                     <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl shadow-amber-500/30">
                        Most Popular
                     </div>
                  )}

                  <div className="mb-10 text-center">
                     <div className={cn("mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-surface-soft border border-border/20 shadow-sm")}>
                        {plan.icon}
                     </div>
                     <h3 className="text-2xl font-black tracking-tight text-text-primary uppercase mb-2">{plan.name}</h3>
                     <p className="text-xs font-bold text-text-tertiary italic">{plan.tagline}</p>
                  </div>

                  <div className="mb-10 text-center">
                     <div className="flex items-center justify-center gap-1">
                        <span className="text-xs font-black text-text-tertiary uppercase align-top mt-2">$</span>
                        <span className="text-5xl font-black text-text-primary tracking-tighter">{price}</span>
                     </div>
                     <p className="text-[10px] font-black text-text-tertiary uppercase mt-2 tracking-widest opacity-60">
                        Per {billingCycle === 'monthly' ? 'month' : 'year'}
                     </p>
                  </div>

                  <div className="h-px w-full bg-border/40 mb-10" />

                  <ul className="space-y-5 mb-10 flex-1">
                     {FEATURES.map((feat) => {
                        const hasAccess = feat[plan.id.toLowerCase() as keyof typeof feat];
                        if (hasAccess === false) return null;
                        
                        return (
                           <li key={feat.name} className="flex items-start gap-4 group/item">
                              <div className="mt-1 h-4 w-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                                 <Check className="h-2.5 w-2.5 stroke-[4]" />
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-black text-text-primary uppercase tracking-tight">{feat.name}</span>
                                 {typeof hasAccess === 'string' && (
                                    <span className="text-[10px] font-bold text-primary">{hasAccess}</span>
                                 )}
                              </div>
                           </li>
                        );
                     })}
                  </ul>

                  <div className="mt-auto">
                     <Button 
                        variant={isActive ? 'ghost' : (plan.highlight ? 'primary' : 'outline')}
                        className={cn(
                           "w-full py-7 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                           isActive ? "bg-border/20 text-text-tertiary border-none cursor-default" : (plan.highlight ? "shadow-2xl shadow-amber-500/20" : "")
                        )}
                        disabled={isActive || plan.disabled || !!loadingPlan}
                        onClick={() => handleUpgrade(plan.id as any)}
                     >
                        {loadingPlan === plan.id ? (
                           <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                           isActive ? "Current Tier" : "Upgrade Plan"
                        )}
                     </Button>
                  </div>
               </Card>
            );
         })}
      </div>

      {/* Comparison table or extra features can go here if needed, but keeping it clean for now */}
      <div className="mt-32 p-10 bg-surface-soft rounded-[3rem] border border-border/40 text-center max-w-4xl mx-auto overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
         <h4 className="text-xl font-black text-text-primary tracking-tight mb-4">Enterprise & Institutional</h4>
         <p className="text-sm text-text-secondary font-medium leading-relaxed max-w-xl mx-auto italic mb-8">
            Looking for more than 60 seats? We provide custom solutions for universities and classic language centers globally.
         </p>
         <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-10">
            Contact Sales Support
         </Button>
      </div>
    </div>
  );
}
