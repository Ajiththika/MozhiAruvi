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
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <button onClick={onCancel} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all resize-none"
          />
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
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
    getTeacherApplications(page, 8, filterParam as any)
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
      header: "Applicant",
      accessorKey: "fullName",
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-gray-800 text-sm">{row.fullName}</span>
          <span className="text-xs text-gray-500">{row.userId?.email}</span>
        </div>
      ),
    },
    {
      header: "Specialization",
      accessorKey: "specialization",
      cell: (row) => (
        <span className="text-xs font-semibold text-gray-600 truncate max-w-[140px] block">
          {row.specialization || "—"}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Reviewed",
      accessorKey: "reviewedAt",
      cell: (row) => (
        <span className="text-xs text-gray-500">
          {row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString("en-GB") : "Awaiting"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) =>
        row.status === "pending" || row.status === "needs_revision" ? (
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => handleApprove(row._id)}
              isLoading={actioning === row._id}
              variant="secondary"
              size="sm"
              className="flex items-center gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            >
              <CheckCircle2 size={12} /> Approve
            </Button>
            {row.status === "pending" && (
              <Button
                onClick={() => setModal({ type: "revision", id: row._id })}
                disabled={actioning === row._id}
                variant="outline"
                size="sm"
                className="flex items-center gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50"
              >
                <MessageSquare size={12} /> Revise
              </Button>
            )}
            <Button
              onClick={() => setModal({ type: "reject", id: row._id })}
              disabled={actioning === row._id}
              variant="danger"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <XCircle size={12} /> Reject
            </Button>
          </div>
        ) : (
          <StatusBadge status={row.status} />
        ),
    },
  ];

  return (
    <>
      {/* Action modals */}
      {modal?.type === "reject" && (
        <ActionModal
          title="Reject Application"
          label="Reason for rejection"
          placeholder="Explain why this application is being rejected..."
          onConfirm={handleReject}
          onCancel={() => setModal(null)}
          isLoading={actioning === modal.id}
          confirmVariant="danger"
        />
      )}
      {modal?.type === "revision" && (
        <ActionModal
          title="Request Revision"
          label="Revision notes for applicant"
          placeholder="Describe what needs to be updated or clarified..."
          onConfirm={handleRevision}
          onCancel={() => setModal(null)}
          isLoading={actioning === modal.id}
          confirmVariant="secondary"
        />
      )}

      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-secondary" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-800 uppercase tracking-tight">Teacher Applications</h1>
            <p className="mt-2 text-gray-500 font-medium">Review, approve, or reject teacher applications from users.</p>
          </div>
          <Button
            onClick={() => load(currentPage)}
            isLoading={loading}
            variant="outline"
            size="md"
            className="text-xs font-black uppercase tracking-widest"
          >
            Refresh Data
          </Button>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === tab.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white border border-gray-100 text-gray-600 hover:border-primary hover:text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold">
            <AlertCircle className="h-5 w-5 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Fetching applications…</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-[2.5rem] border border-dashed border-gray-100 bg-white shadow-xl shadow-gray-200/5 items-center">
             <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="h-10 w-10 text-gray-200" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 uppercase tracking-tight mb-2">No applications found</h3>
             <p className="text-gray-500 font-medium max-w-sm">There are no teacher applications matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
              {applications.map((app) => (
                <div key={app._id} className="group relative flex flex-col rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-2xl bg-primary/5 flex items-center justify-center ring-4 ring-primary/5 border border-primary/10 overflow-hidden shrink-0 shadow-inner group-hover:ring-primary/20 transition-all">
                           <span className="text-3xl font-black text-primary">{(app.userId?.name || app.fullName).charAt(0)}</span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-black text-gray-800 leading-tight group-hover:text-primary transition-colors truncate">
                            {app.userId?.name || app.fullName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                             <StatusBadge status={app.status} />
                          </div>
                          <p className="text-[10px] font-bold text-primary tracking-widest uppercase mt-2">
                            {app.specialization || "Teacher Aspirant"}
                          </p>
                        </div>
                      </div>
                      
                      {app.hourlyRate && (
                        <div className="text-right flex flex-col items-end shrink-0">
                           <span className="text-2xl font-black text-gray-800 leading-none">${app.hourlyRate}</span>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">per class</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                       {app.teachingMode && (
                        <span className="rounded-lg bg-sky-50 px-3 py-1.5 text-[10px] font-bold text-sky-700 border border-sky-100 flex items-center gap-1.5 uppercase tracking-widest">
                           <Globe className="w-3 h-3" />
                           {app.teachingMode}
                        </span>
                       )}
                       {app.languages && app.languages.length > 0 && (
                        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 flex items-center gap-1.5 uppercase tracking-widest">
                           Speaks: {app.languages.join(", ")}
                        </span>
                       )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-6 border-y border-gray-100 border-dashed">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applied On</p>
                          <p className="text-xs font-bold text-gray-700">{new Date(app.createdAt).toLocaleDateString("en-GB")}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applicant Email</p>
                          <p className="text-xs font-bold text-primary truncate">{app.userId?.email || "N/A"}</p>
                       </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {(app.status === "pending" || app.status === "needs_revision") ? (
                        <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => handleApprove(app._id)}
                            isLoading={actioning === app._id}
                            className="w-full rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 text-[10px] font-black uppercase tracking-[0.2em] py-4 flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={14} /> Approve Applicant
                          </Button>
                          <div className="flex gap-3">
                            {app.status === "pending" && (
                              <Button
                                onClick={() => setModal({ type: "revision", id: app._id })}
                                disabled={actioning === app._id}
                                variant="outline"
                                className="flex-1 rounded-2xl text-orange-600 border-orange-200 hover:bg-orange-50 text-[10px] font-black uppercase tracking-widest py-4 flex items-center justify-center gap-2"
                              >
                                <MessageSquare size={14} /> Revise
                              </Button>
                            )}
                            <Button
                              onClick={() => setModal({ type: "reject", id: app._id })}
                              disabled={actioning === app._id}
                              variant="danger"
                              className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest py-4 flex items-center justify-center gap-2"
                            >
                              <XCircle size={14} /> Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                           <div className="flex items-center gap-2">
                              {app.status === 'approved' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Application {app.status}</p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-gray-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
