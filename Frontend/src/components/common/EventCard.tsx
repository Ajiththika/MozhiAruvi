import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface EventCardProps {
  id: string;
  title: string;
  type: "Workshop" | "Webinar" | "Meetup" | string;
  date: string;
  time: string;
  participantsCount?: number;
  attendees?: number;
  capacity: number;
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
    <Card variant="elevated" padding="none" className="flex flex-col group h-full">
      {/* Media / Top Section */}
      <div className="relative h-48 w-full bg-soft/20 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-50 text-4xl font-black text-gray-200 tracking-tighter opacity-50">
            MOZHI
          </div>
        )}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] uppercase font-black tracking-widest text-gray-700 shadow-xl backdrop-blur-md border border-white/20">
            {type}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <CardBody className="p-6 sm:p-7 flex flex-col flex-1">
        <h3 className="line-clamp-2 text-xl font-bold text-gray-800 mb-4 group-hover:text-primary transition-colors tracking-tight">
          {title}
        </h3>
        
        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
              <Calendar className="h-4 w-4" />
            </div>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
              <Clock className="h-4 w-4" />
            </div>
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-400">
              <Users className="h-4 w-4" />
            </div>
            <span className={isFull ? "text-red-500" : ""}>{joined} / {max} joined</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-gray-400 tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="truncate">{location ? location : `Hosted by ${hostName}`}</span>
          </div>
        </div>
      </CardBody>

      {/* Footer / Action Section */}
      <div className="px-6 sm:px-7 pb-8 pt-2">
        {isJoined ? (
          <div className="w-full rounded-responsive border border-emerald-100 bg-emerald-50/50 py-3 text-center text-xs font-black uppercase tracking-widest text-emerald-600">
            Already Registered ✓
          </div>
        ) : isFull ? (
          <div className="w-full rounded-responsive bg-gray-50 py-3 text-center text-xs font-black uppercase tracking-widest text-gray-400 border border-gray-100">
            Capacity Reached
          </div>
        ) : (
          <Button
            onClick={onRsvp}
            isLoading={isLoading}
            disabled={!onRsvp}
            className="w-full py-4 text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
          >
            {isLoading ? "Signing up..." : "Reserve Your Spot"}
          </Button>
        )}
      </div>
    </Card>
  );
}
