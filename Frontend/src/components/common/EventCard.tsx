import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  id: string;
  title: string;
  type: "Workshop" | "Webinar" | "Meetup";
  date: string;
  time: string;
  /** Number of participants registered */
  participantsCount?: number;
  /** Alias for backward compat */
  attendees?: number;
  capacity: number;
  /** Alias for backward compat */
  maxAttendees?: number;
  hostName: string;
  location?: string;
  image?: string;
  isJoined?: boolean;
  isLoading?: boolean;
  onRsvp?: () => void;
}

export function EventCard({
  id,
  title,
  type,
  date,
  time,
  participantsCount,
  attendees,
  capacity,
  maxAttendees,
  hostName,
  location,
  image,
  isJoined = false,
  isLoading = false,
  onRsvp,
}: EventCardProps) {
  const joined = participantsCount ?? attendees ?? 0;
  const max = capacity ?? maxAttendees ?? 0;
  const isFull = joined >= max;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-primary/20">
      <div className="relative h-48 w-full bg-light">
        {image ? (
           <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
           <div className="flex h-full w-full items-center justify-center bg-slate-50 text-6xl font-bold text-slate-200">
              TAMIL
           </div>
        )}
        <div className="absolute left-4 top-4">
           <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              {type}
           </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
         <h3 className="line-clamp-2 text-base font-semibold text-slate-900 mb-2">
            {title}
         </h3>
         
         <div className="mt-2 space-y-2 text-sm text-slate-500">
            <div className="flex items-center gap-2">
               <Calendar className="h-4 w-4 text-secondary" /> <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
               <Clock className="h-4 w-4 text-success" /> <span>{time}</span>
            </div>
            <div className="flex items-center gap-2">
               <Users className="h-4 w-4 text-warning" /> <span>{joined} / {max} joined</span>
            </div>
            <div className="flex items-center gap-2">
               <MapPin className="h-4 w-4 text-slate-400" /> <span>{location ? location : `Hosted by ${hostName}`}</span>
            </div>
         </div>

         <div className="mt-8">
            {isJoined ? (
               <button disabled className="w-full rounded-xl border border-success bg-success/10 py-2.5 text-sm font-semibold text-success">
                  Joined ✓
               </button>
            ) : isFull ? (
               <button disabled className="w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-400">
                  Event Full
               </button>
            ) : (
               <button
                 onClick={onRsvp}
                 disabled={isLoading || !onRsvp}
                 className="flex w-full items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
               >
                  {isLoading ? "Joining..." : "RSVP Now"}
               </button>
            )}
         </div>
      </div>
    </div>
  );
}
