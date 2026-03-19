import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  id: string;
  title: string;
  type: "Workshop" | "Webinar" | "Meetup";
  date: string;
  time: string;
  attendees: number;
  maxAttendees: number;
  hostName: string;
  image?: string;
  isJoined?: boolean;
  onRsvp?: () => void;
}

export function EventCard({
  id,
  title,
  type,
  date,
  time,
  attendees,
  maxAttendees,
  hostName,
  image,
  isJoined = false,
  onRsvp,
}: EventCardProps) {
  const isFull = attendees >= maxAttendees;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-mozhi-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="relative h-48 w-full bg-mozhi-light dark:bg-mozhi-primary/20">
        {image ? (
           <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
           <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-mozhi-secondary to-mozhi-primary text-6xl font-black text-white/20">
              TAMIL
           </div>
        )}
        <div className="absolute left-4 top-4">
           <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-300">
              {type}
           </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
         <h3 className="line-clamp-2 text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {title}
         </h3>
         
         <div className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
               <Calendar className="h-4 w-4 text-mozhi-secondary" /> <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock className="h-4 w-4 text-emerald-500" /> <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
               <Users className="h-4 w-4 text-orange-500" /> <span>{attendees} / {maxAttendees} joined</span>
            </div>
            <div className="flex items-center gap-2">
               <MapPin className="h-4 w-4 text-slate-500" /> <span>Hosted by {hostName}</span>
            </div>
         </div>

         <div className="mt-8">
            {isJoined ? (
               <button disabled className="w-full rounded-xl border border-emerald-600 bg-emerald-50 py-2.5 text-sm font-bold text-emerald-700 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400">
                  Joined ✓
               </button>
            ) : isFull ? (
               <button disabled className="w-full rounded-xl bg-slate-200 py-2.5 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-500">
                  Waitlist Full
               </button>
            ) : (
               <button
                 onClick={onRsvp}
                 disabled={!onRsvp}
                 className="flex w-full items-center justify-center rounded-xl bg-mozhi-primary py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-mozhi-primary focus:outline-none focus:ring-2 focus:ring-mozhi-primary focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-slate-950"
               >
                  {!onRsvp ? "Joining..." : "RSVP"}
               </button>
            )}
         </div>
      </div>
    </div>
  );
}
