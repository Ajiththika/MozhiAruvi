import React from "react";
import { EventCard } from "@/components/common/EventCard";
import { PlusCircle } from "lucide-react";

export default function TutorEventsPage() {
  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
               Hosted Events
            </h2>
            <p className="mt-1 text-slate- dark:text-slate-">
               Manage workshops or meetups you are hosting for your students.
            </p>
         </div>
         <button className="flex items-center gap-2 rounded-xl bg-mozhi-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary">
             <PlusCircle className="h-4 w-4" /> Create New Event
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Since this is a tutor, they see their OWN events */}
         <EventCard 
            id="1"
            title="Tamil Cinema Slang Part 2"
            type="Workshop"
            date="Friday, Oct 30"
            time="06:00 PM IST"
            attendees={12}
            maxAttendees={20}
            hostName="You"
         />
         
         {/* Empty State Card */}
         <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate- bg-slate-/50 p-8 text-center dark:border-slate- dark:bg-slate-">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mozhi-light/50 text-mozhi-primary dark:bg-mozhi-primary/20 dark:text-mozhi-secondary mb-4">
                <PlusCircle className="h-6 w-6" />
             </div>
             <h3 className="text-lg font-bold text-slate- dark:text-slate-">Host a session</h3>
             <p className="mt-1 text-sm text-slate- dark:text-slate-">
                Engage larger groups of students with specialized topics.
             </p>
         </div>
      </div>
    </div>
  );
}