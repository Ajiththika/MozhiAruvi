"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Calendar as CalendarIcon, MapPin, Users, Globe2, Trash2 } from "lucide-react";
import { getEvents, deleteEvent, MozhiEvent } from "@/services/eventService";

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
         <div className="flex items-center gap-1.5 text-sm font-medium text-mozhi-primary dark:text-mozhi-secondary">
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

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-mozhi-secondary" />
              <span className="text-[10px] font-black text-mozhi-secondary uppercase tracking-[0.3em]">Administrator</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tight">Events Moderation</h1>
           <p className="mt-2 text-gray-500 font-medium">Monitor public community events hosted by tutors to ensure guidelines are followed.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading events...</div>
      ) : (
        <DataTable title="All Scheduled Events" columns={columns} data={events} onSearch={() => {}} />
      )}
    </div>
  );
}