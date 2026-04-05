"use client";

import React, { useState } from "react";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Mail, Phone, Languages, Calendar, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTutorApplicationsAdmin, approveTutorApplication, rejectTutorApplication } from "@/services/tutorService";
import Button from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
// import { toast } from "react-hot-toast";

export default function TutorApplicationsAdminPage() {
  const [actioning, setActioning] = useState<string | null>(null);

  const { data: applications, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "tutor-applications"],
    queryFn: () => getTutorApplicationsAdmin(),
    staleTime: 5 * 60 * 1000,
  });

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this tutor?")) return;
    setActioning(id);
    try {
      await approveTutorApplication(id);
      alert("Tutor approved successfully!");
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to approve tutor.");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // cancelled
    
    setActioning(id);
    try {
      await rejectTutorApplication(id, reason);
      alert("Tutor application rejected.");
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to reject application.");
    } finally {
      setActioning(null);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      header: "Applicant",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col gap-1 py-2">
          <span className="font-black text-slate-800 text-sm tracking-tight capitalize">{row.name}</span>
          <div className="flex items-center gap-1.5 text-[10px] text-primary/60 font-bold uppercase truncate">
            <Mail className="h-3 w-3 shrink-0" /> {row.email}
          </div>
          {row.phone && (
            <div className="flex items-center gap-1.5 text-[10px] text-primary/60 font-bold uppercase truncate">
              <Phone className="h-3 w-3 shrink-0" /> {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Details",
      accessorKey: "experience",
      cell: (row) => (
        <div className="max-w-md space-y-2 py-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Experience</span>
            <p className="text-xs text-slate-700 line-clamp-2">{row.experience}</p>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1">Bio</span>
            <p className="text-xs text-slate-600 line-clamp-2">{row.bio}</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <Languages className="h-3 w-3 text-primary/40" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{row.languages?.join(", ") || "No languages specified"}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 text-primary/40" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">{row.availability}</span>
             </div>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <span className={cn(
          "inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm",
          row.status === "approved" ? "text-green-600 bg-green-50 border-green-100" :
          row.status === "rejected" ? "text-red-600 bg-red-50 border-red-100" :
          "text-yellow-600 bg-yellow-50 border-yellow-100"
        )}>
          {row.status === "pending" ? <Hourglass className="h-3 w-3" /> : (row.status === "approved" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />)}
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-3 px-2">
          {row.status === "pending" && (
            <>
              <Button
                onClick={() => handleApprove(row._id)}
                disabled={actioning === row._id}
                className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-black uppercase tracking-widest h-9 px-5 rounded-xl shadow-lg shadow-green-600/20"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleReject(row._id)}
                disabled={actioning === row._id}
                variant="danger"
                className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest h-9 px-5 rounded-xl shadow-lg shadow-red-500/20"
              >
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-10 lg:py-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <span className="h-2 w-12 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Applications Hub</span>
           </div>
           <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none uppercase">Tutor Requests</h1>
           <p className="text-lg text-slate-500 font-medium max-w-xl">Review and manage onboarding requests from potential language experts.</p>
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50/50 p-8 text-sm text-red-600">
          <AlertCircle className="h-6 w-6 shrink-0" /> Failed to load applications. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white rounded-[3rem] border border-dashed border-slate-100">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest animate-pulse">Fetching submission queue...</p>
        </div>
      ) : (
        <DataTable title={`Submission Queue (${applications?.length || 0} entries)`} columns={columns} data={applications || []} />
      )}
    </div>
  );
}
