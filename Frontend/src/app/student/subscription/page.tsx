"use client";

import React, { useState } from "react";
import { Check, Star, Zap, ShieldCheck, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { createSubscriptionSession } from "@/services/paymentService";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/services/authService";
import { Loader2, ChevronDown } from "lucide-react";

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
      'Restricted class access',
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
      '2 Tutor support days/month',
      '1 Event free/month'
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
      '8 Tutor support days/month',
      '5 Events free/month'
    ],
    color: 'border-amber-400/50 text-amber-600',
    icon: <Star className="w-5 h-5 text-amber-500 fill-current" />,
    buttonText: 'Go Premium',
    highlight: true,
    disabled: false
  },
  {
    id: 'BUSINESS',
    name: 'Business',
    priceMonthly: 85.50, // For 30 seats
    priceYearly: 855.00,
    trialPeriod: 7,
    features: [
      'Premium for Team members',
      'Shared Organization account',
      'Invite students via email',
      'Usage tracking per org',
      'Priority Admin support'
    ],
    color: 'border-indigo-400/50 text-indigo-600',
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    buttonText: 'Join Business',
    disabled: false
  }
];

export default function SubscriptionPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [businessSeats, setBusinessSeats] = useState<30 | 60>(30);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: userStats } = useQuery({
    queryKey: ["student", "dashboard"],
    queryFn: getDashboardData,
  });

  const currentPlan = userStats?.user?.subscription?.plan || 'FREE';

  const handleSubscribe = async (planId: 'PRO' | 'PREMIUM' | 'BUSINESS') => {
    try {
      setLoadingPlan(planId);
      const { url } = await createSubscriptionSession(planId, billingCycle, planId === 'BUSINESS' ? businessSeats : undefined);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout. Please try again.");
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          let displayPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;

          // Adjust Business price based on seats
          if (plan.id === 'BUSINESS') {
              if (businessSeats === 60) {
                  displayPrice = billingCycle === 'monthly' ? 170 : 1700;
              } else {
                  displayPrice = billingCycle === 'monthly' ? 85.50 : 855;
              }
          }

          const isTrialEligible = !userStats?.user?.hasUsedTrial;
          const hasTrial = plan.trialPeriod && isTrialEligible;

          return (
            <Card 
              key={plan.id}
              variant={plan.highlight ? 'elevated' : 'outline'}
              className={`relative overflow-hidden flex flex-col p-6 rounded-3xl border-2 transition-all duration-300 ${plan.color} ${plan.highlight ? 'shadow-2xl shadow-primary/10 -translate-y-2' : 'hover:scale-[1.02]'}`}
            >
              {(plan.highlight || hasTrial) && (
                <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                  {plan.highlight && (
                    <span className="bg-amber-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg shadow-amber-500/20">Popular</span>
                  )}
                  {hasTrial && !isActive && (
                    <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full shadow-lg shadow-emerald-500/20 animate-pulse">7 Days Trial</span>
                  )}
                </div>
              )}
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-slate-50 rounded-xl">{plan.icon}</div>
                  <h3 className="text-xl font-black tracking-tight">{plan.name}</h3>
                </div>
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-primary">${displayPrice}</span>
                    <span className="text-primary/60 font-bold text-[10px]">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {plan.id === 'BUSINESS' && (
                    <div className="mt-4 p-1 bg-slate-50 rounded-lg flex gap-1">
                        {[30, 60].map(s => (
                            <button
                                key={s}
                                onClick={() => setBusinessSeats(s as any)}
                                className={`flex-1 py-1 rounded-md text-[10px] font-black transition-all ${businessSeats === s ? 'bg-white shadow-sm text-primary' : 'text-primary/60'}`}
                            >
                                {s} Seats
                            </button>
                        ))}
                    </div>
                )}
              </div>

              <div className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
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
                  className={`w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'bg-slate-100' : (plan.highlight ? 'shadow-lg shadow-primary/20' : '')}`}
                  disabled={isActive || plan.disabled || !!loadingPlan}
                  onClick={() => handleSubscribe(plan.id as any)}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    isActive ? 'Current Plan' : (hasTrial ? 'Start 7-Day Free Trial' : plan.buttonText)
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="mt-20 border-t border-slate-100 pt-16 text-center">
        <h4 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-4">Trust & Security</h4>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
             <div className="flex items-center gap-2 font-bold text-primary/70">
               <ShieldCheck className="w-5 h-5" /> SSL SHA-256 Verified
             </div>
             <div className="flex items-center gap-2 font-bold text-primary/70 uppercase tracking-tighter text-xl">
               Stripe Payment
             </div>
        </div>
      </div>
    </div>
  );
}
















