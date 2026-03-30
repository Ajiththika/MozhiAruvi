"use client";

import React, { useEffect, useState, Suspense } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Calendar as CalendarIcon, MapPin, Users, Globe2, Trash2, PlusCircle, AlertCircle, Loader2 } from "lucide-react";
import { getEvents, deleteEvent, createEvent, updateEvent, MozhiEvent, CreateEventPayload, getEventById } from "@/services/eventService";
import { useSearchParams, useRouter } from "next/navigation";

const EventStatusBadge = ({ isActive }: { isActive: boolean }) => {
   if (isActive) {
      return <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-500">Active</span>;
   }
   return <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-500">Cancelled / Inactive</span>;
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400 font-bold uppercase tracking-widest text-xs">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading Admin Dashboard...
      </div>
    }>
      <AdminEventsClient />
    </Suspense>
  );
}

function AdminEventsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
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

  // ── Handle external edit param ────────────────────────────────────
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      // If we already have events, find it
      const existing = events.find(e => e._id === editId);
      if (existing) {
        handleEdit(existing);
        // Clear param
        const url = new URL(window.location.href);
        url.searchParams.delete('edit');
        window.history.replaceState({}, '', url.toString());
      } else if (!loading) {
        // Not in list (maybe on another page), fetch it
        getEventById(editId)
          .then(handleEdit)
          .catch(console.error);
        // Clear param
        const url = new URL(window.location.href);
        url.searchParams.delete('edit');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams, events, loading]);

  const fetchEvents = () => {
    setLoading(true);
    getEvents(1, 50)
      .then(res => setEvents(res.events))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleEdit = (event: MozhiEvent) => {
    setForm({
      eventCode: event.eventCode,
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      time: event.time,
      capacity: event.capacity,
      location: event.location,
      image: event.image,
    });
    setEditingId(event._id);
    setShowCreate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      if (editingId) {
        const updated = await updateEvent(editingId, formData);
        setEvents((prev) => prev.map(ev => ev._id === editingId ? updated : ev));
        setEditingId(null);
      } else {
        const created = await createEvent(formData);
        setEvents((prev) => [created, ...prev]);
      }
      setShowCreate(false);
      resetForm();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to process event.");
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setForm({ eventCode: "", title: "", description: "", date: "", time: "", capacity: 20, location: "Online (Google Meet)" });
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This will deactivate it for all users.")) return;
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
    // ... columns ...
    {
      header: "Event",
      accessorKey: "title",
      cell: (row) => (
         <div className="flex flex-col text-left">
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
         <div className="flex items-center gap-1.5 text-sm font-medium text-primary dark:text-secondary">
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
         <div className="flex justify-end gap-3">
            <button
              onClick={() => handleEdit(row)}
              className="text-sm font-bold text-gray-400 hover:text-primary transition inline-flex items-center gap-1 uppercase tracking-widest text-[10px]"
            >
               Edit
            </button>
            <button
              onClick={() => handleDelete(row._id)}
              disabled={deletingId === row._id}
              className="text-sm font-bold text-red-600 hover:text-red-500 transition inline-flex items-center gap-1 disabled:opacity-40 uppercase tracking-widest text-[10px]"
            >
               <Trash2 className="w-3.5 h-3.5" /> {deletingId === row._id ? 'Deleting...' : 'Delete'}
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
              <span className="h-1.5 w-6 rounded-full bg-secondary" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Administrator</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tight">Events Moderation</h1>
           <p className="mt-2 text-gray-500 font-medium">Monitor and create community events.</p>
        </div>
        <button
          onClick={() => {
            if (showCreate) {
              setEditingId(null);
              setForm({ eventCode: "", title: "", description: "", date: "", time: "", capacity: 20, location: "Online (Google Meet)" });
            }
            setShowCreate(!showCreate);
          }}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start animate-in slide-in-from-top-4 duration-500">
          {/* Left Side: Interactive Form */}
          <form onSubmit={handleCreate} className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl shadow-primary/5 p-8 space-y-8">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary" />
            
            <div className="flex flex-col space-y-1">
              <h3 className="text-xl font-black text-gray-800 tracking-tight">{editingId ? 'Edit Event' : 'New Event'}</h3>
              <p className="text-xs font-medium text-gray-500">Fill in the details to update the community.</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Event Code</label>
                  <input required value={form.eventCode} onChange={e => setForm(f => ({ ...f, eventCode: e.target.value.toUpperCase() }))}
                    placeholder="E.g., ADM-01"
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Capacity</label>
                  <input required type="number" min={1} value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Event Title</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Enter a catchy title..."
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Date</label>
                  <input required type="date" min={today} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Time</label>
                  <input required type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Location</label>
                <input required value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="Online (Google Meet) or venue"
                  className="w-full rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Event Banner</label>
                <div className="relative group overflow-hidden rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all p-3">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm">
                      <PlusCircle className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">{selectedFile ? selectedFile.name : "Select cover image"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                <textarea required rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Tell us about the event..."
                  className="w-full resize-none rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all focus:bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
              <button type="button" onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }} 
                 className="rounded-xl px-5 py-2.5 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={creating} 
                 className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2">
                 {creating && <Loader2 className="w-3 h-3 animate-spin" />}
                {creating ? "Processing..." : (editingId ? "Update" : "Publish")}
              </button>
            </div>
          </form>

          {/* Right Side: Live Preview Card (Matching Model UI) */}
          <div className="hidden lg:sticky lg:top-8 lg:flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">Live Preview</span>
            
            <div className="w-full max-w-[400px] overflow-hidden rounded-[40px] border border-gray-100 bg-white shadow-2xl shadow-primary/10 animate-in fade-in zoom-in-95 duration-700">
              {/* Card Header (Image/Banner) */}
              <div className="relative aspect-[10/9] bg-[#f8f9fa] flex items-center justify-center p-12 overflow-hidden">
                {previewUrl || (form as any).image ? (
                  <img src={previewUrl || (form as any).image} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-10">
                    <h2 className="text-6xl font-black tracking-tighter text-gray-900">MOZHI</h2>
                  </div>
                )}
                
                {/* Badge Overlay */}
                <div className="absolute top-8 left-8 shadow-2xl shadow-black/10">
                   <div className="bg-white rounded-full px-5 py-2 text-[10px] font-black text-gray-700 uppercase tracking-widest border border-gray-50/50">
                      Community Event
                   </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-10 space-y-8">
                <h2 className="text-3xl font-black text-[#1a1a1a] tracking-tight leading-tight">
                  {form.title || "Your Event Title"}
                </h2>

                <div className="space-y-6">
                  {/* Date */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#eff2ff] text-[#4d69ff]">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      {form.date || "2026-04-14"}
                    </span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#e8fff3] text-[#00c566]">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      {form.time || "18:00"}
                    </span>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#fff7ef] text-[#ff8c39]">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-600">
                      1 / {form.capacity || "50"} joined
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[#f5f7f9] text-[#78829d]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-500 font-medium">
                      {form.location || "Online Zoom Session"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Preview updates in real-time</p>
          </div>
        </div>
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
