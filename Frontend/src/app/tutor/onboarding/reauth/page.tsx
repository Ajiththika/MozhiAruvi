"use client";

import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { startStripeOnboarding } from '@/services/tutorService';

export default function OnboardingReauth() {
  useEffect(() => {
    const reauth = async () => {
      try {
        const { url } = await startStripeOnboarding();
        window.location.href = url;
      } catch (err) {
         window.location.href = '/tutor/dashboard';
      }
    };
    reauth();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
      <Loader2 className="h-16 w-16 text-amber-600 animate-spin" />
      <p className="text-xl font-bold text-amber-800 tracking-tight">Refreshing Stripe Session...</p>
      <p className="text-slate-600 font-medium tracking-tight">Hang tight, redirecting you back for payouts setup.</p>
    </div>
  );
}
