"use client";

import React, { useEffect, useState } from "react";
import { StatCard } from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight, Globe, Crown, Star, Settings, Check, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  getAllUsers, 
  getAllTutors, 
  getTeacherApplications, 
  getAdminStats, 
  AdminStats, 
  BaseUser, 
  TeacherApplication, 
  getPremiumUsers, 
  PremiumUser,
  getPlanSettings,
  updatePlanSettings,
  PlanSettings 
} from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import { getAllBlogsForAdmin, Blog } from "@/services/blogService";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'premium'>('overview');
  const [admin, setAdmin] = useState<SafeUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [tutors, setTutors] = useState<BaseUser[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
  const [planSettings, setPlanSettings] = useState<PlanSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<PlanSettings>>({});

  useEffect(() => {
    Promise.all([
        getMe(), 
        getAdminStats(), 
        getAllUsers(), 
        getAllTutors(), 
        getAllBlogsForAdmin(), 
        getTeacherApplications(), 
        getEvents(), 
        getPremiumUsers(),
        getPlanSettings()
    ])
      .then(([me, st, us, ts, bl, apps, evs, prem, plans]) => {
        setAdmin(me);
        setStats(st);
        setUsers(us.users);
        setTutors(ts.tutors);
        setBlogs(bl.blogs.filter(b => b.status === 'pending'));
        setApplications(apps.applications.filter(a => a.status === 'pending'));
        setEvents(evs.events);
        setPremiumUsers(prem.users);
        setPlanSettings(plans);
      })
      .catch(() => setError("Could not load dashboard data. Check backend connection."))
      .finally(() => setLoading(false));
  }, []);

  const handleEditPlan = (plan: PlanSettings) => {
    setEditingPlan(plan._id);
    setEditFormData(plan);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    try {
      const updated = await updatePlanSettings(editingPlan, editFormData);
      setPlanSettings(prev => prev.map(p => p._id === editingPlan ? updated : p));
      setEditingPlan(null);
    } catch (err) {
      alert("Failed to update plan settings.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="mb-0 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="h-2 w-10 rounded-full bg-secondary shadow-lg shadow-secondary/20" />
              <span className="text-[10px] font-black text-secondary tracking-[0.2em] uppercase">Control Center</span>
           </div>
           <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none mb-4">Command Deck</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl italic opacity-80">
                Orchestrating the ecosystem of classical Tamil learning. Managed by <strong className="text-primary not-italic">{admin?.name}</strong>.
              </p>
           </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
           {(['overview', 'plans', 'premium'] as const).map(tab => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                    "px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-white shadow-xl shadow-black/5 text-primary" : "text-slate-400 hover:text-slate-600"
                 )}
              >
                 {tab}
              </button>
           ))}
        </div>
      </div>

      {error && (activeTab === 'overview') && (
        <div className="flex items-center gap-4 rounded-3xl border border-error bg-error/5 p-6 text-sm text-error">
          <AlertCircle className="h-6 w-6 shrink-0" /> <span className="font-bold">{error}</span>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Global Trainee Base"
              value={String(stats?.totalUsers ?? 0)}
              description={`${stats?.activeUsers ?? 0} pulse active`}
              icon={Users}
              className="border-primary/10 bg-primary/5 shadow-2xl shadow-primary/5"
            />
            <StatCard
              title="Verified Mentors"
              value={String(stats?.totalTutors ?? 0)}
              description="Certified tutors"
              icon={GraduationCap}
            />
            <StatCard
              title="Moderate Stories"
              value={String(blogs.length)}
              description="Editorial queue"
              icon={BookOpen}
              className={blogs.length > 0 ? "border-amber-100 bg-amber-50/50" : ""}
            />
            <StatCard
              title="Live Events"
              value={String(stats?.totalEvents ?? 0)}
              description="Platform wide activities"
              icon={Calendar}
            />
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
              {/* Applications Table */}
              <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-50 px-10 py-8">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Mentor Applications</h3>
                  <Button href="/admin/teachers" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Review Queue</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-50">
                      {applications.length === 0 ? (
                        <tr><td className="py-20 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">Queue Clear</td></tr>
                      ) : (
                        applications.slice(0, 4).map((app) => (
                          <tr key={app._id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-10 py-6 flex items-center gap-5">
                               <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center font-black text-amber-600 text-sm border border-amber-100">{(app.userId?.name || app.fullName).charAt(0)}</div>
                               <div>
                                  <p className="text-sm font-black text-slate-800">{app.userId?.name || app.fullName}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.specialization}</p>
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <Button href="/admin/teachers" variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Review</Button>
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
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">Editorial Moderation</h3>
                  <Button href="/admin/blogs" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Open Editor</Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-slate-50">
                      {blogs.length === 0 ? (
                        <tr><td className="py-20 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">Everything Published</td></tr>
                      ) : (
                        blogs.slice(0, 4).map((blog) => (
                          <tr key={blog._id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-10 py-6 flex items-center gap-5">
                               <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10">{(blog.author?.name || "B").charAt(0)}</div>
                               <div>
                                  <p className="text-sm font-black text-slate-800">{blog.title}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {blog.author?.name}</p>
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <Button href="/admin/blogs" variant="ghost" size="sm" className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Moderate</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* Quick Actions */}
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                 <h3 className="text-xs font-black text-primary uppercase tracking-[0.4em] mb-10">Executive Suite</h3>
                 <div className="space-y-4 relative z-10">
                    {[
                      { label: "Manage Directory", href: "/admin/users", icon: Users },
                      { label: "Curriculum Forge", href: "/admin/lessons", icon: BookOpen },
                      { label: "Asset Center", href: "/admin/events", icon: Calendar },
                      { label: "Financial Models", onClick: () => setActiveTab('plans'), icon: Settings, isRole: true },
                      { label: "Revenue Base", onClick: () => setActiveTab('premium'), icon: Crown, isRole: true },
                    ].map((item) => (
                      item.href ? (
                        <Link key={item.label} href={item.href} className="flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/btn">
                           <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-slate-500 group-hover/btn:text-primary transition-colors" />
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-white transition-colors">{item.label}</span>
                           </div>
                           <ArrowRight className="h-4 w-4 text-slate-700 group-hover/btn:text-primary transition-all group-hover/btn:translate-x-1" />
                        </Link>
                      ) : (
                        <button key={item.label} onClick={item.onClick} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group/btn">
                           <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-slate-500 group-hover/btn:text-primary transition-colors" />
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover/btn:text-white transition-colors">{item.label}</span>
                           </div>
                           <ArrowRight className="h-4 w-4 text-slate-700 group-hover/btn:text-primary transition-all group-hover/btn:translate-x-1" />
                        </button>
                      )
                    ))}
                 </div>
              </div>

              {/* Notification / Alert */}
              <div className="rounded-[2.5rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
                 <Globe className="absolute -bottom-10 -right-10 h-48 w-48 text-white/10" />
                 <h4 className="text-lg font-black tracking-tight mb-4 leading-tight uppercase">System Health</h4>
                 <p className="text-xs font-bold text-indigo-100/70 leading-relaxed mb-6 italic">Secure nodes active. Encryption protocols version 4.2 active. Webhook sync at 100%.</p>
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Network Stable</span>
                 </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'plans' && (
        <div className="animate-in slide-in-from-bottom-4 duration-700">
           <div className="rounded-[2.5rem] border border-slate-100 bg-white shadow-2xl shadow-slate-200/20 overflow-hidden">
              <div className="p-10 border-b border-slate-50">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tight">Financial Models & Subscription Logic</h3>
                 <p className="text-sm font-medium text-slate-500 italic mt-2">Adjust pricing, limits and tier accessibility in real-time across the platform.</p>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Plan Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly / Yearly ($)</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Limits (Cat/Tutor/Evt)</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Stripe Integration</th>
                          <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Admin Control</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {planSettings.map(plan => {
                          const isEditing = editingPlan === plan._id;
                          return (
                             <tr key={plan._id} className="hover:bg-slate-50/30 transition-all group">
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-5">
                                      <div className={cn(
                                         "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm border",
                                         plan.plan === 'FREE' ? "bg-slate-50 text-slate-400 border-slate-100" : (plan.plan === 'PREMIUM' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/10")
                                      )}>
                                         {plan.plan.charAt(0)}
                                      </div>
                                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{plan.plan.replace('_', ' ')}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   {isEditing ? (
                                      <div className="flex gap-2">
                                         <input 
                                            type="number" 
                                            value={editFormData.monthlyPrice} 
                                            onChange={(e) => setEditFormData({...editFormData, monthlyPrice: Number(e.target.value)})}
                                            className="w-16 p-2 text-xs font-black border rounded-lg border-primary/20 bg-primary/5 text-primary"
                                         />
                                         <input 
                                            type="number" 
                                            value={editFormData.yearlyPrice} 
                                            onChange={(e) => setEditFormData({...editFormData, yearlyPrice: Number(e.target.value)})}
                                            className="w-16 p-2 text-xs font-black border rounded-lg border-primary/20 bg-primary/5 text-primary"
                                         />
                                      </div>
                                   ) : (
                                      <span className="text-xs font-black text-slate-600">${plan.monthlyPrice} / ${plan.yearlyPrice}</span>
                                   )}
                                </td>
                                <td className="px-10 py-6">
                                   {isEditing ? (
                                      <div className="flex gap-2">
                                         <input 
                                            type="number" 
                                            title="Categories"
                                            value={editFormData.categoryLimit ?? 0} 
                                            onChange={(e) => setEditFormData({...editFormData, categoryLimit: Number(e.target.value)})}
                                            className="w-12 p-2 text-xs font-bold border rounded-lg"
                                         />
                                         <input 
                                            type="number" 
                                            title="Tutor Sessions"
                                            value={editFormData.tutorSupportLimit} 
                                            onChange={(e) => setEditFormData({...editFormData, tutorSupportLimit: Number(e.target.value)})}
                                            className="w-12 p-2 text-xs font-bold border rounded-lg"
                                         />
                                         <input 
                                            type="number" 
                                            title="Events"
                                            value={editFormData.eventLimit} 
                                            onChange={(e) => setEditFormData({...editFormData, eventLimit: Number(e.target.value)})}
                                            className="w-12 p-2 text-xs font-bold border rounded-lg"
                                         />
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                         {plan.categoryLimit ?? '∞'} Cat · {plan.tutorSupportLimit} Tut · {plan.eventLimit} Evt
                                      </span>
                                   )}
                                </td>
                                <td className="px-10 py-6">
                                   {plan.plan === 'FREE' ? (
                                      <span className="text-[10px] font-bold text-slate-300 italic">No Bridge Required</span>
                                   ) : (
                                      <div className="flex items-center gap-2 group-hover:scale-105 transition-transform origin-left">
                                         <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{plan.stripeMonthlyPriceId ? 'Active' : 'Missing ID'}</span>
                                      </div>
                                   )}
                                </td>
                                <td className="px-10 py-6 text-right">
                                   {isEditing ? (
                                      <div className="flex justify-end gap-2">
                                         <button onClick={() => setEditingPlan(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors">
                                            <AlertCircle className="h-5 w-5" />
                                         </button>
                                         <button onClick={handleSavePlan} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                            <Save className="h-4 w-4" />
                                         </button>
                                      </div>
                                   ) : (
                                      <button onClick={() => handleEditPlan(plan)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border/60 text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all">
                                         <Settings className="h-5 w-5" />
                                      </button>
                                   )}
                                </td>
                             </tr>
                          )
                       })}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'premium' && (
        <div className="animate-in slide-in-from-bottom-4 duration-700">
          <div className="rounded-[3rem] border border-amber-100 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 overflow-hidden shadow-2xl shadow-amber-200/10">
            <div className="flex items-center justify-between border-b border-amber-100 px-10 py-10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-amber-100 flex items-center justify-center border-2 border-white shadow-xl shadow-amber-200/40">
                  <Crown className="h-8 w-8 text-amber-600 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Elite Collective</h3>
                  <p className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                     <span className="h-1 w-1 bg-amber-400 rounded-full animate-pulse" />
                     {premiumUsers.length} High-Tier Pulse Members
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="hidden md:flex flex-col text-right">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Revenue Nodes</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">${premiumUsers.reduce((acc, u) => acc + (u.subscription?.plan === 'PREMIUM' ? 7.94 : 3.81), 0).toFixed(2)} / mo</span>
                 </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-amber-50/50 border-b border-amber-100/60">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Subscriber Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Access Tier</th>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Cycle Node</th>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Exp Date</th>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest">Geographic Pulse</th>
                    <th className="px-10 py-6 text-[10px] font-black text-amber-700/60 uppercase tracking-widest text-right">Node Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/40">
                  {premiumUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-24 text-center">
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.4em] italic">No active elite members</p>
                      </td>
                    </tr>
                  ) : (
                    premiumUsers.map((pu) => (
                      <tr key={pu._id} className="hover:bg-amber-50/40 transition-all group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center font-black text-amber-700 text-sm border border-amber-200 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-amber-200/20">{pu.name?.charAt(0)}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight">{pu.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 italic mt-0.5">{pu.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <span className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] border transition-all",
                              pu.subscription?.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-700 border-amber-200 shadow-md shadow-amber-200/10' : 'bg-primary/5 text-primary border-primary/10'
                           )}>
                              <Star className={cn("h-3 w-3", pu.subscription?.plan === 'PREMIUM' ? 'fill-amber-600' : 'fill-primary')} />
                              {pu.subscription?.plan}
                           </span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{pu.subscription?.billingCycle}</span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                             {pu.subscription?.currentPeriodEnd ? new Date(pu.subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '∞'}
                           </span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-slate-400 font-serif italic">{pu.country || 'Global'}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                              <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" />
                              Active Node
                           </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



