"use client";

import React, { useState } from "react";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  GraduationCap, 
  Mail, 
  XCircle, 
  AlertTriangle, 
  Ban, 
  CheckCircle2,
  Hourglass,
  Languages,
  Calendar,
  Layers,
  Search,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getAllTutors, 
  BaseUser, 
  warnUser, 
  activateUser, 
  deactivateUser,
  approveTeacherApplication, 
  rejectTeacherApplication,
  getMentorApplications
} from "@/services/adminService";
import { 
  getTutorApplicationsAdmin, 
  approveTutorApplication, 
  rejectTutorApplication as rejectTutorApp 
} from "@/services/tutorService";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import { useQuery } from "@tanstack/react-query";

export default function AdminTutorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);

  // Fetch Directory (Approved Tutors)
  const { 
    data: directoryData, 
    isLoading: isDirectoryLoading, 
    refetch: refetchDirectory 
  } = useQuery({
    queryKey: ["admin", "tutors", currentPage],
    queryFn: () => getAllTutors(currentPage, 10),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch Applications (Combined Queue)
  const { 
    data: applicationsData, 
    isLoading: isAppsLoading, 
    refetch: refetchApps 
  } = useQuery({
    queryKey: ["admin", "tutor-applications-combined"],
    queryFn: async () => {
      const mentors = await getMentorApplications();
      // Service already returns normalized data, but for legacy compatibility we can ensure types
      return mentors.map(m => ({
        ...m,
        name: m.cleanName || m.fullName || m.name || "Unknown",
        email: m.userId?.email || m.email || "N/A",
        experience: m.experience || "N/A",
        bio: m.bio || "N/A",
        languages: m.languages || [],
        status: m.status,
        type: m.type as 'teacher' | 'tutor',
        phone: m.userId?.phoneNumber || m.phone || ""
      }));
    },
    staleTime: 2 * 60 * 1000,
  });

  const handleApprove = async (app: any) => {
    if (!confirm(`Approve ${app.name} as a verified mentor?`)) return;
    setActioning(app._id);
    try {
      if (app.type === 'teacher') {
        await approveTeacherApplication(app._id);
      } else {
        await approveTutorApplication(app._id);
      }
      alert("Application approved! User promoted to Mentor role.");
      refetchApps();
      refetchDirectory();
    } catch (err: any) {
      alert("Failed to approve application.");
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (app: any) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setActioning(app._id);
    try {
      if (app.type === 'teacher') {
        await rejectTeacherApplication(app._id, reason);
      } else {
        await rejectTutorApp(app._id, reason);
      }
      alert("Application rejected.");
      refetchApps();
    } catch (err: any) {
      alert("Failed to reject application.");
    } finally {
      setActioning(null);
    }
  };

  const handleWarn = async (id: string) => {
    setActioning(id);
    try {
      await warnUser(id);
      refetchDirectory();
    } catch (err: any) {
      alert("Failed to issue warning.");
    } finally {
      setActioning(null);
    }
  };

  const handleToggleBlock = async (id: string, currentlyActive: boolean) => {
    setActioning(id);
    try {
      if (currentlyActive) {
        await deactivateUser(id);
      } else {
        await activateUser(id);
      }
      refetchDirectory();
    } catch (err: any) {
      alert("Failed to update status.");
    } finally {
      setActioning(null);
    }
  };

  const appColumns: ColumnDef<any>[] = [
    {
      header: "Applicant",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex flex-col gap-1 py-4">
          <span className="font-black text-text-primary text-sm tracking-tight capitalize">{row.name}</span>
          <div className="flex items-center gap-1.5 text-[10px] text-primary/60 font-bold uppercase truncate">
            <Mail className="h-3 w-3 shrink-0" /> {row.email}
          </div>
          <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border bg-white text-text-primary border-primary/20 shadow-sm whitespace-nowrap">
                 {row.type} request
              </span>
          </div>
        </div>
      ),
    },
    {
      header: "Application Details",
      accessorKey: "experience",
      cell: (row) => (
        <div className="max-w-md space-y-3 py-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-1">Background & Expertise</span>
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{row.experience}</p>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                 <Languages className="h-3 w-3 text-primary/40" />
                 <span className="text-[9px] font-bold text-text-secondary uppercase">{row.languages?.join(", ") || "Native"}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                 <Search className="h-3 w-3 text-primary/40" />
                 <span className="text-[9px] font-bold text-text-secondary uppercase">Reviewing</span>
              </div>
          </div>
        </div>
      ),
    },
    {
      header: "Identity Status",
      accessorKey: "status",
      cell: (row) => (
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border shadow-sm text-yellow-600 bg-yellow-50 border-yellow-100">
            <Hourglass className="h-3 w-3" />
            {row.status}
          </span>
          <span className="text-[9px] font-bold text-primary/30 text-center uppercase tracking-tighter">Needs Decision</span>
        </div>
      ),
    },
    {
      header: "Decision Desk",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-3 px-2">
          <Button
            onClick={() => handleApprove(row)}
            disabled={actioning === row._id}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl shadow-xl shadow-emerald-600/20"
          >
            Approve
          </Button>
          <Button
            onClick={() => handleReject(row)}
            disabled={actioning === row._id}
            variant="danger"
            className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl shadow-xl shadow-red-500/20"
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  const dirColumns: ColumnDef<BaseUser>[] = [
    {
      header: "Verified Identity",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4 py-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 border border-primary/10 font-black text-primary text-lg shadow-sm uppercase tracking-tighter shrink-0">
            {row.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-800 text-sm tracking-tight truncate flex items-center gap-2">
              {row.name}
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-primary/60 font-bold uppercase truncate">
               <Mail className="h-3 w-3 shrink-0" /> {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Trust Score",
      accessorKey: "isActive",
      cell: (row) => (
        <div className="flex flex-col gap-2">
          <span className={cn(
            "inline-flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm w-fit",
            row.isActive 
              ? "text-emerald-500 bg-emerald-50 border-emerald-100" 
              : "text-red-500 bg-red-50 border-red-100"
          )}>
            {row.isActive ? <ShieldCheck className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
            {row.isActive ? "Verified Active" : "Suspended"}
          </span>
          {row.warnings && row.warnings > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[9px] font-black text-amber-500 uppercase tracking-tighter bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 w-fit">
               <AlertTriangle className="h-3 w-3" /> {row.warnings} Warning Nodes
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: "specialization",
      cell: (row) => (
        <div className="flex flex-col gap-1">
           <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{row.specialization || "General Mentor"}</span>
           <div className="flex items-center gap-1.5">
              <Layers className="h-3 w-3 text-primary/20" />
              <span className="text-[10px] text-primary/60 font-bold truncate max-w-[150px]">{row.experience || "Native Speaker"}</span>
           </div>
        </div>
      )
    },
    {
       header: "Control Logic",
       accessorKey: "_id",
       className: "text-right",
       cell: (row) => (
          <div className="flex items-center justify-end gap-3 px-2">
             <Button
               onClick={() => handleWarn(row._id)}
               disabled={actioning === row._id}
               variant="outline"
               size="sm"
               className="h-10 px-5 border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl"
             >
                <AlertTriangle className="h-3.5 w-3.5" />
                Warn
             </Button>
             <Button
               onClick={() => handleToggleBlock(row._id, row.isActive)}
               disabled={actioning === row._id}
               variant={row.isActive ? "danger" : "secondary"}
               size="sm"
               className={cn(
                 "h-10 px-6 text-[10px] font-black uppercase tracking-widest gap-2 shadow-xl transition-all rounded-xl",
                 row.isActive 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
               )}
             >
                {row.isActive ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {row.isActive ? "Deactivate" : "Reactive"}
             </Button>
          </div>
       )
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-10 lg:py-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-b border-slate-100 pb-16">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <span className="h-1 w-16 rounded-full bg-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Mentor Core</span>
           </div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tighter leading-none uppercase">Expert Ecosystem</h1>
           <p className="text-lg text-slate-500 font-medium max-w-2xl leading-relaxed">
             Orchestrate the authenticated network of Tamil language mentors. Review incoming requests and manage verified directory nodes.
           </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => { refetchDirectory(); refetchApps(); }}
            isLoading={isDirectoryLoading || isAppsLoading}
            variant="outline"
            size="lg"
            className="uppercase tracking-widest text-[10px] font-black px-12 border-2 rounded-2xl hover:bg-slate-50 transition-all h-14"
          >
            Sync Intelligence
          </Button>
        </div>
      </div>

      {/* SUBMISSION QUEUE (From image 2 style) */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
           <Hourglass className="h-5 w-5 text-yellow-500" />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Submission Queue</h2>
           <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-[10px] font-black">
              {applicationsData?.length || 0} PENDING NODES
           </span>
        </div>

        {isAppsLoading ? (
            <div className="h-64 rounded-[2.5rem] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
               <Loader2 className="h-12 w-12 text-primary/40 animate-spin" />
               <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">Scanning requests...</p>
            </div>
        ) : applicationsData?.length === 0 ? (
            <div className="rounded-[2.5rem] border border-slate-100 bg-white p-16 text-center shadow-xl shadow-slate-200/20 group hover:border-emerald-100 transition-all">
               <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-xl font-black text-slate-800 uppercase">Queue Synchronized</h3>
               <p className="text-xs font-bold text-primary/40 uppercase mt-2 tracking-widest">All applications have been processed.</p>
            </div>
        ) : (
            <div className="rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200/30">
               <DataTable 
                 title={`Pending Evaluations`} 
                 columns={appColumns} 
                 data={applicationsData || []} 
               />
               <div className="px-10 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Total Sequence Records: {applicationsData?.length}</span>
                  <div className="flex items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time sync active</span>
                  </div>
               </div>
            </div>
        )}
      </div>

      {/* EXPERT DIRECTORY */}
      <div className="space-y-8 pt-10">
        <div className="flex items-center gap-4">
           <GraduationCap className="h-5 w-5 text-emerald-500" />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Expert Directory intelligence</h2>
           <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black lowercase">
              {directoryData?.totalItems || 0} active entries
           </span>
        </div>

        {isDirectoryLoading ? (
            <div className="h-96 rounded-[3rem] bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center gap-4">
               <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        ) : (
            <div className="space-y-12">
               <div className="rounded-[3rem] overflow-hidden border border-slate-100 bg-white shadow-2xl shadow-slate-200/30">
                  <DataTable 
                    title="Authenticated Network Nodes" 
                    columns={dirColumns} 
                    data={directoryData?.tutors || []} 
                  />
                  <div className="px-10 py-10 bg-slate-50 border-t border-slate-100">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={directoryData?.totalPages || 1}
                      onPageChange={setCurrentPage}
                    />
                  </div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
}
