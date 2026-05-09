"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTutorStudents } from "@/services/bookingService";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, User, Mail, Calendar, Phone, Globe, Award, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TutorStudentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tutor", "students"],
    queryFn: getTutorStudents,
  });

  const students = data?.students || [];

  const columns: ColumnDef<any>[] = [
    {
      header: "Student",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          {row.profilePhoto ? (
            <img src={row.profilePhoto} alt={row.name} className="h-10 w-10 rounded-xl object-cover border border-slate-100 shadow-sm" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <h4 className="text-sm font-black text-slate-800 tracking-tight">{row.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3 text-slate-300" />
              <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{row.email}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Level",
      accessorKey: "level",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
            {row.level === "Basic" ? "Beginner" : (row.level || "Beginner")}
          </span>
        </div>
      ),
    },
    {
      header: "Origin",
      accessorKey: "country",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Globe className="h-3.5 w-3.5 text-blue-400" />
          <span className="text-xs font-bold text-slate-600">{row.country || "Not Set"}</span>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "phoneNumber",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-xs font-bold text-slate-600">{row.phoneNumber || "No Phone"}</span>
        </div>
      ),
    },
    {
      header: "Last Session",
      accessorKey: "lastSession",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-primary/40" />
          <span className="text-xs font-bold text-slate-600">
            {row.lastSession ? new Date(row.lastSession).toLocaleDateString() : "N/A"}
          </span>
        </div>
      ),
    },
    {
        header: "Actions",
        accessorKey: "_id",
        className: "text-right",
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
             <button className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-primary transition-all border border-slate-100 shadow-sm" title="Message Student">
                <MessageSquare className="h-4 w-4" />
             </button>
          </div>
        ),
      },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="h-1.5 w-6 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Management</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">My Students</h1>
           <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl">
              Manage your active students, view their progress, and stay connected with your Tamil learners.
           </p>
        </div>
      </div>

      {isError && (
        <div className="p-10 bg-red-50 rounded-[2rem] border border-red-100 text-center">
           <p className="text-red-500 font-black uppercase tracking-widest text-xs">Failed to load student records.</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Retrieving your class list...</p>
        </div>
      ) : students.length > 0 ? (
        <DataTable 
          title="Active Learners" 
          columns={columns} 
          data={students} 
        />
      ) : (
        <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
           <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-slate-200" />
           </div>
           <h3 className="text-xl font-black text-slate-800 tracking-tight">No students yet</h3>
           <p className="text-slate-500 font-medium mt-2">When students book a session with you, they'll appear here.</p>
        </div>
      )}
    </div>
  );
}
