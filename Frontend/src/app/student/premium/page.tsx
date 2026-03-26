import React from "react";
import { CheckCircle2, Sparkles, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  { name: "Full Curriculum Access", free: true, premium: true },
  { name: "Basic Vocabulary Saving", free: true, premium: true },
  { name: "Basic Quizzes", free: true, premium: true },
  { name: "Unlimited 1:1 Tutor Sessions (XP costs apply)", free: false, premium: true },
  { name: "Advanced Flashcard Algorithms", free: false, premium: true },
  { name: "Download Lessons Offline", free: false, premium: true },
  { name: "Ad-Free Learning", free: false, premium: true },
];

export default function StudentPremiumPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700 py-16 px-6">
      <div className="text-center space-y-6">
         <div className="inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-6 py-2 text-[10px] font-black uppercase tracking-widest text-primary shadow-sm shadow-primary/5">
            <Sparkles className="h-4 w-4" /> Global Accessibility
         </div>
         <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight leading-tight max-w-3xl mx-auto">
            Unlock your full <span className="text-primary italic">Tamil Potential</span>.
         </h1>
         <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary font-medium leading-relaxed italic">
            Upgrade to Mozhi Aruvi Premium to access expert tutors, advanced practice tools, and uninterrupted offline learning.
         </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-14">
         {/* Free Tier */}
         <Card variant="outline" padding="xl" className="flex flex-col border-border/80 bg-surface-soft/30 opacity-90">
            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">Basic Learner</h3>
            <p className="mt-2 text-text-secondary font-medium italic">Everything you need to start your journey.</p>
            
            <div className="mt-10 flex items-baseline gap-3">
               <span className="text-5xl font-black text-text-primary tracking-tight">Free</span>
               <span className="text-sm font-black text-text-tertiary uppercase tracking-widest">Forever</span>
            </div>

            <div className="h-px w-full bg-border/60 my-10" />

            <ul className="flex flex-col gap-5 flex-1">
               {FEATURES.map((feat) => (
                  <li key={feat.name} className="flex items-center gap-4">
                     {feat.free ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                     ) : (
                        <X className="h-5 w-5 text-text-tertiary shrink-0" />
                     )}
                     <span className={cn(
                        "text-sm font-bold tracking-tight", 
                        feat.free ? "text-text-primary" : "text-text-tertiary line-through opacity-50"
                      )}>
                        {feat.name}
                     </span>
                  </li>
               ))}
            </ul>

            <div className="pt-12 mt-auto">
               <Button variant="ghost" disabled className="w-full bg-border/20 text-text-tertiary border border-border/40 py-5">
                  Current Deployment
               </Button>
            </div>
         </Card>

         {/* Premium Tier */}
         <Card variant="elevated" padding="xl" className="relative flex flex-col border-2 border-primary bg-surface shadow-primary/10 overflow-visible group">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-primary/30 z-10 border border-white/20">
               Most Dedicated
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-primary fill-current" />
                  <h3 className="text-2xl font-black text-primary uppercase tracking-tight">
                    Mozhi Premium
                  </h3>
               </div>
               <p className="text-text-secondary font-medium italic">For serious learners seeking fluency.</p>
            </div>

            <div className="mt-10 flex items-baseline gap-3">
               <span className="text-5xl font-black text-text-primary tracking-tight">$9.99</span>
               <span className="text-sm font-black text-text-tertiary uppercase tracking-widest">/ monthly energy</span>
            </div>

            <div className="h-px w-full bg-border/60 my-10" />

            <ul className="flex flex-col gap-5 flex-1">
               {FEATURES.map((feat) => (
                  <li key={feat.name} className="flex items-center gap-4 group/item">
                     <CheckCircle2 className="h-5 w-5 text-primary shrink-0 transition-transform group-hover/item:scale-110" />
                     <span className="text-sm font-bold text-text-primary tracking-tight">
                        {feat.name}
                     </span>
                  </li>
               ))}
            </ul>

            <div className="pt-12 mt-auto space-y-4">
               <Button 
                  disabled
                  variant="primary"
                  size="xl"
                  title="Payments integration coming soon"
                  className="w-full py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/40"
               >
                  Upgrade (Inactive Node)
               </Button>
               <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary animate-pulse">
                  Financial gateway offline for sync
               </p>
            </div>
         </Card>
      </div>
    </div>
  );
}
