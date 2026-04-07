"use client";

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { startStripeOnboarding } from '@/services/tutorService';

interface Props {
  isVerified: boolean;
}

export default function StripeOnboardingNotice({ isVerified }: Props) {
  const [loading, setLoading] = useState(false);

  const handleOnboard = async () => {
    setLoading(true);
    try {
      const { url } = await startStripeOnboarding();
      window.location.href = url;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to start onboarding.";
      alert(`Stripe Error: ${msg}`);
      setLoading(false);
    }
  };

  if (isVerified) return null;

  return (
    <Card 
      variant="outline" 
      padding="lg" 
      className="border-amber-100 bg-amber-50/50 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-amber-50 animate-in slide-in-from-top-4 duration-700 rounded-[2rem]"
    >
      <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
        <div className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-amber-100/50 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-7 w-7 text-amber-600" />
        </div>
        <div>
          <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Activate Your Marketplace Account</h4>
          <p className="text-sm font-medium text-slate-600 max-w-lg">
            To receive direct payments from students, you must complete your Stripe Connect setup. It takes less than 2 minutes.
          </p>
        </div>
      </div>
      <Button 
        onClick={handleOnboard}
        isLoading={loading}
        variant="primary" 
        size="lg" 
        className="h-14 px-10 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-600/20 transition-all active:scale-95 shrink-0"
      >
        Setup Payouts <ArrowRight className="ml-3 h-4 w-4" />
      </Button>
    </Card>
  );
}
