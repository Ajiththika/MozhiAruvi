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
  getMentorApplications,
  MentorApplicationResult
} from "@/services/adminService";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { getMe, SafeUser } from "@/services/authService";
import { getTutorApplicationsAdmin } from "@/services/tutorService";
import { getAllBlogsForAdmin, Blog } from "@/services/blogService";
import Button from "@/components/ui/Button";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'premium'>('overview');
  const [admin, setAdmin] = useState<SafeUser | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [tutors, setTutors] = useState<BaseUser[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [applications, setApplications] = useState<MentorApplicationResult[]>([]);
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
    } catch {
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
    } catch {
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
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <div className="h-1.5 w-6 rounded-full bg-primary" />
               <span className="text-[10px] font-black text-primary/60 tracking-[0.3em] uppercase">Control Center</span>
           </div>
           <div className="space-y-2">
               <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter leading-none">Command Deck</h1>
              <p className="text-lg text-primary/70 font-medium leading-relaxed max-w-3xl">
                Orchestrating the ecosystem of classical Tamil learning. Managed by <strong className="text-primary underline underline-offset-8 decoration-2 decoration-primary/20">{admin?.name}</strong>.
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
              title="Audit Stories"
              value={String(blogs.length)}
              description="Editorial queue"
              icon={BookOpen}
              className={blogs.length > 0 ? "border-indigo-100 bg-indigo-50/50 shadow-lg shadow-indigo-200/20" : ""}
            />
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
                                  <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">By {blog.author?.name}</p>
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
                          <th className="px-10 py-6 text-[10px] font-black text-primary/70 uppercase tracking-widest">Category Limit</th>
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
                                   <input type="number" title="Cat" className="w-20 p-2 text-xs border rounded-lg" placeholder="CAT LIMIT" onChange={e => setEditFormData({...editFormData, categoryLimit: Number(e.target.value)})}/>
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
                       {planSettings.filter(p => !p.plan.includes('BUSINESS')).map(plan => {
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
                                            className="w-20 p-2 text-xs font-bold border rounded-lg"
                                         />
                                      </div>
                                   ) : (
                                      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">
                                         {plan.categoryLimit ?? '∞'} Categories
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
          <div className="rounded-[3rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/30 overflow-hidden shadow-2xl shadow-indigo-200/10">
            <div className="flex items-center justify-between border-b border-indigo-50 px-10 py-10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center border-2 border-white shadow-xl shadow-indigo-200/40">
                  <Crown className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Elite Collective</h3>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2 mt-1">
                     <span className="h-1 w-1 bg-indigo-400 rounded-full animate-pulse" />
                     {premiumUsers.length} High-Tier Pulse Members
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                 <div className="hidden md:flex flex-col text-right">
                    <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Active Revenue Nodes</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight text-indigo-600">${premiumUsers.reduce((acc, u) => acc + (u.subscription?.plan === 'PREMIUM' ? 7.94 : 3.81), 0).toFixed(2)} / mo</span>
                 </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 border-b border-indigo-50/60">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Subscriber Identity</th>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Access Tier</th>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Cycle Node</th>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Exp Date</th>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest">Geographic Pulse</th>
                    <th className="px-10 py-6 text-[10px] font-black text-indigo-700/60 uppercase tracking-widest text-right">Node Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/40">
                  {premiumUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <div className="flex flex-col items-center gap-4">
                           <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
                              <Star className="h-6 w-6" />
                           </div>
                           <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em]">Propagating Elite Nodes...</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    premiumUsers.map((pu) => (
                      <tr key={pu._id} className="hover:bg-indigo-50/20 transition-all group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-5">
                              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-700 text-sm border border-indigo-100 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-indigo-200/20">{pu.name?.charAt(0)}</div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 tracking-tight">{pu.name}</p>
                                 <p className="text-[10px] font-bold text-primary/60 mt-0.5">{pu.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-6">
                           <span className={cn(
                              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm",
                              pu.subscription?.plan === 'PREMIUM' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-primary/5 text-primary border-primary/10'
                           )}>
                              <Star className={cn("h-3 w-3", pu.subscription?.plan === 'PREMIUM' ? 'fill-white' : 'fill-primary')} />
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
                           <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                              <div className="h-1 w-1 bg-indigo-500 rounded-full animate-pulse" />
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
