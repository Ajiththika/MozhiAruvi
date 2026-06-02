"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllMappings, deleteMapping } from "@/services/bookingService";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, User, GraduationCap, Calendar, Clock, BadgeCheck, AlertCircle, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminMappingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [pendingDelete, setPendingDelete] = React.useState<any | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "mappings"],
    queryFn: getAllMappings,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMapping(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "mappings"] });
      setPendingDelete(null);
      toast("Mapping removed successfully.", "success");
    },
    onError: (err: any) => {
      toast(err?.response?.data?.message || "Failed to remove mapping.", "error");
    },
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
    {
        header: "Actions",
        accessorKey: "_id",
        className: "text-right",
        cell: (row) => (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPendingDelete(row)}
              title="Remove mapping"
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-100 hover:border-red-200 active:scale-95"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
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

      {/* Delete Confirmation Modal */}
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/25 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !deleteMutation.isPending && setPendingDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2.5 w-full bg-red-500" />
            <div className="p-9 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100">
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Remove Mapping</h3>
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mt-0.5">This cannot be undone</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !deleteMutation.isPending && setPendingDelete(null)}
                  className="p-2 rounded-xl text-slate-300 hover:bg-slate-50 hover:text-slate-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                Remove the connection between{" "}
                <span className="font-black text-slate-800">{pendingDelete.tutorId?.name || "Deleted Tutor"}</span>{" "}
                and{" "}
                <span className="font-black text-slate-800">{pendingDelete.studentId?.name || "Deleted Student"}</span>?
                It will no longer appear in this audit.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(pendingDelete._id)}
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white bg-red-500 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Removing...</>
                  ) : (
                    <><Trash2 className="h-4 w-4" /> Yes, Remove</>
                  )}
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => setPendingDelete(null)}
                  className="flex-1 py-4 rounded-2xl border-2 border-slate-100 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
