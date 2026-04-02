"use client";

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createSubscriptionSession } from '@/services/paymentService';
import { 
  ShieldCheck, 
  Crown, 
  Building, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Lock, 
  Globe,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PLANS_DATA: Record<string, any> = {
  PRO: {
    name: 'Individual Pro Explorer',
    monthly: 3.81,
    yearly: 42,
    icon: ShieldCheck,
    color: 'text-primary',
    bg: 'bg-primary/5'
  },
  PREMIUM: {
    name: 'Individual Premium Mastery',
    monthly: 7.94,
    yearly: 90,
    icon: Crown,
    color: 'text-amber-500',
    bg: 'bg-amber-500/5'
  },
  BUSINESS: {
    name: 'Institutional Bundle',
    monthly: 85.50,
    yearly: 855,
    icon: Building,
    color: 'text-indigo-600',
    bg: 'bg-indigo-600/5',
    seats: 30
  }
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const planId = (searchParams.get('plan') || 'PRO').toUpperCase();
  const cycle = searchParams.get('cycle') || 'monthly';
  const seats = Number(searchParams.get('seats') || 0);

  const plan = PLANS_DATA[planId] || PLANS_DATA.PRO;
  const price = cycle === 'monthly' ? plan.monthly : plan.yearly;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const { url } = await createSubscriptionSession(planId as any, cycle as any, seats);
      window.location.href = url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong with the secure gateway. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 lg:py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 text-primary/60 font-black uppercase tracking-widest text-[10px] mb-8">
           <Lock size={12} className="text-emerald-500" /> Secure Checkout
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: DETAILS & PAYMENT METHOD */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Details Form UI (Simulation) */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-primary tracking-tight">Checkout Basics</h2>
              <Card variant="outline" className="p-8 border-slate-100 shadow-sm bg-white rounded-3xl space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">First Name</p>
                       <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold">{user?.name?.split(' ')[0] || 'Member'}</div>
                    </div>
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Last Name</p>
                       <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold">{user?.name?.split(' ')[1] || 'User'}</div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Email Address</p>
                    <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold">{user?.email}</div>
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Country</p>
                    <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold">
                       <span>United States</span>
                       <Globe size={16} className="text-primary/40" />
                    </div>
                 </div>
              </Card>
            </div>

            {/* Payment Method UI (The Embedded Feel) */}
            <div className="space-y-6">
               <h2 className="text-2xl font-black text-primary tracking-tight">Payment Method</h2>
               <Card variant="outline" className="p-8 border-slate-100 bg-white rounded-3xl shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <CreditCard className="text-primary h-5 w-5" />
                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">Credit / Debit Card</span>
                     </div>
                     <div className="flex items-center -space-x-1">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[7px] font-black opacity-60">VISA</div>
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[7px] font-black opacity-60">MC</div>
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Card Number</p>
                        <div className="relative group">
                           <input 
                              type="text" 
                              placeholder="1234 5678 1234 5678" 
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold placeholder:text-slate-200 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all" 
                           />
                           <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1">
                              <div className="w-5 h-3 bg-slate-200 rounded-sm" />
                              <div className="w-5 h-4 bg-slate-200 rounded-sm" />
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">Expiration</p>
                           <input 
                              type="text" 
                              placeholder="MM / YY" 
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold placeholder:text-slate-200 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all" 
                           />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase text-primary/60 tracking-widest ml-1">CVC</p>
                           <input 
                              type="text" 
                              placeholder="123" 
                              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-primary font-bold placeholder:text-slate-200 outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all" 
                           />
                        </div>
                     </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-6">
                     <Button 
                       onClick={handleConfirm}
                       className="w-full py-8 text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25"
                       size="xl"
                       isLoading={loading}
                       variant="primary"
                     >
                        Complete Order ${price.toFixed(2)}
                     </Button>
                     <p className="text-center text-[10px] font-bold text-primary/60 leading-relaxed max-w-sm mx-auto">
                        Your transaction is secured with industry-standard 256-bit encryption. Payment processing is managed by <strong className="text-slate-600">Stripe</strong>.
                     </p>
                  </div>
               </Card>
            </div>

            <div className="flex items-center justify-center gap-8 py-4 opacity-40">
               <div className="grayscale contrast-125 brightness-75 flex items-center gap-2">
                  <Shield size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">PCI Compliant</span>
               </div>
               <div className="grayscale contrast-125 brightness-75 flex items-center gap-2">
                  <Lock size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">SSL Encrypted</span>
               </div>
            </div>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <div className="lg:col-span-5">
             <div className="sticky top-12 space-y-8">
                <h2 className="text-2xl font-black text-primary tracking-tight">Order Summary</h2>
                <Card variant="outline" className="p-10 rounded-[2.5rem] border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] bg-white overflow-hidden relative">
                   {/* Top Accent */}
                   <div className={cn("absolute top-0 left-0 right-0 h-2", plan.bg.replace('/5', ''))}></div>
                   
                   <div className="flex items-start justify-between mb-12">
                      <div className="space-y-1.5 text-left">
                         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner", plan.bg)}>
                            <plan.icon className={cn("w-6 h-6", plan.color)} />
                         </div>
                         <h3 className="text-xl font-black text-primary uppercase tracking-tight">{plan.name}</h3>
                         <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Membership Plan</p>
                      </div>
                      <div className="text-right">
                         <p className="text-2xl font-black text-primary tracking-tight">${price.toFixed(2)}</p>
                         <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{cycle}</p>
                      </div>
                   </div>

                   <div className="space-y-6 pt-10 border-t border-slate-50 relative">
                      <div className="flex items-center justify-between text-sm font-bold">
                         <span className="text-primary/70 uppercase tracking-widest text-[10px]">Subtotal</span>
                         <span className="text-primary">${price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-bold">
                         <span className="text-primary/70 uppercase tracking-widest text-[10px]">Processing Fee</span>
                         <span className="text-emerald-500 uppercase tracking-widest text-[11px]">Free</span>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                         <span className="text-sm font-black text-primary uppercase tracking-widest">Total to Pay</span>
                         <span className="text-3xl font-black text-primary tracking-tighter">${price.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="mt-12 p-6 rounded-3xl bg-slate-50 border border-white space-y-4">
                      <div className="flex gap-4">
                         <CheckCircle2 size={16} className="text-emerald-500 mt-1 shrink-0" />
                         <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            <strong>Instant Access</strong>: Unlock all premium lessons, category modules, and tutor sessions immediately after payment.
                         </p>
                      </div>
                   </div>
                </Card>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
       <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
       </div>
    }>
       <CheckoutContent />
    </Suspense>
  );
}
















