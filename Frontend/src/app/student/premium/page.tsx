import React from "react";
import { CheckCircle2, Sparkles, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="mx-auto max-w-5xl space-y-12 animate-in fade-in zoom-in-95 duration-500 py-12">
      <div className="text-center">
         <div className="inline-flex items-center gap-2 rounded-full border border-mozhi-light bg-mozhi-light/50 px-4 py-1.5 text-sm font-bold text-mozhi-primary dark:border-blue-900/50 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary">
            <Sparkles className="h-4 w-4" /> Go Premium
         </div>
         <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate- dark:text-slate- sm:text-5xl">
            Unlock your full Tamil potential.
         </h1>
         <p className="mx-auto mt-4 max-w-2xl text-lg text-slate- dark:text-slate-">
            Upgrade to Mozhi Aruvi Premium to access expert tutors, advanced practice tools, and uninterrupted offline learning.
         </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 px-4 md:px-0">
         {/* Free Tier */}
         <div className="flex flex-col rounded-3xl border border-slate- bg-white p-8 shadow-sm dark:border-slate- dark:bg-slate-">
            <h3 className="text-2xl font-bold text-slate- dark:text-slate-">Basic Learner</h3>
            <p className="mt-2 text-slate- dark:text-slate-">Everything you need to start your journey.</p>
            <div className="mt-6 flex items-baseline gap-2">
               <span className="text-4xl font-extrabold text-slate- dark:text-slate-">Free</span>
               <span className="text-sm font-medium text-slate-">Forever</span>
            </div>
            <ul className="mt-8 flex flex-col gap-4">
               {FEATURES.map((feat) => (
                  <li key={feat.name} className="flex items-center gap-3">
                     {feat.free ? (
                        <CheckCircle2 className="h-5 w-5 fill-zinc-200 text-slate- dark:fill-zinc-800 dark:text-slate-" />
                     ) : (
                        <X className="h-5 w-5 text-slate- dark:text-slate-" />
                     )}
                     <span className={cn("text-sm", feat.free ? "text-slate- dark:text-slate-" : "text-slate- dark:text-slate-")}>
                        {feat.name}
                     </span>
                  </li>
               ))}
            </ul>
            <div className="mt-auto pt-8">
               <button disabled className="w-full rounded-xl bg-slate- py-3.5 text-sm font-bold text-slate- dark:bg-slate- dark:text-slate-">
                  Current Plan
               </button>
            </div>
         </div>

         {/* Premium Tier */}
         <div className="relative flex flex-col rounded-3xl border-2 border-mozhi-primary bg-white p-8 shadow-xl dark:border-mozhi-primary dark:bg-slate-">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-mozhi-primary px-4 py-1 text-sm font-bold text-white shadow-sm dark:bg-mozhi-primary">
               Most Popular
            </div>
            <h3 className="text-2xl font-bold text-mozhi-primary dark:text-mozhi-secondary flex items-center gap-2">
               Mozhi Premium <Star className="h-5 w-5 fill-current" />
            </h3>
            <p className="mt-2 text-slate- dark:text-slate-">For serious learners seeking fluency.</p>
            <div className="mt-6 flex items-baseline gap-2">
               <span className="text-4xl font-extrabold text-slate- dark:text-slate-">$9.99</span>
               <span className="text-sm font-medium text-slate-">/ month</span>
            </div>
            <ul className="mt-8 flex flex-col gap-4">
               {FEATURES.map((feat) => (
                  <li key={feat.name} className="flex items-center gap-3">
                     <CheckCircle2 className="h-5 w-5 fill-blue-600 text-white dark:fill-blue-500" />
                     <span className="text-sm font-medium text-slate- dark:text-slate-">
                        {feat.name}
                     </span>
                  </li>
               ))}
            </ul>
            <div className="mt-auto pt-8">
               <button className="w-full rounded-xl bg-mozhi-primary py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-mozhi-primary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-mozhi-primary focus:ring-offset-2 dark:focus:ring-offset-zinc-950">
                  Upgrade to Premium
               </button>
               <p className="mt-3 text-center text-xs font-medium text-slate-">
                  Cancel anytime. 7-day money-back guarantee.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}