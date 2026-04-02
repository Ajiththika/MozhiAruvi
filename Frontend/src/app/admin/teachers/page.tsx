"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { Loader2, AlertCircle, CheckCircle2, XCircle, MessageSquare, X, RefreshCw, GraduationCap, Globe } from "lucide-react";
import {
  getTeacherApplications,
  approveTeacherApplication,
  rejectTeacherApplication,
  requestRevisionTeacherApplication,
  TeacherApplication,
} from "@/services/adminService";
import { Pagination } from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    needs_revision: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    needs_revision: "Needs Revision",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${map[status] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ── Action Modal ──────────────────────────────────────────────────────────────

interface ActionModalProps {
  title: string;
  label: string;
  placeholder: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  confirmVariant?: "danger" | "secondary";
}

function ActionModal({ title, label, placeholder, onConfirm, onCancel, isLoading, confirmVariant = "danger" }: ActionModalProps) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">{title}</h3>
          <button onClick={onCancel} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            variant={confirmVariant}
            isLoading={isLoading}
            onClick={() => onConfirm(reason)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "needs_revision";

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Needs Revision", value: "needs_revision" },
];

export default function AdminTeachersPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Modal state
  type ModalType = "reject" | "revision" | null;
  const [modal, setModal] = useState<{ type: ModalType; id: string } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = (page: number = 1) => {
    setLoading(true);
    const filterParam = statusFilter === "all" ? undefined : statusFilter;
    getTeacherApplications(page, 6, filterParam as any)
      .then((res) => {
        setApplications(res.applications);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
        setCurrentPage(res.currentPage);
      })
      .catch(() => setError("Could not load applications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);
  useEffect(() => { load(currentPage); }, [currentPage, statusFilter]);

  const mutate = (updated: TeacherApplication) =>
    setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));

  const handleApprove = async (id: string) => {
    setActioning(id);
    try { mutate(await approveTeacherApplication(id)); }
    catch (e: any) { setError(e.response?.data?.message || "Failed to approve."); }
    finally { setActioning(null); }
  };

  const handleReject = async (reason: string) => {
    if (!modal) return;
    setActioning(modal.id);
    try {
      mutate(await rejectTeacherApplication(modal.id, reason));
      setModal(null);
    } catch (e: any) { setError(e.response?.data?.message || "Failed to reject."); }
    finally { setActioning(null); }
  };

  const handleRevision = async (notes: string) => {
    if (!modal) return;
    setActioning(modal.id);
    try {
      mutate(await requestRevisionTeacherApplication(modal.id, notes));
      setModal(null);
    } catch (e: any) { setError(e.response?.data?.message || "Failed to request revision."); }
    finally { setActioning(null); }
  };

  const columns: ColumnDef<TeacherApplication>[] = [
    {
      header: "Applicant Identity",
      accessorKey: "fullName",
      cell: (row) => (
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 font-black text-orange-600 text-lg border border-orange-100 shadow-inner uppercase tracking-tighter shrink-0">
            {(row.userId?.name || row.fullName).charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-800 text-sm tracking-tight truncate">{row.userId?.name || row.fullName}</p>
            <p className="text-[10px] font-medium text-slate-400 truncate">{row.userId?.email || "Email undisclosed"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: "specialization",
      cell: (row) => (
        <div className="flex flex-col">
           <span className="text-xs font-bold text-slate-700">{row.specialization || "Teacher Aspirant"}</span>
           <span className="text-[10px] text-slate-400 font-medium italic">{(row.languages || []).join(", ")}</span>
        </div>
      )
    },
    {
      header: "Application Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
       header: "System Logic",
       accessorKey: "_id",
       className: "text-right",
       cell: (row) => (
          <div className="flex items-center justify-end gap-3">
             {(row.status === "pending" || row.status === "needs_revision") ? (
               <>
                 <Button
                   onClick={() => handleApprove(row._id)}
                   isLoading={actioning === row._id}
                   variant="secondary"
                   size="sm"
                   className="text-[10px] uppercase font-black px-4 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
                 >
                   Empower
                 </Button>
                 {row.status === "pending" && (
                   <Button
                     onClick={() => setModal({ type: "revision", id: row._id })}
                     disabled={actioning === row._id}
                     variant="outline"
                     size="sm"
                     className="text-[10px] uppercase font-black px-4"
                   >
                     Revise
                   </Button>
                 )}
                 <Button
                   onClick={() => setModal({ type: "reject", id: row._id })}
                   disabled={actioning === row._id}
                   variant="danger"
                   size="sm"
                   className="text-[10px] uppercase font-black px-4"
                 >
                   Reject
                 </Button>
               </>
             ) : (
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-4">Locked • Records Final</span>
             )}
          </div>
       )
    }
  ];

  return (
    <>
      {/* Action modals (Reject/Revision) kept as before */}
      {modal?.type === "reject" && (
        <ActionModal
          title="Archive Logic: Permanent Rejection"
          label="Detailed justification"
          placeholder="Document why this application is unsuitable for theMozhiAruvi mentor pool..."
          onConfirm={handleReject}
          onCancel={() => setModal(null)}
          isLoading={actioning === modal.id}
          confirmVariant="danger"
        />
      )}
      {modal?.type === "revision" && (
        <ActionModal
          title="Review Feedback: Revision Requested"
          label="Required procedural updates"
          placeholder="Describe which credentials or profile details need fortification..."
          onConfirm={handleRevision}
          onCancel={() => setModal(null)}
          isLoading={actioning === modal.id}
          confirmVariant="secondary"
        />
      )}

      <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-10 lg:py-16">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="h-2 w-12 rounded-full bg-orange-400" />
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em]">Validation Authority</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">Teacher Applications</h1>
            <p className="text-lg text-slate-500 font-medium max-w-xl">Audit and orchestrate the expansion of the MozhiAruvi linguistic fleet by validating new mentor credentials.</p>
          </div>
          <Button
            onClick={() => load(currentPage)}
            isLoading={loading}
            variant="outline"
            size="lg"
            className="uppercase tracking-widest text-[10px] font-black px-10 border-2"
          >
            Refresh Records
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-3">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${
                statusFilter === tab.value
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/10 scale-105"
                  : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50/50 p-8 text-sm text-red-600">
             <AlertCircle className="h-6 w-6 shrink-0" /> <span className="font-bold">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-8 bg-white rounded-[3rem] border border-dashed border-slate-100 shadow-sm">
            <div className="h-16 w-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin shadow-xl ring-4 ring-orange-500/5 text-center" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Requesting secure data from node...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center rounded-[3rem] border border-dashed border-slate-100 bg-white shadow-xl shadow-slate-200/5 transition-all">
             <div className="h-24 w-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-12">
                <GraduationCap className="h-12 w-12 text-slate-200 -rotate-12" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-3">Clearance Secured</h3>
             <p className="text-slate-400 font-bold max-w-sm">No linguistic applications match your current filtration logic. All records are processed.</p>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
            <DataTable title={`Linguistic Fleet Intelligence (${totalItems} entities)`} columns={columns} data={applications} />
            <div className="pt-10 border-t border-slate-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}



