"use client";

import React from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Calendar as CalendarIcon, MapPin, Users, Globe2 } from "lucide-react";

interface AdminEventRow {
  id: string;
  title: string;
  host: string;
  type: string;
  dateStr: string;
  attendees: number;
  status: "published" | "draft" | "completed" | "cancelled";
}

const mockEventsData: AdminEventRow[] = [
  { id: "EVT-101", title: "Beginner Tamil Meetup", host: "Maya S.", type: "Meetup", dateStr: "2026-10-24 10:00 AM", attendees: 12, status: "published" },
  { id: "EVT-102", title: "Literature Workshop", host: "Arun P.", type: "Workshop", dateStr: "2026-11-02 11:00 AM", attendees: 34, status: "published" },
  { id: "EVT-103", title: "Grammar Deep Dive", host: "Karthik R.", type: "Webinar", dateStr: "2026-09-15 05:00 PM", attendees: 100, status: "completed" },
  { id: "EVT-104", title: "Inappropriate Content", host: "Suspended User", type: "Meetup", dateStr: "2026-12-01 08:00 AM", attendees: 0, status: "cancelled" },
];

const EventStatusBadge = ({ status }: { status: AdminEventRow["status"] }) => {
   switch (status) {
      case "published":
         return <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-500">Published</span>;
      case "draft":
         return <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-500">Draft</span>;
      case "completed":
         return <span className="inline-flex rounded-full bg-mozhi-light px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary">Completed</span>;
      case "cancelled":
         return <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-500">Cancelled</span>;
   }
}

export default function AdminEventsPage() {
  const columns: ColumnDef<AdminEventRow>[] = [
    {
      header: "Event",
      accessorKey: "title",
      cell: (row) => (
         <div className="flex flex-col">
            <span className="font-bold text-slate- dark:text-slate-">{row.title}</span>
            <span className="flex items-center gap-1 text-xs text-slate- dark:text-slate- mt-0.5">
               <Globe2 className="h-3 w-3" /> {row.type}
            </span>
         </div>
      ),
    },
    { header: "Host Tutor", accessorKey: "host", cell: (row) => <span className="text-sm font-medium text-slate- dark:text-slate-">{row.host}</span> },
    {
      header: "Schedule",
      accessorKey: "dateStr",
      cell: (row) => (
         <div className="flex items-center gap-1.5 text-sm text-slate- dark:text-slate-">
            <CalendarIcon className="h-4 w-4" /> {row.dateStr}
         </div>
      )
    },
    {
      header: "Attendees",
      accessorKey: "attendees",
      cell: (row) => (
         <div className="flex items-center gap-1.5 text-sm font-medium text-mozhi-primary dark:text-mozhi-secondary">
            <Users className="h-4 w-4" /> {row.attendees} registered
         </div>
      )
    },
    { header: "Status", accessorKey: "status", cell: (row) => <EventStatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessorKey: "id",
      className: "text-right",
      cell: (row) => (
         <div className="flex justify-end gap-2">
            <button className="text-sm font-semibold text-slate- hover:text-slate- dark:text-slate- dark:hover:text-slate- transition">Inspect</button>
            {row.status === "published" && (
               <button className="text-sm font-semibold text-red-600 hover:text-red-500 dark:text-red-500 transition ml-2">Cancel</button>
            )}
         </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
          Platform Events Moderation 📅
        </h2>
        <p className="mt-1 text-slate- dark:text-slate-">
          Monitor public community events hosted by tutors to ensure guidelines are followed.
        </p>
      </div>
      <DataTable title="All Scheduled Events" columns={columns} data={mockEventsData} onSearch={() => {}} />
    </div>
  );
}