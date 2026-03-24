"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllUsers, getAllTutors, getTeacherApplications, getAdminStats, AdminStats, BaseUser, TeacherApplication } from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import Button from "@/components/common/Button";

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-warning/10 text-warning",
    approved: "bg-success/10 text-success",
    rejected: "bg-error/10 text-error",
    needs_revision: "bg-warning/10 text-warning",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? ""}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<SafeUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [tutors, setTutors] = useState<BaseUser[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getAdminStats(), getAllUsers(), getAllTutors(), getTeacherApplications(), getEvents()])
      .then(([me, st, us, ts, apps, evs]) => {
        setAdmin(me);
        setStats(st);
        setUsers(us.users);
        setTutors(ts.tutors);
        setApplications(apps.applications);
        setEvents(evs.events);
      })
      .catch(() => setError("Could not load dashboard data. Check backend connection."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] italic">Admin Access Initializing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-b border-slate-50 pb-12">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <span className="h-2 w-12 rounded-full bg-slate-900 shadow-sm" />
              <label>Administrator System</label>
           </div>
           <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Admin Overview</h1>
           <p className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
             Platform health at a glance. You are currently logged in as <strong className="text-primary italic">{admin?.name}</strong> with full administrative access.
           </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700 shadow-sm animate-in zoom-in-95">
          <AlertCircle className="h-6 w-6 shrink-0 opacity-50" /> 
          <p className="font-bold text-sm italic">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Platform Users"
          value={stats?.totalUsers ?? 0}
          description={`${stats?.activeUsers ?? 0} currently active`}
          icon={Users}
          className="border-primary/5 bg-primary/5 shadow-primary/5"
        />
        <StatCard
          title="Verified Tutors"
          value={stats?.totalTutors ?? 0}
          description="Teachers on the platform"
          icon={GraduationCap}
          trend="up"
          trendValue="Live"
        />
        <StatCard
          title="Pending Reviews"
          value={stats?.pendingApps ?? 0}
          description="Applications for review"
          icon={BookOpen}
          trend={(stats?.pendingApps ?? 0) > 0 ? "up" : "neutral"}
          trendValue={(stats?.pendingApps ?? 0) > 0 ? "Action Required" : "Steady"}
          className={(stats?.pendingApps ?? 0) > 0 ? "border-amber-100 bg-amber-50 shadow-amber-200/20" : ""}
        />
        <StatCard
          title="Active Events"
          value={stats?.totalEvents ?? 0}
          description="Gatherings & Workshops"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Pending Applications Table */}
        <div className="lg:col-span-8 card-premium border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-50 px-10 py-8">
            <h3 className="tracking-tight italic">
              Teacher Applications
            </h3>
            <Button href="/admin/teachers" variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px]">
              View All <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-sm font-bold text-slate-400 uppercase tracking-widest italic grow italic">No applications awaiting review.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {applications.slice(0, 5).map((app) => (
                <div key={app._id} className="flex items-center justify-between px-10 py-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl">
                      {app.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 tracking-tight leading-none mb-1.5">{app.fullName}</p>
                      <p className="text-xs font-bold text-slate-400 lowercase">{app.userId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <Button href="/admin/teachers" variant="primary" size="sm" className="px-5 shadow-lg shadow-primary/20">
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Admin Actions */}
        <div className="lg:col-span-4 space-y-8">
          <div className="card-premium p-10 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col h-fit">
            <label className="text-slate-400 mb-8 block uppercase">Quick Admin Actions</label>
            <div className="flex flex-col gap-4">
              {[
                { label: "Manage Users", href: "/admin/users", count: stats?.totalUsers || 0, icon: Users },
                { label: "Review Teachers", href: "/admin/teachers", count: stats?.pendingApps || 0, icon: GraduationCap },
                { label: "System Events", href: "/admin/events", count: stats?.totalEvents || 0, icon: Calendar },
                { label: "Course Editor", href: "/admin/lessons", count: null, icon: BookOpen },
              ].map((action) => (
                <Button
                  key={action.href}
                  href={action.href}
                  variant="ghost"
                  size="xl"
                  className="justify-between w-full bg-slate-50/30 border border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 group shadow-sm transition-all duration-500 pr-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-white/10 shadow-sm border border-slate-200 group-hover:border-white/20">
                      <action.icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="font-bold italic tracking-tight">{action.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {action.count !== null && (
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-3 py-1 rounded-full group-hover:bg-white/10 group-hover:text-white transition-colors">{action.count}</span>
                    )}
                    <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all duration-500" />
                  </div>
                </Button>
              ))}
            </div>
          </div>
          
          <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/30 relative overflow-hidden group">
             <div className="absolute top-0 right-0 -m-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-colors duration-1000 group-hover:bg-primary/20"></div>
             <label className="text-white/40 mb-4 block uppercase tracking-widest text-[10px]">Security Notice</label>
             <p className="text-sm font-bold italic leading-relaxed text-white/80">
               "Keep your administrative credentials secure. Regularly review audit logs for sensitive operations."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}