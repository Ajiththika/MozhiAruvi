"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UserCircle, Mail, MapPin, Phone, Hash, Save, AlertCircle, CheckCircle, Globe, Sparkles, Camera, Trash2, GraduationCap, Clock, Edit3, X, Zap, Award, Banknote, Briefcase } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function TutorProfileSettings() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    country: "",
    age: "",
    gender: "",
    bio: "",
    specialization: "",
    experience: "",
    hourlyRate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
        bio: user.bio || "",
        specialization: user.specialization || "",
        experience: user.experience || "",
        // @ts-ignore
        hourlyRate: user.hourlyRate ? String(user.hourlyRate) : "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        fd.append(key, value);
      });
      
      if (selectedFile) fd.append("profilePhoto", selectedFile);

      const res = await api.patch("/tutors/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.tutor);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Profile refined successfully!" });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Integration error." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Mentor Profile...</p>
    </div>
  );

  if (!user) return (
     <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-error" />
        <p className="text-slate-600 font-bold">Authentication mismatch.</p>
        <button onClick={() => window.location.href = "/auth/signin"} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Login Hub</button>
     </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-xl border border-border shadow-soft/20">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-secondary/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-40 w-40 rounded-3xl overflow-hidden bg-surface-soft border-4 border-white shadow-2xl ring-1 ring-border group-hover:ring-secondary/30 transition-all duration-500">
                {(previewUrl || user.profilePhoto) ? (
                  <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-secondary/5">
                    <UserCircle className="h-20 w-20 text-secondary/20" />
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute -bottom-2 -right-2 h-8 w-8 rounded-xl border-4 border-white shadow-lg flex items-center justify-center",
                user.isTutorAvailable ? "bg-emerald-500" : "bg-slate-400"
              )}>
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h2 className="text-4xl font-black tracking-tighter text-slate-900">{user.name}</h2>
                <span className="px-4 py-1.5 rounded-full bg-secondary/5 border border-secondary/10 text-[10px] font-black uppercase tracking-widest text-secondary">
                  Verified Language Mentor
                </span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-sm tracking-tight">
                <Mail className="h-4 w-4 text-secondary" /> {user.email}
              </p>
              
              <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                 <button
                    onClick={async () => {
                       const updated = await api.patch("/tutors/me/availability", { isTutorAvailable: !user.isTutorAvailable });
                       setUser({ ...user, isTutorAvailable: updated.data.isTutorAvailable });
                    }}
                    className={cn(
                       "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                       user.isTutorAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                    )}
                 >
                    <div className={cn("h-2 w-2 rounded-full", user.isTutorAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                    {user.isTutorAvailable ? "Accepting Students" : "Availability Paused"}
                 </button>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsEditing(true)}
            variant="secondary" 
            size="xl" 
            className="rounded-2xl px-10 shadow-lg shadow-secondary/20 group translate-y-[-10px]"
          >
            <Edit3 className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
            Customize Desk
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── TEACHING STATS ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-8">
           <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-32 w-32 bg-secondary/10 rounded-full blur-2xl -ml-16 -mt-16" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-8">Professional Metrics</h4>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                      <Zap className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Hourly Rate (XP)</p>
                      <p className="text-2xl font-black">{user.hourlyRate || 0}</p>
                   </div>
                </div>

                <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <Banknote className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Earnings</p>
                      <p className="text-2xl font-black">{user.credits || 0}</p>
                   </div>
                </div>

                <div className="pt-4 space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                      <p>Teaching Credibility</p>
                      <p className="text-secondary">Verified</p>
                   </div>
                   <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5].map(i => <Award key={i} className="h-5 w-5 text-amber-500 fill-current" />)}
                   </div>
                </div>
              </div>
           </div>

           <div className="rounded-2xl bg-white p-8 border border-border shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Mentorship Specs</h4>
              <div className="space-y-5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-soft flex items-center justify-center text-primary">
                       <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Specialization</p>
                       <p className="text-sm font-bold text-slate-800">{user.specialization || "General Mentor"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-soft flex items-center justify-center text-secondary">
                       <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Experience</p>
                       <p className="text-sm font-bold text-slate-800">{user.experience || "Native Speaker"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-soft flex items-center justify-center text-emerald-500">
                       <Clock className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Response Time</p>
                       <p className="text-sm font-bold text-slate-800">~24 hrs</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── PROFESSIONAL BACKGROUND ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-2xl bg-white p-10 border border-border shadow-sm min-h-[400px]">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                   <Briefcase className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Academic & Teaching Bio</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="p-8 rounded-[2rem] bg-surface-soft/40 border border-border/40 relative">
                    <div className="absolute top-4 left-4 h-8 w-8 text-secondary opacity-10">
                       <Zap className="h-full w-full" />
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                       {user.bio || "Craft a professional bio to attract students seeking your expertise."}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Country</p>
                        <p className="text-xs font-black text-slate-800 truncate">{user.country || "Earth"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                        <p className="text-xs font-black text-slate-800">{user.age || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-xs font-black text-slate-800 capitalize">{user.gender || "Any"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                        <p className="text-xs font-black text-slate-800">{new Date(user.createdAt || "").toLocaleDateString("en-GB", { month: 'short', year: 'numeric' })}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between p-8 border-b border-border bg-surface-soft/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                       <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Professional Configuration</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Calibrate your mentor identity</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="p-3 rounded-2xl hover:bg-error/10 text-slate-400 hover:text-error transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
                 <div className="flex flex-col items-center gap-6 mb-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-surface-soft border-2 border-dashed border-secondary/20 group-hover:border-secondary transition-all">
                          {(previewUrl || user.profilePhoto) ? (
                            <img src={previewUrl || user.profilePhoto || ""} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-secondary/30">
                               <Camera className="h-8 w-8" />
                            </div>
                          )}
                       </div>
                       <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2rem]">
                          <Camera className="h-6 w-6 text-white" />
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mentor Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} required className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Specialization</label>
                       <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Tamil Grammar" className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Experience Years</label>
                       <input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5+ Years" className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Hourly Rate (XP)</label>
                       <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Phone</label>
                       <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operation Country</label>
                       <input name="country" value={formData.country} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Professional Bio</label>
                    <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full rounded-3xl bg-surface-soft border border-border p-6 text-sm font-medium text-slate-700 focus:bg-white focus:border-secondary transition-all outline-none resize-none" />
                 </div>

                 <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" isLoading={loading} variant="secondary" size="xl" className="flex-1 rounded-2xl shadow-xl shadow-secondary/20">
                       Save Transformations
                    </Button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-10 h-[60px] rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                       Discard
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {message.text && (
        <div className={`fixed bottom-10 right-10 p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl animate-in slide-in-from-right duration-500 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-error text-white'}`}>
           {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
           <p className="font-black uppercase text-[10px] tracking-widest text-white">{message.text}</p>
        </div>
      )}
    </div>
  );
}





