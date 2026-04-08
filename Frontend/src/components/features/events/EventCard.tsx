import React from "react";
import { Calendar, Clock, MapPin, Users, Trash2 } from "lucide-react";
import Card, { CardBody, CardFooter } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface EventCardProps {
  id: string;
  title: string;
  type?: "Workshop" | "Webinar" | "Meetup" | string;
  date: string;
  time: string;
  participantsCount?: number;
  attendees?: number;
  capacity: number;
  maxAttendees?: number;
  hostName?: string;
  location?: string;
  image?: string;
  isJoined?: boolean;
  isLoading?: boolean;
  onRsvp?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  createdBy?: { name?: string };
}

export function EventCard({
  id,
  title,
  type = "Community Event",
  date,
  time,
  participantsCount,
  attendees,
  capacity,
  maxAttendees,
  hostName,
  createdBy,
  location,
  image,
  isJoined = false,
  isLoading = false,
  onRsvp,
  onEdit,
  onDelete,
}: EventCardProps) {
  const joined = participantsCount ?? attendees ?? 0;
  const max = capacity ?? maxAttendees ?? 0;
  const isFull = joined >= max;
  const hName = hostName ?? createdBy?.name ?? "MozhiAruvi";

  const isAdminView = !!onEdit || !!onDelete;

  return (
    <Card variant="elevated" padding="none" className="flex flex-col group h-full hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 rounded-[2rem] overflow-hidden border border-slate-100">
      {/* Media / Top Section */}
      <div className="relative h-56 w-full bg-slate-50 overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-4xl font-black text-slate-200 tracking-tighter opacity-70">
            MOZHI
          </div>
        )}
        <div className="absolute left-6 top-6">
          <span className="rounded-xl bg-white/95 px-5 py-2 text-[9px] uppercase font-black tracking-[0.2em] text-primary shadow-xl backdrop-blur-md border border-white/50">
            {type}
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent opacity-60" />
      </div>

      {/* Content Section */}
      <CardBody className="p-8 flex flex-col flex-1 space-y-6">
        <h3 className="line-clamp-2 text-2xl font-black text-primary tracking-tight leading-tight group-hover:text-emerald-500 transition-colors">
          {title}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="flex items-center gap-3 text-[10px] font-black text-primary/60 uppercase tracking-widest">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 flex items-center justify-center text-primary shadow-sm">
              <Calendar className="h-4 w-4" />
            </div>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black text-primary/60 uppercase tracking-widest">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-sm">
              <Clock className="h-4 w-4" />
            </div>
            <span>{time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
           <div className="flex items-center gap-3 text-[10px] font-black text-primary/60 uppercase tracking-widest">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className={isFull ? "text-red-500" : ""}>{joined} / {max}</span>
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-primary/40 uppercase tracking-widest">
              <MapPin className="h-3.5 w-3.5" />
              <span className="max-w-[80px] truncate">{location ? location : "Global"}</span>
           </div>
        </div>
      </CardBody>

      {/* Footer / Action Section */}
      <div className="px-8 pb-8">
        {onRsvp && (
           <>
            {isJoined ? (
              <div className="w-full rounded-2xl border border-emerald-100 bg-emerald-50/50 py-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600">
                Registered ✓
              </div>
            ) : isFull ? (
              <div className="w-full rounded-2xl bg-slate-50 py-4 text-center text-[10px] font-black uppercase tracking-widest text-primary/40 border border-slate-100">
                Full
              </div>
            ) : (
              <Button
                onClick={onRsvp}
                isLoading={isLoading}
                disabled={!onRsvp}
                className="w-full py-5 text-[10px] rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-950/10 hover:shadow-emerald-500/20 hover:scale-[1.02] transition-all"
              >
                {isLoading ? "Signing up..." : "Reserve Spot"}
              </Button>
            )}
           </>
        )}

        {isAdminView && (
          <div className="flex items-center gap-3 pt-6">
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="flex-1 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl"
            >
              Edit
            </Button>
            <button
              onClick={onDelete}
              className="w-12 h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0"
            >
               <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}




export default EventCard;













