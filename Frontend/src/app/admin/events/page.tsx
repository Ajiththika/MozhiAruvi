"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Calendar as CalendarIcon, MapPin, Users, Globe2, Trash2, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import { getEvents, deleteEvent, createEvent, MozhiEvent, CreateEventPayload } from "@/services/eventService";

const EventStatusBadge = ({ isActive }: { isActive: boolean }) => {
   if (isActive) {
      return <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-500">Active</span>;
   }
   return <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-500">Cancelled / Inactive</span>;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    setLoading(true);
    getEvents(1, 50)
      .then(res => setEvents(res.events))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
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

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<MozhiEvent>[] = [
    // ... same columns as before ...
    {
      header: "Event",
      accessorKey: "title",
      cell: (row) => (
         <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-slate-100">{row.title}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
               <Globe2 className="h-3 w-3" /> {row.eventCode}
            </span>
         </div>
      ),
    },
    { header: "Host Tutor", accessorKey: "createdBy", cell: (row) => <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{(row as any).createdBy?.name || 'Unknown'}</span> },
    {
      header: "Schedule",
      accessorKey: "date",
      cell: (row) => (
         <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <CalendarIcon className="h-4 w-4" />
            {new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {row.time}
         </div>
      )
    },
    {
      header: "Attendees",
      accessorKey: "participantsCount",
      cell: (row) => (
         <div className="flex items-center gap-1.5 text-sm font-medium text-primary dark:text-mozhi-secondary">
            <Users className="h-4 w-4" /> {(row as any).participantsCount ?? 0} / {row.capacity}
         </div>
      )
    },
    { header: "Status", accessorKey: "isActive", cell: (row) => <EventStatusBadge isActive={row.isActive} /> },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
         <div className="flex justify-end gap-2">
            <button
              onClick={() => handleDelete(row._id)}
              disabled={deletingId === row._id}
              className="text-sm font-semibold text-red-600 hover:text-red-500 transition ml-2 inline-flex items-center gap-1 disabled:opacity-40"
            >
               <Trash2 className="w-4 h-4" /> {deletingId === row._id ? 'Deactivating...' : 'Deactivate'}
            </button>
         </div>
      )
    }
  ];

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-mozhi-secondary" />
              <span className="text-[10px] font-black text-mozhi-secondary uppercase tracking-[0.3em]">Administrator</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tight">Events Moderation</h1>
           <p className="mt-2 text-gray-500 font-medium">Monitor and create community events.</p>
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
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="rounded-[2.5rem] border border-primary/10 bg-primary/5 p-10 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <h3 className="text-xl font-bold text-gray-800">New Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Code *</label>
              <input required value={form.eventCode} onChange={e => setForm(f => ({ ...f, eventCode: e.target.value.toUpperCase() }))}
                placeholder="e.g. ADM-TAMIL-01"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title *</label>
              <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Event Title"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date *</label>
              <input required type="date" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time *</label>
              <input required type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capacity *</label>
              <input required type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location *</label>
              <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="Google Meet or Venue"
                className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description *</label>
            <textarea required rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What is this event about?"
              className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-gray-100 px-6 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 active:scale-95">
              {creating ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400 font-bold uppercase tracking-widest text-xs">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading records...
        </div>
      ) : (
        <DataTable title="All Scheduled Events" columns={columns} data={events} onSearch={() => {}} />
      )}
    </div>
  );
}