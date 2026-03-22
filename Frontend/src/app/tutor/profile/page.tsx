import React from "react";
import { UserCircle, Mail, Globe, MapPin, Banknote, UploadCloud } from "lucide-react";

export default function TutorProfileSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 py-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
          Edit Public Profile 📝
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-600">
          This is how students will see you in the Tutors directory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
         {/* Left col: Avatar Upload */}
         <div className="col-span-1 flex flex-col items-center space-y-4">
             <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-50 shadow-lg dark:border-slate-200 dark:bg-slate-50 relative group">
                <UserCircle className="h-16 w-16 text-slate-600 dark:text-slate-600 group-hover:opacity-40 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <UploadCloud className="h-8 w-8 text-white" />
                </div>
             </div>
             <div className="text-center">
                <button className="text-sm font-semibold text-mozhi-primary hover:text-mozhi-secondary dark:text-mozhi-secondary">Change Picture</button>
                <p className="mt-1 text-xs text-slate-600">JPG, GIF or PNG. 1MB max.</p>
             </div>
         </div>

         {/* Right col: Settings Form narrow */}
         <div className="col-span-1 md:col-span-2 space-y-8">
            <form className="flex flex-col gap-6">
                
                {/* Personal Info Group */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50">
                   <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-600 dark:text-slate-600 border-b border-slate-200 pb-3 dark:border-slate-200">
                      <UserCircle className="h-5 w-5 text-mozhi-secondary" /> Personal Identity
                   </h3>
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Display Name</label>
                         <input type="text" defaultValue="Arun P." className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Email Contact</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                            <input type="email" disabled defaultValue="arun.p@example.com" className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-200 dark:bg-slate-900/50 cursor-not-allowed" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-1.5 pt-2">
                       <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Short Bio / Introduction</label>
                       <textarea rows={4} defaultValue="Passionate Tamil language educator with 5+ years of experience helping beginners master conversational Tamil. Let's make learning fun!" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"></textarea>
                       <p className="text-xs text-slate-600">Maximum 250 characters.</p>
                   </div>
                </div>

                {/* Expertise Group */}
                <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50">
                   <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-600 dark:text-slate-600 border-b border-slate-200 pb-3 dark:border-slate-200">
                      <Globe className="h-5 w-5 text-emerald-500" /> Expertise & Rates
                   </h3>
                   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Base Hourly Rate (XP)</label>
                         <div className="relative">
                            <Banknote className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                            <input type="number" defaultValue="150" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600" />
                         </div>
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-slate-600 dark:text-slate-600">Location</label>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                            <input type="text" defaultValue="Chennai, India" className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Save Block */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-200">
                   <button type="button" className="rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-50 transition-colors">
                      Cancel
                   </button>
                   <button type="button" className="rounded-lg bg-mozhi-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-mozhi-primary focus:outline-none focus:ring-2 focus:ring-mozhi-primary focus:ring-offset-2 transition-colors dark:focus:ring-offset-zinc-950">
                      Save Profile
                   </button>
                </div>
            </form>
         </div>
      </div>
    </div>
  );
}