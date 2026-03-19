import React from "react";
import Link from "next/link";
import { ArrowLeft, Star, Users, Calendar, Video, Clock } from "lucide-react";

// For demo purposes, imagine fetching this based on `params.id`
export default function TutorProfile({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <div>
        <Link
          href="/student/tutors"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate- hover:text-slate- dark:text-slate- dark:hover:text-slate- transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tutors
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Info */}
        <div className="flex flex-col gap-6 lg:col-span-2">
           <div className="flex flex-col gap-6 rounded-2xl border border-slate- bg-white p-6 shadow-sm dark:border-slate- dark:bg-slate- md:flex-row md:items-start md:p-8">
              {/* Avatar Large */}
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-mozhi-light dark:bg-mozhi-primary/20 font-bold text-3xl text-mozhi-primary dark:text-mozhi-secondary">
                A
              </div>

              <div className="flex-1 space-y-4">
                 <div>
                    <h1 className="text-2xl font-bold text-slate- dark:text-slate- md:text-3xl">
                      Arun P.
                    </h1>
                    <p className="mt-1 text-lg text-slate- dark:text-slate-">
                      Expert in Conversational Tamil
                    </p>
                 </div>

                 {/* Stats block */}
                 <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate- dark:text-slate-">
                    <div className="flex items-center gap-1.5">
                       <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                       <span className="font-bold">4.9</span>
                       <span className="text-slate- font-normal">(142 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <Users className="h-5 w-5 text-slate-" />
                       <span>30+ Students</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-500">
                       <Video className="h-4 w-4" />
                       <span>Usually replies in 1hr</span>
                    </div>
                 </div>

                 {/* Tags */}
                 <div className="flex flex-wrap gap-2 pt-2">
                    <span className="inline-flex rounded-md bg-slate- px-3 py-1 text-xs font-semibold text-slate- dark:bg-slate- dark:text-slate-">
                      Beginner Friendly
                    </span>
                    <span className="inline-flex rounded-md bg-slate- px-3 py-1 text-xs font-semibold text-slate- dark:bg-slate- dark:text-slate-">
                      Conversation
                    </span>
                 </div>
              </div>
           </div>

           {/* About Section */}
           <div className="rounded-2xl border border-slate- bg-white p-6 shadow-sm dark:border-slate- dark:bg-slate- md:p-8">
              <h2 className="text-xl font-bold text-slate- dark:text-slate-">
                 About Arun
              </h2>
              <div className="mt-4 space-y-4 text-slate- dark:text-slate- leading-relaxed">
                 <p>
                    Passionate Tamil language educator with 5+ years of experience helping beginners master conversational Tamil. Let's make learning fun!
                 </p>
                 <p>
                    I tailor every single lesson to your specific learning path. Whether you are relocating to Chennai for work, wanting to talk to your grandparents or in-laws in their native language, or just fascinated by the world's oldest surviving classical language—I'm here to support you.
                 </p>
              </div>
           </div>

           {/* Review Sample */}
           <div className="rounded-2xl border border-slate- bg-slate- p-6 shadow-sm dark:border-slate- dark:bg-slate-/50">
              <h2 className="text-lg font-bold text-slate- dark:text-slate- mb-4">
                 Recent Reviews
              </h2>
              <div className="space-y-4">
                <div className="rounded-xl border border-slate- bg-white p-4 dark:border-slate- dark:bg-slate-">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-sm text-slate- dark:text-slate-">Sarah M.</div>
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  </div>
                  <p className="text-sm text-slate- dark:text-slate-">
                    "Arun is so patient! I had zero background in Indian languages, and he built up my vocabulary focusing entirely on words I actually use. Highly recommend."
                  </p>
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="flex flex-col gap-6 lg:col-span-1">
           <div className="sticky top-24 rounded-2xl border border-mozhi-light bg-white p-6 shadow-md dark:border-blue-900/30 dark:bg-slate-">
              <div className="flex items-baseline justify-between border-b border-slate- pb-4 dark:border-slate-">
                 <span className="text-xl font-bold text-slate- dark:text-slate-">150 XP</span>
                 <span className="text-sm text-slate- dark:text-slate-">/ 60 min session</span>
              </div>
              
              <div className="mt-6 flex flex-col gap-4">
                 <div className="flex items-center gap-3 text-sm font-medium text-slate- dark:text-slate-">
                    <Calendar className="h-5 w-5 text-mozhi-primary dark:text-mozhi-secondary" />
                    <span>Next available: <b>Tomorrow</b></span>
                 </div>
                 
                 <div className="space-y-3 pt-2">
                    <button className="flex w-full items-center justify-center rounded-xl bg-mozhi-primary py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-mozhi-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                       Book Trial Session
                    </button>
                    <button className="flex w-full items-center justify-center rounded-xl border border-slate- bg-white py-3 text-sm font-bold text-slate- shadow-sm transition-colors hover:bg-slate- dark:border-slate- dark:bg-slate- dark:text-slate- dark:hover:bg-slate-/80">
                       Send Message
                    </button>
                 </div>
                 
                 <p className="mt-4 text-center text-xs text-slate- dark:text-slate-">
                    You won't be charged yet. Trial sessions are fully refundable.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}