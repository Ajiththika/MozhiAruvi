"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllMappings } from "@/services/bookingService";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, User, GraduationCap, Calendar, Clock, BadgeCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminMappingsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "mappings"],
    queryFn: getAllMappings,
  });

  const mappings = data?.mappings || [];

  const columns: ColumnDef<any>[] = [
    {
      header: "Teacher / Mentor",
      accessorKey: "tutorId",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="h-10 w-10 rounded-xl bg-secondary/5 flex items-center justify-center border border-secondary/10">
            <GraduationCap className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 tracking-tight">{row.tutorId?.name || "Deleted Tutor"}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.tutorId?.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Linked Student",
      accessorKey: "studentId",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 tracking-tight">{row.studentId?.name || "Deleted Student"}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.studentId?.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Connection Date",
      accessorKey: "date",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span className="text-xs font-bold text-slate-600">
            {new Date(row.date).toLocaleDateString()}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
          row.status === 'completed' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
          row.status === 'confirmed' ? "bg-blue-50 border-blue-100 text-blue-600" :
          "bg-amber-50 border-amber-100 text-amber-600"
        )}>
          {row.status === 'completed' ? <BadgeCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {row.status}
        </div>
      ),
    },
    {
        header: "Payment",
        accessorKey: "paymentStatus",
        cell: (row) => (
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            row.paymentStatus === 'paid' ? "text-emerald-500" : "text-slate-300"
          )}>
            {row.paymentStatus || 'unpaid'}
          </span>
        ),
      },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="h-1.5 w-6 rounded-full bg-secondary" />
              <span className="text-[10px] font-black text-secondary/60 uppercase tracking-[0.3em]">Network Audit</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Teacher-Student Mappings</h1>
           <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl">
              Audit the connections between mentors and learners across the platform. View active bookings and instructional assignments.
           </p>
        </div>
      </div>

      {isError && (
        <div className="p-10 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-center gap-3">
           <AlertCircle className="text-red-500 h-6 w-6" />
           <p className="text-red-500 font-black uppercase tracking-widest text-xs">Failed to load platform mappings.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-secondary/20" />
           <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest">Scanning Network...</p>
        </div>
      ) : mappings.length > 0 ? (
        <DataTable 
          title="Instructional Links" 
          columns={columns} 
          data={mappings} 
        />
      ) : (
        <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
           <h3 className="text-xl font-black text-slate-800 tracking-tight">No mappings found</h3>
           <p className="text-slate-500 font-medium mt-2">Instructional assignments will appear here once students book mentors.</p>
        </div>
      )}
    </div>
  );
}
