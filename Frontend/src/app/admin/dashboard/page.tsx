"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { getAllUsers, getAllTutors, getTeacherApplications, getAdminStats, AdminStats, BaseUser, TeacherApplication } from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import Button from "@/components/ui/Button";

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-50 text-red-700 border border-red-200",
    needs_revision: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border ${map[status] ?? ""}`}>
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-secondary" />
              <span className="text-xs font-bold text-secondary tracking-tight">Administrator</span>
           </div>
           <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight leading-tight">Admin Overview</h1>
           <p className="text-base text-gray-700 font-medium leading-relaxed max-w-xl">
             Platform health at a glance. You are currently logged in as <strong className="text-primary">{admin?.name}</strong> with full administrative access.
           </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-error bg-error/10 px-4 py-3 text-sm text-error">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Platform Users"
          value={String(stats?.totalUsers ?? 0)}
          description={`${stats?.activeUsers ?? 0} currently active`}
          icon={Users}
          className="border-primary/10 bg-primary/5"
        />
        <StatCard
          title="Verified Tutors"
          value={String(stats?.totalTutors ?? 0)}
          description="Teachers on the platform"
          icon={GraduationCap}
          trend={tutors.length > 0 ? "up" : "neutral"}
          trendValue="Live"
        />
        <StatCard
          title="Pending Reviews"
          value={String(stats?.pendingApps ?? 0)}
          description="Teacher applications to review"
          icon={BookOpen}
          trend={(stats?.pendingApps ?? 0) > 0 ? "up" : "neutral"}
          trendValue={(stats?.pendingApps ?? 0) > 0 ? "Action Required" : "Steady"}
          className={(stats?.pendingApps ?? 0) > 0 ? "border-warning/10 bg-warning/5" : ""}
        />
        <StatCard
          title="Active Events"
          value={String(stats?.totalEvents ?? 0)}
          description="Across all categories"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Applications Table */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col shadow-gray-200/5">
          <div className="flex items-center justify-between border-b border-gray-50 px-8 py-6">
            <h3 className="text-base font-bold text-gray-800 tracking-tight">
              Teacher Applications
            </h3>
            <Button href="/admin/teachers" variant="ghost" size="sm" className="text-primary hover:text-secondary font-bold">
              View All →
            </Button>
          </div>

          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
               <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 transition-all">
                  <GraduationCap className="h-8 w-8 text-gray-200" />
               </div>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed">No pending applications at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100/50">
              {applications.slice(0, 4).map((app) => (
                <div key={app._id} className="bg-white p-8 flex flex-col gap-6 hover:bg-gray-50/80 transition-all group border-b border-r border-slate-100 last:border-b-0">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center ring-4 ring-primary/5 shrink-0 overflow-hidden border border-primary/10 shadow-inner group-hover:ring-primary/20 transition-all">
                         <span className="text-2xl font-black text-primary group-hover:scale-110 transition-transform">{(app.userId?.name || app.fullName).charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-black text-gray-800 tracking-tight truncate leading-tight mb-1">{app.userId?.name || app.fullName}</h4>
                        <div className="flex items-center gap-2 mb-2">
                           <StatusBadge status={app.status} />
                           <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Applicant</span>
                        </div>
                        <p className="text-[10px] font-bold text-primary tracking-widest uppercase">{app.specialization || "Expert Teacher"}</p>
                      </div>
                    </div>
                    {app.hourlyRate && (
                      <div className="text-right flex flex-col items-end">
                         <span className="text-lg font-black text-gray-800 leading-none">${app.hourlyRate}</span>
                         <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">per class</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-5">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                           <Globe className="h-3 w-3 text-primary" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 truncate max-w-[100px]">{app.userId?.email || "Email Hidden"}</p>
                     </div>
                     <Button href="/admin/teachers" variant="ghost" size="sm" className="h-9 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/10 hover:text-primary rounded-xl transition-all active:scale-95 shadow-sm border border-slate-100 hover:border-primary/20 bg-white">
                        Review Profile
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Admin Actions */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col h-fit transition-all hover:shadow-xl hover:shadow-secondary/10 hover:border-secondary/30">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Manage Users", href: "/admin/users", count: stats?.totalUsers || 0 },
              { label: "Review Teachers", href: "/admin/teachers", count: stats?.pendingApps || 0 },
              { label: "Curriculum Builder", href: "/admin/lessons", count: null },
              { label: "Moderate Events", href: "/admin/events", count: stats?.totalEvents || 0 },
              { label: "Create Event", href: "/admin/events", count: null },
              { label: "Write a Story", href: "/blogs/write", count: null },
            ].map((action) => (
              <Button
                key={action.label}
                href={action.href}
                variant="ghost"
                size="md"
                className="justify-between w-full hover:bg-gray-50 border border-gray-50 rounded-2xl group transition-all"
              >
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary">{action.label}</span>
                <div className="flex items-center gap-3">
                  {action.count !== null && (
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{action.count}</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
