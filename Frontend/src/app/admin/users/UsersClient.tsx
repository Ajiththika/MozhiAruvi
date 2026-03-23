"use client";

import React, { useEffect, useState } from "react";
import { DataTable, ColumnDef } from "@/components/admin/DataTable";
import { Loader2, AlertCircle, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, RefreshCw, Edit2, X, Save } from "lucide-react";
import {
  getAllUsers,
  deactivateUser,
  activateUser,
  updateUserAdmin,
  BaseUser,
} from "@/services/adminService";
import { Pagination } from "@/components/Pagination";

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

export default function UsersClient() {
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<BaseUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BaseUser>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = (page: number = 1) => {
    setLoading(true);
    getAllUsers(page)
      .then((res) => {
        setUsers(res.users);
        setTotalPages(res.totalPages);
        setTotalItems(res.totalItems);
        setCurrentPage(res.currentPage);
      })
      .catch(() => setError("Could not load users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(currentPage); }, [currentPage]);

  const handleToggle = async (user: BaseUser) => {
    setActioning(user._id);
    try {
      const updated = user.isActive
        ? await deactivateUser(user._id)
        : await activateUser(user._id);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update user status");
    } finally {
      setActioning(null);
    }
  };

  const handleEditOpen = (user: BaseUser) => {
    setEditingUser(user);
    setEditFormData({ ...user });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ 
      ...prev, 
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value 
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      const updated = await updateUserAdmin(editingUser._id, editFormData);
      setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
      setEditingUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<BaseUser>[] = [
    {
      header: "User",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <ShieldCheck className="h-4 w-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <ShieldAlert className="h-4 w-4" /> Suspended
          </span>
        ),
    },
    {
      header: "Actions",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => handleEditOpen(row)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Edit2 size={12} /> Edit
          </button>
          
          {row.role !== "admin" && (
            <button
              onClick={() => handleToggle(row)}
              disabled={actioning === row._id}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                row.isActive
                  ? "border-red-200 text-red-600 hover:bg-red-50"
                  : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
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
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-100 pb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="h-1.5 w-6 rounded-full bg-mozhi-secondary" />
              <span className="text-[10px] font-black text-mozhi-secondary uppercase tracking-[0.3em]">Administrator</span>
           </div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">User Database</h1>
           <p className="mt-2 text-slate-500 font-medium">View, edit, or suspend student and tutor accounts.</p>
        </div>
        <button
          onClick={() => load(currentPage)}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-100 px-4 py-3 text-sm text-red-700 font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
        </div>
      ) : (
        <div className="space-y-6">
           <DataTable title={`All Registered Users (${totalItems})`} columns={columns} data={users} />
           <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
           />
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Profile: {editingUser.name}</h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input 
                    name="name" 
                    value={editFormData.name || ""} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Role</label>
                  <select 
                    name="role" 
                    value={editFormData.role || "user"} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none bg-white font-medium" 
                  >
                    <option value="user">Student</option>
                    <option value="teacher">Tutor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                  <input 
                    name="phoneNumber" 
                    value={editFormData.phoneNumber || ""} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Country</label>
                  <input 
                    name="country" 
                    value={editFormData.country || ""} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Age</label>
                  <input 
                    type="number"
                    name="age" 
                    value={editFormData.age || ""} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Gender</label>
                  <select 
                    name="gender" 
                    value={editFormData.gender || ""} 
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none bg-white" 
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Bio / About</label>
                <textarea 
                  name="bio" 
                  rows={3}
                  value={editFormData.bio || ""} 
                  onChange={handleEditChange}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                ></textarea>
              </div>

              {editFormData.role === "teacher" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Specialization</label>
                    <input 
                      name="specialization" 
                      value={editFormData.specialization || ""} 
                      onChange={handleEditChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Experience</label>
                    <input 
                      name="experience" 
                      value={editFormData.experience || ""} 
                      onChange={handleEditChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>
              )}
              
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-primary px-6 py-2 rounded-lg text-sm font-bold text-white shadow-md hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
