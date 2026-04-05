"use client";

import React, { useEffect, useState } from "react";
import StatCard from "@/components/features/dashboard/StatCard";
import { Users, GraduationCap, BookOpen, Calendar, Loader2, AlertCircle, ArrowRight, Globe, Crown, Star, Settings, Check, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  getAllUsers, 
  getAllTutors, 
  getAdminStats, 
  AdminStats, 
  BaseUser, 
  getPremiumUsers, 
  PremiumUser,
  getPlanSettings,
  updatePlanSettings,
  createPlanSettings,
  deletePlanSettings,
  PlanSettings,
  getMentorApplications
} from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import { getTutorApplicationsAdmin } from "@/services/tutorApplicationService";
import { getAllBlogsForAdmin, Blog } from "@/services/blogService";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'premium'>('overview');
  const [admin, setAdmin] = useState<SafeUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [tutors, setTutors] = useState<BaseUser[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
  const [planSettings, setPlanSettings] = useState<PlanSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<PlanSettings>>({});

  useEffect(() => {
    (async () => {
      try {
        const [me, s, ts, bl, mentors, evs, prem, plans] = await Promise.all([
          getMe(),
          getAdminStats(),
          getAllTutors(1, 4),
          getAllBlogsForAdmin(),
          getMentorApplications(),
          getEvents(),
          getPremiumUsers(1, 10),
          getPlanSettings(),
        ]);
        setAdmin(me);
        setStats(s);
        setTutors(ts.tutors);
        setBlogs(bl.blogs.filter(b => b.status === 'pending'));
        setApplications(mentors);
        setEvents(evs.events);
        setPremiumUsers(prem.users);
        setPlanSettings(plans);
      } catch (err) {
        setError("Could not load dashboard data. Check backend connection.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEditPlan = (plan: PlanSettings) => {
    setEditingPlan(plan._id);
    setEditFormData(plan);
  };

  const handleSavePlan = async () => {
    try {
      if (isCreatingPlan) {
        const created = await createPlanSettings(editFormData);
        setPlanSettings(prev => [...prev, created]);
        setIsCreatingPlan(false);
        setEditingPlan(null);
      } else if (editingPlan) {
        const updated = await updatePlanSettings(editingPlan, editFormData);
        setPlanSettings(prev => prev.map(p => p._id === editingPlan ? updated : p));
        setEditingPlan(null);
      }
    } catch (err) {
      alert("Failed to update plan settings.");
    }
  };

  const handleStartCreate = () => {
    setIsCreatingPlan(true);
    setEditingPlan('NEW');
    setEditFormData({
      plan: 'NEW_TIER',
      monthlyPrice: 0,
      yearlyPrice: 0,
      categoryLimit: 1,
      tutorSupportLimit: 0,
      eventLimit: 0,
      isEnabled: true,
      stripeMonthlyPriceId: '',
      stripeYearlyPriceId: ''
    });
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to retire this financial model? This cannot be undone.")) return;
    try {
      await deletePlanSettings(id);
      setPlanSettings(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete plan.");
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
               <h1 className="text-2xl md:text-3xl font-black text-text-primary tracking-tighter leading-none mb-4">Command Deck</h1>
              <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-2xl opacity-80">
                Orchestrating the ecosystem of classical Tamil learning. Managed by <strong className="text-primary">{admin?.name}</strong>.
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
                    activeTab === tab ? "bg-white shadow-xl shadow-black/5 text-primary" : "text-primary/60 hover:text-slate-600"
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
              title="Verified Teachers"
              value={String(stats?.totalTutors ?? 0)}
              description="Certified teachers"
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
                               <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center font-black text-amber-600 text-sm border border-amber-100">{(app.cleanName || app.name || "U").charAt(0)}</div>
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
                  <h3 className="text-xl font-black text-text-primary tracking-tight">Editorial Moderation</h3>
                  <Button href="/admin/blogs" variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/10 rounded-xl">Open Editor</Button>
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
                                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">By {blog.author?.name}</p>
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
              <div className="rounded-[2.5rem] bg-white p-10 text-text-primary shadow-2xl shadow-slate-200/20 relative overflow-hidden group border border-slate-100">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
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
                        <Link key={item.label} href={item.href} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group/btn">
                           <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-primary/60 group-hover/btn:text-primary transition-colors" />
                              <span className="text-xs font-black uppercase tracking-widest text-primary/70 group-hover/btn:text-primary transition-colors">{item.label}</span>
                           </div>
                           <ArrowRight className="h-4 w-4 text-primary/40 group-hover/btn:text-primary transition-all group-hover/btn:translate-x-1" />
                        </Link>
                      ) : (
                        <button key={item.label} onClick={item.onClick} className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group/btn">
                           <div className="flex items-center gap-4">
                              <item.icon className="h-5 w-5 text-primary/60 group-hover/btn:text-primary transition-colors" />
                              <span className="text-xs font-black uppercase tracking-widest text-primary/70 group-hover/btn:text-primary transition-colors">{item.label}</span>
                           </div>
                           <ArrowRight className="h-4 w-4 text-primary/40 group-hover/btn:text-primary transition-all group-hover/btn:translate-x-1" />
                        </button>
                      )
                    ))}
                 </div>
              </div>

              {/* Notification / Alert */}
              <div className="rounded-[2.5rem] bg-indigo-600 p-10 text-white shadow-2xl shadow-indigo-600/30 overflow-hidden relative">
                 <Globe className="absolute -bottom-10 -right-10 h-48 w-48 text-white/10" />
                 <h4 className="text-lg font-black tracking-tight mb-4 leading-tight uppercase">System Health</h4>
                 <p className="text-xs font-bold text-indigo-100/70 leading-relaxed mb-6">Secure nodes active. Encryption protocols version 4.2 active. Webhook sync at 100%.</p>
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
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <div>
                    <h3 className="text-xl font-black text-text-primary tracking-tight">Financial Models & Subscription Logic</h3>
                    <p className="text-sm font-medium text-primary/70 mt-2">Adjust pricing, limits and tier accessibility in real-time across the platform.</p>
                 </div>
                 <button 
                  onClick={handleStartCreate}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                 >
                    <Plus className="h-4 w-4" /> Create New Model
                 </button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                       <tr>
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest">Plan Identity</th>
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest">Monthly / Yearly ($)</th>
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest">Limits (Cat/Tutor/Evt)</th>
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest">Stripe Integration</th>
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest text-right">Admin Control</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {isCreatingPlan && (
                          <tr className="bg-primary/5 animate-pulse">
                             <td className="px-10 py-6">
                                <div className="flex items-center gap-5">
                                   <div className="h-12 w-12 rounded-2xl bg-white border border-primary/20 flex items-center justify-center font-black text-primary text-sm">+</div>
                                   <input 
                                      type="text" 
                                      placeholder="PLAN NAME"
                                      value={editFormData.plan} 
                                      onChange={(e) => setEditFormData({...editFormData, plan: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                                      className="text-xs font-black p-2 border rounded-lg uppercase tracking-tight outline-none w-32 border-primary/20 bg-white"
                                   />
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex gap-2">
                                   <input type="number" placeholder="Mo" className="w-16 p-2 text-xs border rounded-lg" onChange={e => setEditFormData({...editFormData, monthlyPrice: Number(e.target.value)})}/>
                                   <input type="number" placeholder="Yr" className="w-16 p-2 text-xs border rounded-lg" onChange={e => setEditFormData({...editFormData, yearlyPrice: Number(e.target.value)})}/>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <div className="flex gap-2">
                                   <input type="number" title="Cat" className="w-12 p-2 text-xs border rounded-lg" onChange={e => setEditFormData({...editFormData, categoryLimit: Number(e.target.value)})}/>
                                   <input type="number" title="Tut" className="w-12 p-2 text-xs border rounded-lg" onChange={e => setEditFormData({...editFormData, tutorSupportLimit: Number(e.target.value)})}/>
                                   <input type="number" title="Evt" className="w-12 p-2 text-xs border rounded-lg" onChange={e => setEditFormData({...editFormData, eventLimit: Number(e.target.value)})}/>
                                </div>
                             </td>
                             <td className="px-10 py-6">
                                <span className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Awaiting Pulse</span>
                             </td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                   <button onClick={() => {setIsCreatingPlan(false); setEditingPlan(null);}} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border text-primary/60 hover:bg-slate-50 transition-colors">
                                      <AlertCircle className="h-5 w-5" />
                                   </button>
                                   <button onClick={handleSavePlan} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                      <Save className="h-4 w-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       )}
                       {planSettings.map(plan => {
                          const isEditing = editingPlan === plan._id;
                          return (
                             <tr key={plan._id} className="hover:bg-slate-50/30 transition-all group">
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-5">
                                      <div className={cn(
                                         "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm border",
                                         plan.plan === 'FREE' ? "bg-slate-50 text-primary/60 border-slate-100" : (plan.plan === 'PREMIUM' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-primary/5 text-primary border-primary/10")
                                      )}>
                                         {plan.plan.charAt(0)}
                                      </div>
                                      {isEditing ? (
                                          <input 
                                             type="text" 
                                             value={editFormData.plan} 
                                             onChange={(e) => setEditFormData({...editFormData, plan: e.target.value.toUpperCase().replace(/\s+/g, '_')})}
                                             className="text-xs font-black p-2 border rounded-lg uppercase tracking-tight w-32 outline-none bg-primary/5 border-primary/20"
                                          />
                                       ) : (
                                          <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{plan.plan.replace('_', ' ')}</span>
                                       )}
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
                                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                         {plan.categoryLimit ?? '∞'} Cat · {plan.tutorSupportLimit} Tut · {plan.eventLimit} Evt
                                      </span>
                                   )}
                                </td>
                                <td className="px-10 py-6">
                                   {plan.plan === 'FREE' ? (
                                      <span className="text-[10px] font-bold text-primary/40">No Bridge Required</span>
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
                                         <button onClick={() => {setEditingPlan(null); setIsCreatingPlan(false);}} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-primary/60 hover:bg-slate-200 transition-colors">
                                            <AlertCircle className="h-5 w-5" />
                                         </button>
                                         <button onClick={handleSavePlan} className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all">
                                            <Save className="h-4 w-4" />
                                         </button>
                                      </div>
                                   ) : (
                                      <div className="flex justify-end gap-3">
                                         <button onClick={() => handleEditPlan(plan)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border/60 text-primary/60 hover:text-primary hover:border-primary/20 hover:shadow-lg transition-all">
                                            <Settings className="h-5 w-5" />
                                         </button>
                                         <button onClick={() => handleDeletePlan(plan._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-border/60 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-all">
                                            <Trash2 className="h-4 w-4" />
                                         </button>
                                      </div>
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
                   <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Elite Collective</h3>
                  <p className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                     <span className="h-1 w-1 bg-amber-400 rounded-full animate-pulse" />
                     {premiumUsers.length} High-Tier Pulse Members
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="hidden md:flex flex-col text-right">
                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Active Revenue Nodes</span>
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
                        <p className="text-xs font-black text-primary/40 uppercase tracking-[0.4em]">No active elite members</p>
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
                                 <p className="text-[10px] font-bold text-primary/60 mt-0.5">{pu.email}</p>
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
                           <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">{pu.subscription?.billingCycle}</span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">
                             {pu.subscription?.currentPeriodEnd ? new Date(pu.subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '∞'}
                           </span>
                        </td>
                        <td className="px-10 py-6">
                           <span className="text-[10px] font-black text-primary/60 font-serif">{pu.country || 'Global'}</span>
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
















