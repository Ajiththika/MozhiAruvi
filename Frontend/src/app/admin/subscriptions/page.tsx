"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2, AlertCircle, Users, CheckCircle2, XCircle, CreditCard, BarChart2, RefreshCw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Pagination from "@/components/ui/Pagination";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Subscription {
  _id: string;
  userId: string;
  planType: "starter" | "plus" | "master";
  isActive: boolean;
  startDate: string;
  endDate?: string;
  paypalSubscriptionId?: string;
  usageTracking: {
    questionsUsed: number;
    categoriesAccessed: string[];
    sessionsUsed: number;
  };
  limits: {
    categoryLimit: number | "Unlimited";
    askTutorLimit: number;
    sessionsLimit: number;
    eventsLimit: number | "Unlimited";
  };
  user?: {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

interface Stats {
  planDistribution: { _id: string; count: number }[];
  activePaidUsers: number;
  totalSubscriptions: number;
}

// ── API ───────────────────────────────────────────────────────────────────────

async function fetchSubscriptions(page: number, plan: string, search: string) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (plan && plan !== "all") params.set("plan", plan);
  if (search) params.set("search", search);
  const res = await api.get<{ subscriptions: Subscription[]; totalItems: number; totalPages: number; currentPage: number }>(`/admin/subscriptions?${params}`);
  return res.data;
}

async function fetchStats() {
  const res = await api.get<Stats>("/admin/subscriptions/stats");
  return res.data;
}

async function overrideSubscription(userId: string, data: { planType?: string; isActive?: boolean; resetUsage?: boolean }) {
  const res = await api.patch<{ message: string }>(`/admin/subscriptions/${userId}`, data);
  return res.data;
}

// ── Plan Badge ────────────────────────────────────────────────────────────────

const PLAN_META: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-slate-50 text-slate-500 border-slate-200" },
  plus: { label: "Plus", color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  master: { label: "Pro", color: "bg-amber-50 text-amber-600 border-amber-200" },
};

function PlanBadge({ plan }: { plan: string }) {
  const meta = PLAN_META[plan] || { label: plan, color: "bg-slate-50 text-slate-500 border-slate-200" };
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border", meta.color)}>
      {meta.label}
    </span>
  );
}

