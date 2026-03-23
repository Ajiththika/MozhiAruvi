"use client";

import React, { useEffect, useState } from "react";
import { CalendarDays, Loader2, AlertCircle, Users } from "lucide-react";
import { EventCard } from "@/components/common/EventCard";
import { getEvents, getMyJoinRequests, submitJoinRequest, MozhiEvent, JoinRequest } from "@/services/eventService";

type TabType = "upcoming" | "myRsvps";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [myRequests, setMyRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("upcoming");
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getEvents(), getMyJoinRequests()])
      .then(([evs, reqs]) => {
        setEvents(evs.events);
        setMyRequests(reqs);
      })
      .catch(() => setError("Could not load events. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const joinedEventIds = new Set(
    myRequests
      .filter((r) => r.status === "approved" || r.status === "pending")
      .map((r) => (typeof r.event === "string" ? r.event : r.event._id))
  );

  const handleRsvp = async (eventId: string) => {
    setJoining(eventId);
    try {
      const req = await submitJoinRequest(eventId, {});
      setMyRequests((prev) => [...prev, req]);
    } catch {
      // silently fail – toast would go here
    } finally {
      setJoining(null);
    }
  };

  const shownEvents =
    tab === "myRsvps"
      ? events.filter((e) => joinedEventIds.has(e._id))
      : events;

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600 flex items-center gap-2">
          Community Events <CalendarDays className="h-6 w-6 text-mozhi-secondary" />
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-600">
          Join free workshops, webinars, and meetups hosted by our top tutors.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-200">
        <nav className="-mb-px flex gap-6">
          {(["upcoming", "myRsvps"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-bold transition-colors ${
                tab === t
                  ? "border-mozhi-primary text-mozhi-primary dark:border-mozhi-primary dark:text-mozhi-secondary"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:text-slate-600 dark:text-slate-600"
              }`}
            >
              {t === "upcoming" ? "Upcoming Events" : `My RSVPs (${joinedEventIds.size})`}
            </button>
          ))}
        </nav>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
          <p className="text-sm font-medium text-slate-600">Loading events...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && shownEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-slate-600 dark:text-slate-600 mb-4" />
          <p className="text-slate-600 dark:text-slate-600">
            {tab === "myRsvps" ? "You haven't RSVP'd to any events yet." : "No upcoming events right now."}
          </p>
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
              date={new Date(ev.date).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
              time={ev.time}
              attendees={ev.attendees.length}
              maxAttendees={ev.capacity}
              hostName={ev.organizedBy?.name ?? "Mozhi Aruvi"}
              isJoined={joinedEventIds.has(ev._id)}
              onRsvp={joining === ev._id ? undefined : () => handleRsvp(ev._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}