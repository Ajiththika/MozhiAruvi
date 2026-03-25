"use client";

import React, { useEffect, useState } from "react";
import { EventCard } from "@/components/common/EventCard";
import { PlusCircle, Loader2, AlertCircle, CalendarDays } from "lucide-react";
import { getMyEvents, createEvent, MozhiEvent, CreateEventPayload } from "@/services/eventService";
import { cn } from "@/lib/utils";

export default function TutorEventsPage() {
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateEventPayload>({
    eventCode: "",
    title: "",
    description: "",
    date: "",
    time: "",
    capacity: 20,
    location: "Online (Google Meet)",
  });

  useEffect(() => {
    getMyEvents()
      .then(setEvents)
      .catch(() => setError("Could not load your events."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createEvent(form);
      setEvents((prev) => [created, ...prev]);
      setShowCreate(false);
      setForm({ eventCode: "", title: "", description: "", date: "", time: "", capacity: 20, location: "Online (Google Meet)" });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to create event.");
    } finally {
      setCreating(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter((e) => e.date >= today);
  const past = events.filter((e) => e.date < today);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-800 flex items-center gap-2">
            Hosted Events <CalendarDays className="h-6 w-6 text-primary" />
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Manage workshops or meetups you are hosting for your students.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" /> {showCreate ? "Cancel" : "Create New Event"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          <button onClick={() => setError(null)} className="ml-auto text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Create Event Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-[2rem] border border-primary/10 bg-primary/5 p-8 space-y-5 animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-lg font-bold text-gray-800">New Event Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Code *</label>
              <input required value={form.eventCode} onChange={e => setForm(f => ({ ...f, eventCode: e.target.value.toUpperCase() }))}
                placeholder="e.g. TAMIL-WS-01"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Tamil Cinema Slang Workshop"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
              <input required type="date" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time *</label>
              <input required type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity *</label>
              <input required type="number" min={1} max={500} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location / Link *</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Online (Google Meet) or venue"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description *</label>
            <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will students learn or experience?"
              className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-gray-100 px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-all active:scale-95">
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-gray-500">Loading your events...</p>
        </div>
      ) : (
        <>
          {/* Upcoming events */}
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Upcoming ({upcoming.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((ev) => (
                  <EventCard
                    key={ev._id}
                    id={ev._id}
                    title={ev.title}
                    type="Workshop"
                    date={new Date(ev.date).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
                    time={ev.time}
                    participantsCount={ev.participantsCount}
                    capacity={ev.capacity}
                    hostName="You"
                    location={ev.location}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past events */}
          {past.length > 0 && (
            <div className="space-y-4 opacity-70">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-1">Past</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {past.map((ev) => (
                  <EventCard
                    key={ev._id}
                    id={ev._id}
                    title={ev.title}
                    type="Workshop"
                    date={new Date(ev.date).toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
                    time={ev.time}
                    participantsCount={ev.participantsCount}
                    capacity={ev.capacity}
                    hostName="You"
                    location={ev.location}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/50 p-16 text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/10">
                <PlusCircle className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Host your first session</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Engage larger groups of students with specialized topics. Create an event to get started.
              </p>
              <button onClick={() => setShowCreate(true)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary/90 transition-all">
                Create Event
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}