function UsageBar({ used, limit }: { used: number; limit: number | "Unlimited" }) {
  if (limit === "Unlimited") {
    return <span className="text-[10px] font-bold text-emerald-600">{used} / ∞</span>;
  }
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 90 ? "bg-red-400" : pct >= 60 ? "bg-amber-400" : "bg-emerald-400")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{used}/{limit}</span>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [planFilter, setPlanFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [overrideForm, setOverrideForm] = useState<{ planType: string; isActive: boolean; resetUsage: boolean }>({ planType: "starter", isActive: true, resetUsage: false });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: stats } = useQuery({ queryKey: ["admin", "subscriptions", "stats"], queryFn: fetchStats, staleTime: 60_000 });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "subscriptions", currentPage, planFilter, search],
    queryFn: () => fetchSubscriptions(currentPage, planFilter, search),
    staleTime: 30_000,
  });

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setOverrideForm({ planType: sub.planType, isActive: sub.isActive, resetUsage: false });
    setSaveError(null);
  };

  const handleSaveOverride = async () => {
    if (!editingSub) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await overrideSubscription(String(editingSub.userId), overrideForm);
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      setEditingSub(null);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (e as Error)?.message || "Override failed";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const subs = data?.subscriptions || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-6 rounded-full bg-primary" />
            <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.3em]">Administrator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Subscriptions</h1>
          <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl">
            Manage PayPal subscription tiers, track usage limits, and manually override plans.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="outline" className="p-5 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Total</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalSubscriptions}</p>
            <p className="text-xs font-medium text-primary/50">Subscriptions</p>
          </Card>
          <Card variant="outline" className="p-5 flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Paid Active</p>
            <p className="text-3xl font-black text-indigo-600">{stats.activePaidUsers}</p>
            <p className="text-xs font-medium text-primary/50">Plus + Pro</p>
          </Card>
          {stats.planDistribution.map(p => (
            <Card key={p._id} variant="outline" className="p-5 flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">{PLAN_META[p._id]?.label || p._id}</p>
              <p className="text-3xl font-black text-slate-800">{p.count}</p>
              <p className="text-xs font-medium text-primary/50">Users</p>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "starter", "plus", "master"].map(p => (
            <button
              key={p}
              onClick={() => { setPlanFilter(p); setCurrentPage(1); }}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                planFilter === p ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-white text-primary/60 border-slate-200 hover:border-primary/30"
              )}
            >
              {p === "all" ? "All Plans" : PLAN_META[p]?.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search by name or email..."
            className="h-10 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <Button type="submit" size="sm" className="h-10 text-[10px] font-black uppercase tracking-widest">Search</Button>
        </form>
      </div>

      {/* Error */}
      {isError && (
        <Card variant="outline" className="border-red-100 bg-red-50/30 flex items-center gap-4 text-red-600 p-4">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-bold text-sm">{(error as Error)?.message || "Failed to load subscriptions."}</span>
        </Card>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
          <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Loading subscriptions...</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["User", "Plan", "Status", "Questions", "Sessions", "Categories", "Renewal", "Actions"].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-primary/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subs.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-primary/40 font-bold text-sm">No subscriptions found.</td></tr>
              ) : subs.map(sub => (
                <tr key={sub._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center font-black text-primary text-sm uppercase">
                        {sub.user?.name?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-xs">{sub.user?.name || "Unknown"}</p>
                        <p className="text-primary/50 text-[10px] font-medium">{sub.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><PlanBadge plan={sub.planType} /></td>
                  <td className="px-5 py-4">
                    {sub.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 min-w-[120px]">
                    <UsageBar used={sub.usageTracking.questionsUsed} limit={sub.limits.askTutorLimit} />
                  </td>
                  <td className="px-5 py-4 min-w-[120px]">
                    <UsageBar used={sub.usageTracking.sessionsUsed} limit={sub.limits.sessionsLimit} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-bold text-slate-600">{sub.usageTracking.categoriesAccessed?.length || 0} unlocked</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-[10px] font-medium text-primary/50">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Button onClick={() => handleOpenEdit(sub)} variant="outline" size="sm" className="text-[10px] font-black uppercase tracking-widest">
                      Override
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={data.totalPages} onPageChange={setCurrentPage} />
      )}

      {/* Override Modal */}
      <Modal
        isOpen={!!editingSub}
        onClose={() => setEditingSub(null)}
        title={editingSub?.user?.name ? `Override: ${editingSub.user.name}` : "Override Subscription"}
        size="sm"
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Current Subscription</p>
            <p className="font-black text-slate-800">{editingSub?.user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <PlanBadge plan={editingSub?.planType || "starter"} />
              {editingSub?.paypalSubscriptionId && (
                <span className="text-[10px] text-primary/40 font-medium truncate max-w-[180px]">{editingSub.paypalSubscriptionId}</span>
              )}
            </div>
          </div>

          <Input
            label="Override Plan"
            name="planType"
            value={overrideForm.planType}
            onChange={e => setOverrideForm(f => ({ ...f, planType: e.target.value }))}
            options={[
              { label: "Starter (Free)", value: "starter" },
              { label: "Plus ($12/mo)", value: "plus" },
              { label: "Pro ($20/mo)", value: "master" },
            ]}
          />

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-black text-slate-800">Active Status</p>
              <p className="text-[10px] font-medium text-primary/50">Mark subscription as active or inactive</p>
            </div>
            <button
              onClick={() => setOverrideForm(f => ({ ...f, isActive: !f.isActive }))}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                overrideForm.isActive ? "bg-emerald-500" : "bg-slate-200"
              )}
            >
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", overrideForm.isActive ? "left-6.5 translate-x-0.5" : "left-0.5")} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
            <div>
              <p className="text-xs font-black text-amber-700">Reset Usage Counters</p>
              <p className="text-[10px] font-medium text-amber-600/70">Clears questions, sessions & categories</p>
            </div>
            <button
              onClick={() => setOverrideForm(f => ({ ...f, resetUsage: !f.resetUsage }))}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative",
                overrideForm.resetUsage ? "bg-amber-500" : "bg-slate-200"
              )}
            >
              <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", overrideForm.resetUsage ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>

          {saveError && (
            <p className="text-xs font-bold text-red-500 flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5" /> {saveError}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setEditingSub(null)} className="text-[10px] font-black uppercase tracking-widest">Cancel</Button>
            <Button onClick={handleSaveOverride} isLoading={isSaving} className="px-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              Commit Override
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
