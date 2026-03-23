"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/common/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllUsers, getAllTutors, getTeacherApplications, getAdminStats, AdminStats, BaseUser, TeacherApplication } from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";

function StatusBadge({ status }: { status: TeacherApplication["status"] }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-500",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500",
    needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-mozhi-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Admin Overview 🛡️
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Platform health at a glance. Logged in as <strong>{admin?.name}</strong>.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={String(stats?.totalUsers ?? 0)}
          icon={Users}
          trend="neutral"
          trendValue={`${stats?.activeUsers ?? 0} active`}
        />
        <StatCard
          title="Active Tutors"
          value={String(stats?.totalTutors ?? 0)}
          icon={GraduationCap}
          trend="neutral"
          trendValue="Verified teachers"
          className="border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/20"
        />
        <StatCard
          title="Pending Applications"
          value={String(stats?.pendingApps ?? 0)}
          icon={BookOpen}
          trend={(stats?.pendingApps ?? 0) > 0 ? "up" : "neutral"}
          trendValue={(stats?.pendingApps ?? 0) > 0 ? "Needs review" : "All reviewed"}
          className={(stats?.pendingApps ?? 0) > 0 ? "border-yellow-100 bg-yellow-50/30 dark:border-yellow-900/40 dark:bg-yellow-950/20" : ""}
        />
        <StatCard
          title="Total Events"
          value={String(stats?.totalEvents ?? 0)}
          icon={Calendar}
          trend="neutral"
          trendValue="Across the platform"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Applications Table */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-200 dark:bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-200">
            <h3 className="font-bold text-slate-600 dark:text-slate-600">
              Teacher Applications
            </h3>
            <Link href="/admin/teachers" className="text-xs font-bold text-mozhi-primary hover:text-mozhi-secondary dark:text-mozhi-secondary">
              View All →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-600">No applications yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {applications.slice(0, 5).map((app) => (
                <div key={app._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-600">{app.fullName}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-600">{app.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <Link href="/admin/teachers" className="text-xs font-bold text-mozhi-primary hover:underline dark:text-mozhi-secondary">
                        Review
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Admin Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-200 dark:bg-slate-50">
          <h3 className="font-bold text-slate-600 dark:text-slate-600 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Manage Users", href: "/admin/users", count: stats?.totalUsers || 0, color: "text-mozhi-primary dark:text-mozhi-secondary" },
              { label: "Review Teachers", href: "/admin/teachers", count: stats?.pendingApps || 0, color: "text-yellow-600 dark:text-yellow-500" },
              { label: "Curriculum Builder", href: "/admin/lessons", count: null, color: "text-mozhi-primary dark:text-mozhi-secondary" },
              { label: "Moderate Events", href: "/admin/events", count: stats?.totalEvents || 0, color: "text-emerald-600 dark:text-emerald-500" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 transition-colors hover:bg-slate-50 dark:border-slate-200 dark:hover:bg-slate-50"
              >
                <span className={`text-sm font-bold ${action.color}`}>{action.label}</span>
                <div className="flex items-center gap-2">
                  {action.count !== null && (
                    <span className="text-xs font-medium text-slate-600">{action.count}</span>
                  )}
                  <ArrowRight className="h-4 w-4 text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}