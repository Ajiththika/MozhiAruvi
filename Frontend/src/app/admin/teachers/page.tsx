"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Loader2, AlertCircle, CheckCircle2, XCircle, RefreshCw, MessageSquare } from "lucide-react";
import {
  getTeacherApplications,
  approveTeacherApplication,
  rejectTeacherApplication,
  requestRevisionTeacherApplication,
  TeacherApplication,
} from "@/services/adminService";

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

import { Pagination } from "@/components/Pagination";

export default function AdminTeachersPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = (page: number = 1) => {
    setLoading(true);
    getTeacherApplications(page)
      .then((res) => {
        setApplications(res.applications);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
        setCurrentPage(res.currentPage);
      })
      .catch(() => setError("Could not load applications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(currentPage); }, [currentPage]);

  const mutate = (updated: TeacherApplication) =>
    setApplications((prev) => prev.map((a) => (a._id === updated._id ? updated : a)));

  const handleApprove = async (id: string) => {
    setActioning(id);
    try { mutate(await approveTeacherApplication(id)); }
    catch { /* toast */ }
    finally { setActioning(null); }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection (optional):");
    setActioning(id);
    try { mutate(await rejectTeacherApplication(id, reason ?? "")); }
    catch { /* toast */ }
    finally { setActioning(null); }
  };

  const handleRevision = async (id: string) => {
    const reason = prompt("What needs to be revised?");
    if (!reason) return;
    setActioning(id);
    try { mutate(await requestRevisionTeacherApplication(id, reason)); }
    catch { /* toast */ }
    finally { setActioning(null); }
  };

  const columns: ColumnDef<TeacherApplication>[] = [
    {
      header: "Applicant",
      accessorKey: "fullName",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-600 dark:text-slate-600 text-sm">{row.fullName}</span>
          <span className="text-xs text-slate-600 dark:text-slate-600">{row.userId?.email}</span>
        </div>
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
        <span className="text-xs text-slate-600 dark:text-slate-600">
          {row.reviewedAt ? new Date(row.reviewedAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) =>
        row.status === "pending" ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleApprove(row._id)}
              disabled={actioning === row._id}
              className="flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
            >
              {actioning === row._id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
              Approve
            </button>
            <button
              onClick={() => handleRevision(row._id)}
              disabled={actioning === row._id}
              className="flex items-center gap-1 rounded-lg border border-orange-200 px-2.5 py-1.5 text-xs font-bold text-orange-700 transition hover:bg-orange-50 disabled:opacity-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950/20"
            >
              <MessageSquare className="h-3 w-3" /> Revise
            </button>
            <button
              onClick={() => handleReject(row._id)}
              disabled={actioning === row._id}
              className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
            >
              <XCircle className="h-3 w-3" /> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-600 capitalize">{row.status.replace("_", " ")}</span>
        ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-600 dark:text-slate-600">
            Teacher Applications 🎓
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-600">
            Approve, reject, or request revisions on teacher applications.
          </p>
        </div>
        <button
          onClick={() => load(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-200 dark:bg-slate-50 dark:text-slate-600"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700 font-bold dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
        </div>
      ) : (
        <div className="space-y-6">
           <DataTable title={`All Teacher Applications (${totalItems})`} columns={columns} data={applications} />
           <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
           />
        </div>
      )}
    </div>
  );
}