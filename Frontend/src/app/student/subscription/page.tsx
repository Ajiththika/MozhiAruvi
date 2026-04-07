"use client";

import React, { useState } from "react";
import { Check, Star, Zap, ShieldCheck, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createSubscriptionSession } from "@/services/paymentService";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/authService";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '3 Experience levels',
      '1 Category per level',
      'Read Blog posts',
      '10 Ask-a-Tutor Questions',
      'Restricted Premium events'
    ],
    color: 'border-slate-200',
    icon: <Zap className="w-5 h-5 text-primary/60" />,
    buttonText: 'Current Plan',
    disabled: true
  },
  {
    id: 'PRO',
    name: 'Pro',
    priceMonthly: 3.81,
    priceYearly: 42,
    trialPeriod: 7,
    features: [
      'Up to 10 Categories',
      'Full Lessons Access',
      '50 Ask-a-Tutor Questions/mo',
      'Community Forum Access'
    ],
    color: 'border-primary/40 text-primary',
    icon: <ShieldCheck className="w-5 h-5 text-primary" />,
    buttonText: 'Upgrade to Pro',
    disabled: false
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    priceMonthly: 7.94,
    priceYearly: 90,
    trialPeriod: 7,
    features: [
      'Unlimited Categories',
      'Full Lessons Access',
      '100 Ask-a-Tutor Questions/mo',
      'VIP Platform Support'
    ],
    color: 'border-amber-400/50 text-amber-600',
    icon: <Star className="w-5 h-5 text-amber-500 fill-current" />,
    buttonText: 'Go Premium',
    highlight: true,
    disabled: false
  }
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: userStats } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: getDashboardData,
  });

  const currentPlan = userStats?.user?.subscription?.plan || 'FREE';

  const handleSubscribe = async (planId: 'PRO' | 'PREMIUM') => {
    try {
      setLoadingPlan(planId);
      const { url } = await createSubscriptionSession(planId, billingCycle);
      window.location.href = url;
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to initiate checkout. Please check configuration.";
      alert(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-4xl md:text-4xl font-black text-slate-800 tracking-tight leading-tight">Empower Your Learning Journey</h1>
        <p className="text-lg text-primary/70 max-w-2xl mx-auto font-medium">From individual growth to team mastery, choose the path that unlocks full potential.</p>
        
        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 pt-6">
          <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-primary' : 'text-primary/60'}`}>Monthly</span>
          <button 
            onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-slate-100 rounded-full p-1 transition-colors relative"
          >
            <div className={`h-6 w-6 bg-primary rounded-full shadow-md transition-all ${billingCycle === 'yearly' ? 'translate-x-[24px]' : ''}`} />
          </button>
          <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-primary' : 'text-primary/60'}`}>
            Yearly <span className="text-emerald-500 font-extrabold text-[10px] uppercase ml-1">Save 15%</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          const displayPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          const isTrialEligible = !userStats?.user?.hasUsedTrial;
          const hasTrial = plan.trialPeriod && isTrialEligible;

          return (
            <Card 
              key={plan.id}
              variant={plan.highlight ? 'elevated' : 'outline'}
              className={`relative overflow-hidden flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${plan.color} ${plan.highlight ? 'shadow-2xl shadow-primary/10 -translate-y-2' : 'hover:scale-[1.02]'}`}
            >
              {(hasTrial || plan.highlight || isActive) && (
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  {isActive && (
                    <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg shadow-emerald-500/30">Active Plan</span>
                  )}
                  {plan.highlight && !isActive && (
                    <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg shadow-amber-500/20">Popular</span>
                  )}
                  {hasTrial && !isActive && (
                    <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg shadow-emerald-500/20 animate-pulse">7 Days Trial</span>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-2 rounded-xl", isActive ? "bg-emerald-50" : "bg-slate-50")}>{plan.icon}</div>
                  <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className={cn("text-3xl font-black", isActive ? "text-emerald-600" : "text-primary")}>${displayPrice}</span>
                    <span className="text-primary/60 font-bold text-[10px]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[4]" />
                    </div>
                    <span className="text-slate-600 font-medium text-[11px] leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                {hasTrial && !isActive && (
                  <p className="text-[9px] font-bold text-emerald-600 text-center mb-2 uppercase tracking-tight">
                    Start today for $0.00 — Charge after 7 days automatically
                  </p>
                )}
                <Button
                  variant={isActive ? 'ghost' : (plan.highlight ? 'primary' : 'outline')}
                  className={cn(
                    "w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    isActive ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100" : (plan.highlight ? "shadow-lg shadow-primary/20" : "")
                  )}
                  disabled={isActive || plan.disabled || !!loadingPlan}
                  onClick={() => handleSubscribe(plan.id as any)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    isActive ? 'Current Plan' : (hasTrial ? 'Start 7 Days Free Trial' : plan.buttonText)
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
















