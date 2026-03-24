"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Loader2, AlertCircle, Users, CheckCircle2, Clock } from "lucide-react";
import { EventCard } from "@/components/common/EventCard";
import { getEvents, getMyJoinRequests, submitJoinRequest, MozhiEvent, JoinRequest } from "@/services/eventService";
import { cn } from "@/lib/utils";

type TabType = "upcoming" | "myRsvps";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("upcoming");
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEvents(1, 12), getMyJoinRequests()])
      .then(([evs, reqs]) => {
        setEvents(evs.events);
        setMyRequests(reqs);
      })
      .catch(() => setError("Could not load events. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  // Backend populates 'eventId' field in JoinRequest
  const joinedEventIds = new Set(
    myRequests
      .filter((r) => r.status === "approved" || r.status === "pending")
      .map((r) => {
        const ev = r.eventId ?? r.event;
        return typeof ev === "string" ? ev : ev?._id ?? "";
      })
  );

  const handleRsvp = async (eventId: string) => {
    setJoining(eventId);
    try {
      const req = await submitJoinRequest(eventId, {});
      setMyRequests((prev) => [...prev, req]);
    } catch (e: any) {
      // Show user-facing error if capacity/existing
      const msg = e?.response?.data?.error?.message || e?.response?.data?.message;
      if (msg) setError(msg);
    } finally {
      setJoining(null);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingEvents = events.filter((e) => e.date >= today);
  const shownEvents =
    tab === "myRsvps"
      ? events.filter((e) => joinedEventIds.has(e._id))
      : upcomingEvents;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
          Community Events <CalendarDays className="h-6 w-6 text-secondary" />
        </h2>
        <p className="mt-1 text-slate-500 text-sm font-medium">
          Join free workshops, webinars, and meetups hosted by our top tutors.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-6">
          {([
            { key: "upcoming", label: `Upcoming (${upcomingEvents.length})` },
            { key: "myRsvps", label: `My RSVPs (${joinedEventIds.size})` },
          ] as { key: TabType; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-bold transition-colors",
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700"
              )}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-slate-500">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          <button className="ml-auto text-xs font-bold underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!loading && !error && shownEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="h-16 w-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Users className="h-8 w-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-500">
            {tab === "myRsvps" ? "You haven't RSVP'd to any events yet." : "No upcoming events right now."}
          </p>
          {tab === "myRsvps" && (
            <button onClick={() => setTab("upcoming")} className="text-sm font-bold text-primary hover:underline">
              Browse upcoming events →
            </button>
          )}
        </div>
      )}

      {!loading && !error && shownEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shownEvents.map((ev) => (
            <EventCard
              key={ev._id}
              id={ev._id}
              title={ev.title}
              type="Meetup"
              date={new Date(ev.date).toLocaleDateString("en-IN", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
              time={ev.time}
              participantsCount={ev.participantsCount}
              capacity={ev.capacity}
              hostName={ev.createdBy?.name ?? "Mozhi Aruvi"}
              location={ev.location}
              isJoined={joinedEventIds.has(ev._id)}
              isLoading={joining === ev._id}
              onRsvp={joinedEventIds.has(ev._id) ? undefined : () => handleRsvp(ev._id)}
            />
          ))}
        </div>
      )}

      {/* My RSVPs detailed view */}
      {!loading && tab === "myRsvps" && myRequests.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">RSVP Status</h3>
          {myRequests.map((req) => {
            const ev = req.eventId ?? req.event;
            const evObj = typeof ev === "object" ? ev : null;
            return (
              <div key={req._id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                  req.status === "approved" ? "bg-emerald-50 text-emerald-600"
                    : req.status === "rejected" ? "bg-red-50 text-red-500"
                    : "bg-amber-50 text-amber-600"
                )}>
                  {req.status === "approved" ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{evObj?.title ?? "Event"}</p>
                  {evObj && <p className="text-xs text-slate-400 font-medium">{evObj.date} · {evObj.time}</p>}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
                  req.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                    : req.status === "rejected" ? "bg-red-50 text-red-500 border-red-100"
                    : "bg-amber-50 text-amber-600 border-amber-100"
                )}>
                  {req.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}