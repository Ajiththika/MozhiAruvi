"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight, Globe } from "lucide-react";
import Link from "next/link";
import { getAllUsers, getAllTutors, getTeacherApplications, getAdminStats, AdminStats, BaseUser, TeacherApplication } from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import { getAllBlogsForAdmin, Blog } from "@/services/blogService";
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
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getMe(), getAdminStats(), getAllUsers(), getAllTutors(), getAllBlogsForAdmin(), getTeacherApplications(), getEvents()])
      .then(([me, st, us, ts, bl, apps, evs]) => {
        setAdmin(me);
        setStats(st);
        setUsers(us.users);
        setTutors(ts.tutors);
        setBlogs(bl.blogs.filter(b => b.status === 'pending'));
        setApplications(apps.applications.filter(a => a.status === 'pending')); // Focus on pending
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
          trend="neutral"
          trendValue="Live"
        />
        <StatCard
          title="Pending Stories"
          value={String(blogs.length)}
          description="Awaiting moderation"
          icon={BookOpen}
          trend={blogs.length > 0 ? "up" : "neutral"}
          className={blogs.length > 0 ? "border-amber-100 bg-amber-50/50" : ""}
        />
        <StatCard
          title="Active Events"
          value={String(stats?.totalEvents ?? 0)}
          description="Platform activities"
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pending Applications & Active Tutors */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col shadow-gray-200/5">
            <div className="flex items-center justify-between border-b border-gray-50 px-8 py-6 bg-amber-50/5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-bold text-gray-800 tracking-tight">
                   Pending Mentor Applications
                </h3>
              </div>
              <Button href="/admin/teachers" variant="ghost" size="sm" className="text-primary hover:text-secondary font-bold">
                Review All →
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                   <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Applicant Identity</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Specialization</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {applications.length === 0 ? (
                    <tr>
                       <td colSpan={3} className="py-16 text-center">
                          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No pending applications found.</p>
                       </td>
                    </tr>
                  ) : (
                    applications.slice(0, 3).map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center font-black text-amber-600 text-sm border border-amber-100 group-hover:scale-105 transition-transform">
                               {(app.userId?.name || app.fullName).charAt(0)}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-black text-gray-800 truncate">{app.userId?.name || app.fullName}</p>
                               <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50/50 border border-amber-100 w-fit mt-1">
                                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                                  <span className="text-[9px] font-bold text-amber-600 uppercase tracking-tight">Pending Review</span>
                               </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                           <span className="text-xs font-bold text-gray-600 truncate block max-w-[150px]">
                              {app.specialization || "Teach Candidate"}
                           </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                           <Button href="/admin/teachers" variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-lg">
                              Review
                           </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col shadow-gray-200/5">
            <div className="flex items-center justify-between border-b border-gray-50 px-8 py-6 bg-primary/5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <h3 className="text-base font-bold text-gray-800 tracking-tight">
                  Pending Story Approvals
                </h3>
              </div>
              <Button href="/admin/blogs" variant="ghost" size="sm" className="text-primary hover:text-secondary font-bold">
                Moderate All →
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                   <tr>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Story Details</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Moderator Logic</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {blogs.length === 0 ? (
                    <tr>
                       <td colSpan={2} className="py-16 text-center">
                          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No stories awaiting approval.</p>
                       </td>
                    </tr>
                  ) : (
                    blogs.slice(0, 3).map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10 group-hover:scale-105 transition-transform">
                               {(blog.author?.name || "B").charAt(0)}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-black text-gray-800 truncate">{blog.title}</p>
                               <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">By {blog.author?.name || "Member"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-right whitespace-nowrap">
                           <Button href="/admin/blogs" variant="ghost" size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-lg">
                              Moderate
                           </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col h-fit transition-all hover:shadow-xl hover:shadow-secondary/10 hover:border-secondary/30">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-8">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Manage Users", href: "/admin/users", count: stats?.totalUsers || 0 },
              { label: "Verified Mentors", href: "/admin/tutors", count: stats?.totalTutors || 0 },
              { label: "Review Teachers", href: "/admin/teachers", count: stats?.pendingApps || 0 },
              { label: "Curriculum Builder", href: "/admin/lessons", count: null },
              { label: "Moderate Events", href: "/admin/events", count: stats?.totalEvents || 0 },
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
