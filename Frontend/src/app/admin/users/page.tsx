"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Loader2, AlertCircle, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import {
  getAllUsers,
  deactivateUser,
  activateUser,
  BaseUser,
} from "@/services/adminService";

function RoleBadge({ role }: { role: BaseUser["role"] }) {
  const map: Record<string, string> = {
    user: "bg-mozhi-light text-blue-800 dark:bg-mozhi-primary/20 dark:text-mozhi-secondary",
    teacher: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-500",
    admin: "bg-mozhi-light text-purple-800 dark:bg-purple-900/40 dark:text-mozhi-secondary",
  };
  const labelMap: Record<string, string> = { user: "Student", teacher: "Tutor", admin: "Admin" };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${map[role] ?? ""}`}>
      {labelMap[role] ?? role}
    </span>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch(() => setError("Could not load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (user: BaseUser) => {
    setActioning(user._id);
    try {
      const updated = user.isActive
        ? await deactivateUser(user._id)
        : await activateUser(user._id);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch {
      // toast here
    } finally {
      setActioning(null);
    }
  };

  const columns: ColumnDef<BaseUser>[] = [
    {
      header: "User",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate- font-bold text-slate- dark:bg-slate- dark:text-slate-">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate- dark:text-slate- text-sm">{row.name}</p>
            <p className="text-xs text-slate- dark:text-slate-">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessorKey: "role",
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-500">
            <ShieldCheck className="h-4 w-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
            <ShieldAlert className="h-4 w-4" /> Suspended
          </span>
        ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) =>
        row.role !== "admin" ? (
          <button
            onClick={() => handleToggle(row)}
            disabled={actioning === row._id}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
              row.isActive
                ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
            }`}
          >
            {actioning === row._id ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : row.isActive ? (
              <><XCircle className="h-3 w-3" /> Suspend</>
            ) : (
              <><CheckCircle2 className="h-3 w-3" /> Activate</>
            )}
          </button>
        ) : (
          <span className="text-xs text-slate-">Protected</span>
        ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate- dark:text-slate-">
            User Database 👥
          </h2>
          <p className="mt-1 text-slate- dark:text-slate-">
            View, activate, or suspend student and tutor accounts.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate- bg-white px-4 py-2 text-sm font-semibold text-slate- shadow-sm transition hover:bg-slate- disabled:opacity-50 dark:border-slate- dark:bg-slate- dark:text-slate-"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
        </div>
      ) : (
        <DataTable title="All Registered Users" columns={columns} data={users} />
      )}
    </div>
  );
}