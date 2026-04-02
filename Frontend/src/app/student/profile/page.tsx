"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UserCircle, Mail, MapPin, Phone, Hash, Save, AlertCircle, CheckCircle, Globe, Sparkles, Camera, Trash2, GraduationCap, Clock, Edit3, X, Zap, Award } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import ImageAdjuster from "@/components/ui/ImageAdjuster";

export default function StudentProfile() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    country: "",
    age: "",
    gender: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [adjustImage, setAdjustImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        country: user.country || "",
        age: user.age ? String(user.age) : "",
        gender: user.gender || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setAdjustImage(url);
    }
  };

  const handleAdjustConfirm = (croppedBlob: Blob) => {
    const file = new File([croppedBlob], "profile.jpg", { type: "image/jpeg" });
    setSelectedFile(file);
    const url = URL.createObjectURL(croppedBlob);
    setPreviewUrl(url);
    setAdjustImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("country", formData.country);
      fd.append("age", formData.age);
      fd.append("gender", formData.gender);
      fd.append("bio", formData.bio);
      
      if (selectedFile) fd.append("profilePhoto", selectedFile);

      const res = await api.patch("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.user);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Profile...</p>
    </div>
  );

  if (!user) return (
    <div className="p-8 text-center flex flex-col items-center gap-4">
      <AlertCircle className="h-12 w-12 text-error" />
      <p className="text-slate-600 font-bold">Session identity required.</p>
      <button onClick={() => window.location.href = "/auth/signin"} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Sign In Portal</button>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-xl border border-border shadow-soft/20">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-40 w-40 rounded-3xl overflow-hidden bg-surface-soft border-4 border-white shadow-2xl ring-1 ring-border group-hover:ring-primary/30 transition-all duration-500">
                {(previewUrl || user.profilePhoto) ? (
                  <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/5">
                    <UserCircle className="h-20 w-20 text-primary/20" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h2 className="text-4xl font-black tracking-tighter text-slate-900">{user.name}</h2>
                <span className="px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-[10px] font-black uppercase tracking-widest text-primary">
                  Student Learner
                </span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-bold text-sm tracking-tight">
                <Mail className="h-4 w-4 text-primary" /> {user.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled since</p>
                   <p className="text-sm font-bold text-slate-800">{new Date(user.createdAt || "").toLocaleDateString("en-GB", { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</p>
                   <p className="text-sm font-black text-secondary">{user.level || "Beginner"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsEditing(true)}
            variant="primary" 
            size="xl" 
            className="rounded-2xl px-10 shadow-lg shadow-primary/20 group translate-y-[-10px]"
          >
            <Edit3 className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
            Customize Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEARNING STATS ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-8">
           <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-8">Performance Engine</h4>
              
              <div className="space-y-6">
                <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <Zap className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Knowledge XP</p>
                      <p className="text-2xl font-black">{user.xp || 0}</p>
                   </div>
                </div>

                <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                   <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                      <Award className="h-6 w-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Tokens / Credits</p>
                      <p className="text-2xl font-black">{user.credits || 0}</p>
                   </div>
                </div>

                <div className="pt-4">
                   <div className="flex justify-between items-end mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Curriculum progress</p>
                      <p className="text-sm font-black text-primary">85%</p>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-primary to-secondary" />
                   </div>
                </div>
              </div>
           </div>

           <div className="rounded-2xl bg-white p-8 border border-border shadow-sm">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Quick Connectivity</h4>
              <div className="space-y-5">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-soft flex items-center justify-center text-primary">
                       <Phone className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mobile</p>
                       <p className="text-sm font-bold text-slate-800">{user.phoneNumber || "Not provided"}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-soft flex items-center justify-center text-secondary">
                       <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Current Country</p>
                       <p className="text-sm font-bold text-slate-800">{user.country || "Earth"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* ── BIOGRAPHY & INFO ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-2xl bg-white p-10 border border-border shadow-sm min-h-[400px]">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-secondary/5 flex items-center justify-center text-secondary">
                   <Edit3 className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900">Personal Background</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="p-8 rounded-[2rem] bg-surface-soft/40 border border-border/40 relative">
                    <div className="absolute top-4 left-4 h-8 w-8 text-primary opacity-10">
                       <Zap className="h-full w-full" />
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                       {user.bio || "No biography provided yet. Tell us about your passion for Tamil culture!"}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Age Identity</p>
                        <p className="text-lg font-bold text-slate-800">{user.age ? `${user.age} Years Old` : "Confidential"}</p>
                    </div>
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Gender Perspective</p>
                        <p className="text-lg font-bold text-slate-800 capitalize">{user.gender || "Not specified"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between p-8 border-b border-border bg-surface-soft/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                       <Camera className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">Profile Architecture</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Update your digital identity</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="p-3 rounded-2xl hover:bg-error/10 text-slate-400 hover:text-error transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                  <div className="flex flex-col items-center gap-6 mb-4">
                    <div className="relative group">
                       <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-surface-soft border-2 border-dashed border-primary/20 group-hover:border-primary transition-all">
                          {(previewUrl || user.profilePhoto) ? (
                            <img src={previewUrl || user.profilePhoto || ""} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-primary/30">
                               <Camera className="h-8 w-8" />
                            </div>
                          )}
                       </div>
                       
                       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] flex items-center justify-center gap-3">
                          <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()} 
                            title="Upload New"
                            className="p-3 bg-white rounded-xl text-slate-900 hover:scale-110 transition-transform shadow-xl"
                          >
                             <Camera size={18} />
                          </button>
                          {(previewUrl || user.profilePhoto) && (
                            <>
                              <button 
                                type="button"
                                onClick={() => {
                                   if (previewUrl || user.profilePhoto) {
                                      setAdjustImage(previewUrl || user.profilePhoto || "");
                                   }
                                }} 
                                title="Re-adjust Crop"
                                className="p-3 bg-white rounded-xl text-primary hover:scale-110 transition-transform shadow-xl"
                              >
                                 <Edit3 size={18} />
                              </button>
                              <button 
                                type="button"
                                onClick={() => {
                                   setSelectedFile(null);
                                   setPreviewUrl(null);
                                   if (fileInputRef.current) fileInputRef.current.value = "";
                                }} 
                                title="Remove Photo"
                                className="p-3 bg-white rounded-xl text-red-500 hover:scale-110 transition-transform shadow-xl"
                              >
                                 <Trash2 size={18} />
                              </button>
                            </>
                          )}
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic outline-none">Hover to Manage Identity Avatar</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} required className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Contact Number</label>
                       <div className="relative">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border pl-14 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Current Country</label>
                       <div className="relative">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input name="country" value={formData.country} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border pl-14 pr-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Age</label>
                          <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none">
                             <option value="">Select</option>
                             <option value="male">Male</option>
                             <option value="female">Female</option>
                             <option value="other">Other</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Short Biography</label>
                    <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full rounded-3xl bg-surface-soft border border-border p-6 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary transition-all outline-none resize-none" />
                 </div>

                 <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" isLoading={loading} variant="primary" size="xl" className="flex-1 rounded-2xl shadow-xl shadow-primary/20">
                       Deploy Identity
                    </Button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-10 h-[60px] rounded-2xl bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                       Abort Changes
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {adjustImage && (
        <ImageAdjuster 
          image={adjustImage} 
          aspect={1} 
          onConfirm={handleAdjustConfirm} 
          onCancel={() => setAdjustImage(null)} 
        />
      )}

      {message.text && (
        <div className={`fixed bottom-10 right-10 p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl animate-in slide-in-from-right duration-500 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-error text-white'}`}>
           {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
           <p className="font-black uppercase text-[10px] tracking-widest">{message.text}</p>
        </div>
      )}
    </div>
  );
}



