"use client";

import React, { useState } from "react";
import DataTable, { ColumnDef } from "@/components/ui/DataTable";
import { Loader2, AlertCircle, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Edit2, User, Globe, Phone, Hash, Users, Calendar, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAllUsers,
  deactivateUser,
  activateUser,
  updateUserAdmin,
  BaseUser,
} from "@/services/adminService";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function RoleBadge({ role }: { role: BaseUser["role"] }) {
  const map: Record<string, string> = {
    student: "bg-primary/5 text-primary border-primary/10",
    teacher: "bg-emerald-50 text-emerald-600 border-emerald-100",
    admin: "bg-purple-50 text-purple-600 border-purple-100",
  };
  const labelMap: Record<string, string> = { student: "Student", teacher: "Tutor", admin: "Admin" };
  
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border", map[role] ?? "")}>
      {labelMap[role] ?? role}
    </span>
  );
}

export default function UsersClient() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [actioning, setActioning] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<BaseUser | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<BaseUser>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "users", currentPage],
    queryFn: () => {
      console.log(`[DEBUG] Fetching admin users... Page: ${currentPage}`);
      return getAllUsers(currentPage);
    },
    staleTime: 2 * 60 * 1000,
  });

  const users = data?.users || [];
  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalItems || 0;

  const handleToggle = async (user: BaseUser) => {
    setActioning(user._id);
    try {
      user.isActive
        ? await deactivateUser(user._id)
        : await activateUser(user._id);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user status");
    } finally {
      setActioning(null);
    }
  };

  const handleEditOpen = (user: BaseUser) => {
    setEditingUser(user);
    setEditFormData({ ...user });
  };

  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    // Handle nested subscription fields
    if (name.startsWith('subscription.')) {
      const field = name.split('.')[1];
      setEditFormData(prev => ({
        ...prev,
        subscription: {
          ...(prev.subscription || { plan: 'FREE', billingCycle: 'none' }),
          [field]: (field === 'tutorSupportUsed' || field === 'eventUsageCount') ? parseInt(value) || 0 : value
        }
      }));
    } else {
      setEditFormData(prev => ({ 
        ...prev, 
        [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value 
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await updateUserAdmin(editingUser._id, editFormData);
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setEditingUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const columns: ColumnDef<BaseUser>[] = [
    {
      header: "User Identity",
      accessorKey: "name",
      cell: (row) => (
        <div className="flex items-center gap-4 py-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10 font-black text-primary text-lg shadow-inner uppercase tracking-tighter">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-slate-800 text-sm tracking-tight">{row.name}</p>
            <p className="text-xs font-medium text-primary/60">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Privilege",
      accessorKey: "role",
      cell: (row) => <RoleBadge role={row.role} />,
    },
    {
      header: "System Status",
      accessorKey: "isActive",
      cell: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <ShieldCheck className="h-4 w-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-50 px-3 py-1 rounded-full border border-red-100">
            <ShieldAlert className="h-4 w-4" /> Suspended
          </span>
        ),
    },
    {
      header: "Active Plan",
      accessorKey: "subscription",
      cell: (row) => (
        <span className={cn(
          "inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border",
          row.subscription?.plan === 'FREE' ? "bg-slate-50 text-primary/60 border-slate-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {row.subscription?.plan || 'FREE'}
        </span>
      ),
    },
    {
      header: "Operations",
      accessorKey: "_id",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-3">
          <Button
            onClick={() => handleEditOpen(row)}
            variant="outline"
            size="sm"
            className="text-[10px] uppercase font-black"
          >
            <Edit2 size={12} className="mr-2" /> Modify
          </Button>
          
          {row.role !== "admin" && (
            <Button
              onClick={() => handleToggle(row)}
              isLoading={actioning === row._id}
              variant={row.isActive ? "danger" : "secondary"}
              size="sm"
              className="text-[10px] uppercase font-black shadow-lg shadow-primary/5"
            >
              {!actioning && (row.isActive ? <XCircle size={12} className="mr-2" /> : <CheckCircle2 size={12} className="mr-2" />)}
              {row.isActive ? "Deactivate" : "Reconnect"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto py-8 lg:py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 border-b border-slate-100 pb-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className="h-2 w-10 rounded-full bg-secondary" />
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Administrator</span>
           </div>
           <h1 className="text-4xl md:text-4xl font-black text-slate-800 tracking-tight">Access Control</h1>
           <p className="text-lg text-primary/70 font-medium max-w-xl">Unified management system for student and mentor accounts across the MozhiAruvi network.</p>
        </div>
        <Button
          onClick={() => refetch()}
          isLoading={isLoading}
          variant="outline"
          size="lg"
          className="uppercase tracking-widest text-[10px] font-black px-8"
        >
          Synchronize Data
        </Button>
      </div>

      {isError && (
        <Card variant="outline" className="border-red-100 bg-red-50/30 flex items-center gap-4 text-red-600">
          <AlertCircle className="h-6 w-6 shrink-0" /> <span className="font-bold">{error?.message || "Could not load users."}</span>
        </Card>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
           <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Querying database...</p>
        </div>
      ) : (
        <div className="space-y-8">
           <DataTable title={`Directory Intelligence (${totalItems} entities)`} columns={columns} data={users} />
           <Pagination 
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={setCurrentPage}
           />
        </div>
      )}

      {/* Edit Modal Refactored */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title={editingUser?.name ? `Identity Profile: ${editingUser.name}` : "User Profile"}
        description="Administrative override for account credentials and privileges."
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Legal Name" 
              name="name" 
              value={editFormData.name || ""} 
              onChange={handleEditChange}
              icon={<User size={14} className="text-primary" />}
            />
            <Input 
              label="System Authority" 
              name="role" 
              value={editFormData.role || "student"} 
              onChange={handleEditChange}
              options={[
                { label: "Student", value: "student" },
                { label: "Tutor", value: "teacher" },
                { label: "Administrator", value: "admin" },
              ]}
              icon={<ShieldCheck size={14} className="text-primary" />}
            />
            <Input 
              label="Phone Credentials" 
              name="phoneNumber" 
              value={editFormData.phoneNumber || ""} 
              onChange={handleEditChange}
              icon={<Phone size={14} className="text-primary" />}
            />
            <Input 
              label="Primary Region" 
              name="country" 
              value={editFormData.country || ""} 
              onChange={handleEditChange}
              icon={<Globe size={14} className="text-primary" />}
            />
            <Input 
              label="Age" 
              name="age" 
              type="number"
              value={editFormData.age || ""} 
              onChange={handleEditChange}
              icon={<Hash size={14} className="text-primary" />}
            />
            <Input 
              label="Identity Gender" 
              name="gender" 
              value={editFormData.gender || ""} 
              onChange={handleEditChange}
              options={[
                { label: "Male", value: "male" },
                { label: "Female", value: "female" },
                { label: "Other", value: "other" },
                { label: "Prefer not to say", value: "prefer_not_to_say" },
              ]}
              icon={<User size={14} className="text-primary" />}
            />
          </div>

          <Input 
            label="Biography & Experiences" 
            name="bio" 
            multiline 
            value={editFormData.bio || ""} 
            onChange={handleEditChange}
            placeholder="Document any relevant historical or academic context..."
          />

          {editFormData.role === "teacher" && (
            <div className="pt-6 border-t border-slate-100 flex flex-col gap-6 animate-in slide-in-from-top-4 duration-500">
               <h4 className="text-xs font-black uppercase tracking-widest text-primary">Mentor Credentials</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Linguistic Specialization" 
                    name="specialization" 
                    value={editFormData.specialization || ""} 
                    onChange={handleEditChange}
                  />
                  <Input 
                    label="Academic Tenure" 
                    name="experience" 
                    value={editFormData.experience || ""} 
                    onChange={handleEditChange}
                  />
               </div>
            </div>
          )}

          {/* Subscriptions & Limits Section */}
          <div className="pt-8 border-t border-dashed border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" /> Subscription Tiers
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Active Plan" 
                    name="subscription.plan" 
                    value={editFormData.subscription?.plan || "FREE"} 
                    onChange={handleEditChange}
                    options={[
                      { label: "Free", value: "FREE" },
                      { label: "Pro", value: "PRO" },
                      { label: "Premium", value: "PREMIUM" },
                      { label: "Business", value: "BUSINESS" },
                    ]}
                  />
                  <Input 
                    label="Billing Cycle" 
                    name="subscription.billingCycle" 
                    value={editFormData.subscription?.billingCycle || "none"} 
                    onChange={handleEditChange}
                    options={[
                      { label: "None / Not Paid", value: "none" },
                      { label: "Monthly", value: "monthly" },
                      { label: "Yearly", value: "yearly" },
                    ]}
                  />
               </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-xs font-black uppercase tracking-widest text-secondary flex items-center gap-2">
                 <Activity className="h-4 w-4" /> Usage Quotas
               </h4>
               <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Mentors Met (Cycle)" 
                    name="subscription.tutorSupportUsed" 
                    type="number"
                    value={editFormData.subscription?.tutorSupportUsed || 0} 
                    onChange={handleEditChange}
                    icon={<Users size={12} />}
                  />
                  <Input 
                    label="Events Attended" 
                    name="subscription.eventUsageCount" 
                    type="number"
                    value={editFormData.subscription?.eventUsageCount || 0} 
                    onChange={handleEditChange}
                    icon={<Calendar size={12} />}
                  />
               </div>
            </div>
          </div>
          
          <div className="pt-8 flex items-center justify-end gap-4">
            <Button variant="ghost" onClick={() => setEditingUser(null)} className="font-black uppercase tracking-widest text-xs">
              Dismiss
            </Button>
            <Button type="submit" isLoading={isSaving} size="lg" className="px-10 shadow-xl shadow-primary/20">
              Sync Account Overrides
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}













