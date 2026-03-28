"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllUsers, getAllTutors, getTeacherApplications, getAdminStats, AdminStats, BaseUser, TeacherApplication } from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import Button from "@/components/ui/Button";

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
            <div className="flex items-center justify-center py-12 text-sm text-gray-600">No applications yet.</div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {applications.slice(0, 5).map((app) => (
                <div key={app._id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{app.fullName}</p>
                    <p className="text-xs text-gray-500">{app.userId?.email}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={app.status} />
                    {app.status === "pending" && (
                      <Button href="/admin/teachers" variant="secondary" size="sm">
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
