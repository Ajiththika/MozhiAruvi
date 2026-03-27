"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Mail, MapPin, Phone, Hash, Save, AlertCircle, CheckCircle, Globe, Sparkles, Camera, Trash2, GraduationCap, Clock, Edit3, X, Shield, Users, Database, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Button from "@/components/ui/Button";

export default function AdminProfile() {
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

      const res = await api.patch("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.user);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Administrative profile refined." });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Protocol failure." });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Accessing Core Identity...</p>
    </div>
  );

  if (!user) return (
    <div className="p-8 text-center flex flex-col items-center gap-4">
      <AlertCircle className="h-12 w-12 text-error" />
      <p className="text-gray-600 font-bold">Unauthorized System Access.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-xl border border-border">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-500/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-40 w-40 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-2xl ring-1 ring-border group-hover:ring-red-500/30 transition-all duration-500">
                {(previewUrl || user.profilePhoto) ? (
                  <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-50">
                    <Shield className="h-20 w-20 text-gray-200" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-red-600 border-4 border-white shadow-lg flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h2 className="text-4xl font-black tracking-tighter text-gray-900">{user.name}</h2>
                <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600">
                  System Administrator
                </span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-gray-500 font-bold text-sm tracking-tight">
                <Mail className="h-4 w-4 text-red-500" /> {user.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access level</p>
                   <p className="text-sm font-bold text-gray-800">Superuser / Foundation</p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active since</p>
                   <p className="text-sm font-black text-gray-800">{new Date(user.createdAt || "").toLocaleDateString("en-GB", { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsEditing(true)}
            variant="primary" 
            size="xl" 
            className="bg-gray-900 text-white hover:bg-black rounded-2xl px-10 shadow-lg group translate-y-[-10px]"
          >
            <Edit3 className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
            Control Hub
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── SYSTEM TELEMETRY ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-8">
        <div className="lg:col-span-1" />
        </div>

        {/* ── ADMINISTRATIVE BIO ─────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-2xl bg-white p-10 border border-border shadow-sm min-h-[400px]">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-gray-900/5 flex items-center justify-center text-gray-900">
                   <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-gray-900">Administrative Mandate</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="p-8 rounded-[2rem] bg-surface-soft/40 border border-border/40 relative">
                    <div className="absolute top-4 left-4 h-8 w-8 text-red-500 opacity-10">
                       <Shield className="h-full w-full" />
                    </div>
                    <p className="text-gray-600 font-medium leading-relaxed italic">
                       {user.bio || "No mandate specified. Manage the Mozhi Aruvi ecosystem with precision and dedication."}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Location Origin</p>
                        <p className="text-lg font-bold text-gray-800">{user.country || "Global Headquarters"}</p>
                    </div>
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Internal Contact</p>
                        <p className="text-lg font-bold text-gray-800">{user.phoneNumber || "Encrypted"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-between p-8 border-b border-border bg-surface-soft/30">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-black/20">
                       <Shield className="h-6 w-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">System Configuration</h3>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Update administrative identity</p>
                    </div>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="p-3 rounded-2xl hover:bg-error/10 text-gray-400 hover:text-error transition-all">
                    <X className="h-6 w-6" />
                 </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                 <div className="flex flex-col items-center gap-6 mb-4">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                       <div className="h-32 w-32 rounded-[2rem] overflow-hidden bg-slate-100 border-2 border-dashed border-red-500/20 group-hover:border-red-500 transition-all">
                          {(previewUrl || user.profilePhoto) ? (
                            <img src={previewUrl || user.profilePhoto || ""} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-red-500/30">
                               <Camera className="h-8 w-8" />
                            </div>
                          )}
                       </div>
                       <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-[2rem]">
                          <Camera className="h-6 w-6 text-white" />
                       </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Admin Name</label>
                       <input name="name" value={formData.name} onChange={handleChange} required className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-gray-800 focus:bg-white focus:border-red-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Contact Number</label>
                       <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-gray-800 focus:bg-white focus:border-red-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Headquarters</label>
                       <input name="country" value={formData.country} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-gray-800 focus:bg-white focus:border-red-500 transition-all outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Age</label>
                          <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-gray-800 focus:bg-white focus:border-red-500 transition-all outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-gray-800 focus:bg-white focus:border-red-500 transition-all outline-none">
                             <option value="">Select</option>
                             <option value="male">Male</option>
                             <option value="female">Female</option>
                             <option value="other">Other</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Administrative Bio</label>
                    <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full rounded-3xl bg-surface-soft border border-border p-6 text-sm font-medium text-gray-700 focus:bg-white focus:border-red-500 transition-all outline-none resize-none" />
                 </div>

                 <div className="flex items-center gap-4 pt-4">
                    <Button type="submit" isLoading={loading} variant="primary" size="xl" className="flex-1 bg-gray-900 text-white rounded-2xl shadow-xl shadow-black/20">
                       Save Protocols
                    </Button>
                    <button type="button" onClick={() => setIsEditing(false)} className="px-10 h-[60px] rounded-2xl bg-gray-100 text-gray-500 font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all">
                       Abort
                    </button>
                 </div>
              </form>
           </div>
        </div>
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
