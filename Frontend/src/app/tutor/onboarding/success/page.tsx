"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { finalizeStripeOnboarding } from '@/services/tutorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function OnboardingSuccess() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Finalizing your account setup...');
  const router = useRouter();

  useEffect(() => {
    const finalize = async () => {
      try {
        const res = await finalizeStripeOnboarding();
        if (res.isVerified) {
          setStatus('success');
          setMessage(res.message || "Your payout account is now active!");
        } else {
          setStatus('error');
          setMessage("You didn't complete all the steps. Payouts might be restricted.");
        }
      } catch (err) {
        setStatus('error');
        setMessage("Something went wrong while confirming your account. Please check your dashboard.");
      }
    };
    finalize();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <Card variant="elevated" padding="xl" className="max-w-lg w-full text-center space-y-8 animate-in fade-in zoom-in duration-700 rounded-[2.5rem]">
         {status === 'loading' && (
           <div className="flex flex-col items-center gap-6 py-10">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p className="text-lg font-bold text-primary/70 tracking-tight">{message}</p>
           </div>
         )}

         {status === 'success' && (
           <div className="space-y-6 py-10">
              <div className="h-24 w-24 bg-emerald-100/50 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-emerald-200/40">
                 <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Setup Complete!</h2>
                 <p className="text-slate-600 font-medium leading-relaxed">{message}</p>
              </div>
              <Button onClick={() => router.push('/tutor/dashboard')} variant="primary" size="lg" className="w-full rounded-2xl h-16 shadow-xl shadow-primary/20">
                 Go to Dashboard
              </Button>
           </div>
         )}

         {status === 'error' && (
            <div className="space-y-6 py-10">
               <div className="h-24 w-24 bg-amber-100/50 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-amber-200/40">
                  <AlertCircle className="h-12 w-12 text-amber-600" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Setup Pending</h2>
                  <p className="text-slate-600 font-medium leading-relaxed">{message}</p>
               </div>
               <div className="flex flex-col gap-4">
                  <Button onClick={() => router.push('/tutor/dashboard')} variant="secondary" size="lg" className="w-full rounded-2xl h-16 border-2 border-slate-100">
                    Dashboard Overview
                  </Button>
                  <Button onClick={() => window.location.reload()} variant="primary" size="lg" className="w-full rounded-2xl h-16 bg-amber-600 hover:bg-amber-700 shadow-amber-600/20">
                    Retry Check
                  </Button>
               </div>
            </div>
         )}
      </Card>
    </div>
  );
}
