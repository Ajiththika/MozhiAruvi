"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, Crown } from "lucide-react";
import {
   getAdminStats,
   AdminStats,
   BaseUser,
   getMentorApplications,
   MentorApplicationResult
} from "@/services/adminService";
import { getMe, SafeUser } from "@/services/authService";
import { getAllBlogsForAdmin, Blog } from "@/services/blogService";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
   const [admin, setAdmin] = useState<SafeUser | null>(null);
   const [stats, setStats] = useState<AdminStats | null>(null);
   const [blogs, setBlogs] = useState<Blog[]>([]);
   const [applications, setApplications] = useState<MentorApplicationResult[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      (async () => {
         try {
            const results = await Promise.allSettled([
               getMe(),
               getAdminStats(),
               getAllBlogsForAdmin(),
               getMentorApplications(),
            ]);

            if (results[0].status === 'fulfilled' && results[0].value) setAdmin(results[0].value);
            if (results[1].status === 'fulfilled' && results[1].value) setStats(results[1].value);
            if (results[2].status === 'fulfilled' && results[2].value) setBlogs(results[2].value.blogs.filter(b => b.status === 'pending'));
            if (results[3].status === 'fulfilled' && results[3].value) setApplications(results[3].value);

            if (results.some(r => r.status === 'rejected')) {
               console.warn("Some admin dashboard data failed to load.");
            }
         } catch (err) {
            setError("Critical dashboard failure. Check backend connectivity.");
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   if (loading) {
      return (
         <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   return (
      <div className="space-y-10 animate-in fade-in duration-700">
         <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-1.5 w-6 rounded-full bg-primary" />
                  <span className="text-[10px] font-black text-primary/60 tracking-[0.3em] uppercase">Control Center</span>
               </div>
               <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Command Deck</h1>
                  <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-3xl">
                     Orchestrating the ecosystem of classical Tamil learning. Managed by <strong className="text-primary underline underline-offset-8 decoration-2 decoration-primary/20">{admin?.name || "Administrator"}</strong>.
                  </p>
               </div>
            </div>
         </div>

         {error && (
            <div className="flex items-center gap-4 rounded-3xl border border-error bg-error/5 p-6 text-sm text-error">
               <AlertCircle className="h-6 w-6 shrink-0" /> <span className="font-bold">{error}</span>
            </div>
         )}

         <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
               title="Global Trainee Base"
               value={String(stats?.totalUsers ?? 0)}
               description={`${stats?.activeUsers ?? 0} pulse active`}
               icon={Users}
               className="border-primary/10 bg-primary/5 shadow-2xl shadow-primary/5"
            />
            <StatCard
               title="Verified Teachers"
               value={String(stats?.totalTutors ?? 0)}
               description="Certified teachers"
               icon={GraduationCap}
            />
            <Link href="/admin/subscriptions" className="block">
               <StatCard
                  title="Active Subscriptions"
                  value={String(stats?.totalPremiumUsers ?? 0)}
                  description="Manage Tiers & Limits"
                  icon={Crown}
                  className="cursor-pointer hover:border-primary/30 transition-all h-full"
               />
            </Link>
            <StatCard
               title="Live Events"
               value={String(stats?.totalEvents ?? 0)}
               description="Platform wide activities"
               icon={Calendar}
            />
         </div>

         <div className="grid grid-cols-1 gap-10 lg:grid-cols-1">
            <div className="lg:col-span-1 space-y-10">
               {/* Applications Table */}
               <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-50 px-10 py-8">
                     <h3 className="text-xl font-black text-text-primary tracking-tight">Teacher Inbox</h3>
                     <Button href="/admin/tutors" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Review Queue</Button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-50">
                           {applications.length === 0 ? (
                              <tr><td className="py-20 text-center text-xs font-bold text-primary/40 uppercase tracking-widest">Queue Clear</td></tr>
                           ) : (
                              applications.slice(0, 4).map((app) => (
                                 <tr key={app._id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-6 flex items-center gap-5">
                                       <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-sm border border-indigo-100">{(app.cleanName || app.name || "U").charAt(0)}</div>
                                       <div>
                                          <p className="text-sm font-black text-text-primary">{app.cleanName || app.name}</p>
                                          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{app.specialization || "Pending Review"}</p>
                                       </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                       <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border bg-white text-text-primary border-primary/20 shadow-sm whitespace-nowrap">
                                          {app.type} request
                                       </span>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Stories Table */}
               <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between border-b border-slate-50 px-10 py-8">
                     <h3 className="text-xl font-black text-text-primary tracking-tight">Our Events</h3>
                     <Button href="/admin/blogs" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Manage</Button>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-50">
                           {blogs.length === 0 ? (
                              <tr><td className="py-20 text-center text-xs font-bold text-primary/40 uppercase tracking-widest">Everything Published</td></tr>
                           ) : (
                              blogs.slice(0, 4).map((blog) => (
                                 <tr key={blog._id} className="hover:bg-slate-50/50 transition-all">
                                    <td className="px-10 py-6 flex items-center gap-5">
                                       <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10">{(blog.author?.name || "B").charAt(0)}</div>
                                       <div>
                                          <p className="text-sm font-black text-text-primary">{blog.title}</p>
                                          <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">By {blog.author?.name || "Anonymous"}</p>
                                       </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                       <Button href="/admin/blogs" variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Review</Button>
                                    </td>
                                 </tr>
                              ))
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
