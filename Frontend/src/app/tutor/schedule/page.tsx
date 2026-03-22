import React from "react";
import { ChevronLeft, ChevronRight, Clock, Copy, Plus } from "lucide-react";

const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function TutorSchedulePage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
               Manage Availability 📅
            </h2>
            <p className="mt-1 text-slate-600 dark:text-slate-600">
               Set your working hours so students can book sessions with you.
            </p>
         </div>
         <button className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-mozhi-primary">
             Save Changes
         </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
         {/* Main Settings Panel */}
         <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-200">
                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-600">Weekly Hours</h3>
                <div className="flex items-center gap-2">
                   <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600">
                      Copy from last week <Copy className="h-3 w-3" />
                   </button>
                </div>
            </div>

            <div className="flex flex-col space-y-4">
               {WEEK_DAYS.map((day, index) => (
                  <div key={day} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 border-b border-slate-200 pb-4 last:border-0 last:pb-0 dark:border-slate-200">
                      <div className="flex w-24 items-center gap-3">
                         <input
                           type="checkbox"
                           defaultChecked={index !== 5 && index !== 6} // Uncheck weekends by default
                           className="h-4 w-4 rounded border-slate-200 text-mozhi-primary focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50"
                         />
                         <span className="font-semibold text-slate-600 dark:text-slate-600">{day}</span>
                      </div>

                      {index === 5 || index === 6 ? (
                         <div className="flex-1 text-sm text-slate-600 italic">
                             Unavailable
                         </div>
                      ) : (
                         <div className="flex flex-1 items-center gap-2">
                             <select aria-label="Start time" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600">
                                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                             </select>
                             <span className="text-slate-600">-</span>
                             <select aria-label="End time" defaultValue="05:00 PM" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm focus:border-mozhi-primary focus:outline-none focus:ring-1 focus:ring-mozhi-primary dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600">
                                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                             </select>
                             <button className="ml-2 text-slate-600 hover:text-mozhi-primary dark:text-slate-600 dark:hover:text-mozhi-secondary transition-colors">
                                <Plus className="h-5 w-5" />
                             </button>
                         </div>
                      )}
                  </div>
               ))}
            </div>
         </div>

         {/* Visual Calendar Overview */}
         <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50 min-h-[400px]">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-200">
               <h3 className="font-bold text-slate-600 dark:text-slate-600">Preview</h3>
               <div className="flex gap-1">
                  <button className="rounded p-1 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                  <button className="rounded p-1 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
               </div>
            </div>

            <div className="flex flex-1 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 border-dashed dark:bg-slate-900/50 dark:border-slate-200">
               <div className="text-center p-6 text-slate-600 dark:text-slate-600">
                  <Clock className="mx-auto h-8 w-8 opacity-50 mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-600">Interactive Calendar View</p>
                  <p className="text-xs mt-1">Select date ranges to add overrides for holidays and vacations.</p>

                  <button className="mt-4 w-full rounded-lg border border-mozhi-light bg-mozhi-light/50 py-2 text-sm font-medium text-mozhi-primary dark:border-blue-900/50 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary transition-colors hover:bg-mozhi-light dark:hover:bg-mozhi-primary/20">
                     Add Holiday Override
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}