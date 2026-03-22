"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Mail, Globe, MapPin, Banknote, Phone, Hash, Save, AlertCircle, CheckCircle, Sparkles, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function TutorProfileSettings() {
  const { user, setUser, isLoading: authLoading } = useAuth();
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      
      if (selectedFile) {
        fd.append("profilePhoto", selectedFile);
      }

      const res = await api.patch("/tutors/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.tutor);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm("Are you sure you want to deactivate your profile? This action will log you out.")) {
      try {
        await api.patch("/users/me/deactivate");
        window.location.href = "/";
      } catch (error) {
        alert("Failed to deactivate account.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-slate-500 font-medium font-sans">Fetching your tutor profile details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-slate-600 font-medium">Session expired. Please try signing in again.</p>
        <button 
          onClick={() => window.location.href = "/auth/signin"}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="absolute top-0 right-0 -m-8 h-64 w-64 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -m-8 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="group relative">
               <div 
                 onClick={triggerFileInput}
                 className="flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-slate-100 shadow-inner group-hover:shadow-md transition-all duration-300 relative border-2 border-transparent group-hover:border-primary/20"
               >
                  {(previewUrl || user.profilePhoto) ? (
                    <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-20 w-20 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/*" 
                 className="hidden" 
               />
               <div className="absolute -bottom-2 -right-2 rounded-xl bg-white p-1.5 shadow-lg border border-slate-100 dark:bg-slate-700 dark:border-slate-600">
                  <div className={`h-4 w-4 rounded-full ring-4 ${user.isTutorAvailable ? 'bg-emerald-500 ring-emerald-50' : 'bg-slate-400 ring-slate-100'}`}></div>
               </div>
               {selectedFile && (
                  <button 
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
               )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{user.name}</h2>
              <div className="mt-2 flex flex-wrap justify-center md:justify-start items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                   Tutor Portal
                </span>
                <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Teaching Status</p>
              <button
                type="button"
                onClick={async () => {
                  if (!user) return;
                  try {
                    const updated = await api.patch("/tutors/me/availability", { isTutorAvailable: !user.isTutorAvailable });
                    setUser({ ...user, isTutorAvailable: updated.data.isTutorAvailable });
                  } catch (err) {
                    alert("Failed to update availability");
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  user.isTutorAvailable 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                <div className={`h-2 w-2 rounded-full ${user.isTutorAvailable ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {user.isTutorAvailable ? "Accepting Students" : "Availability Paused"}
              </button>
            </div>
            <button 
              onClick={handleDeactivate}
              className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-2 hover:bg-red-50 rounded-xl transition-all whitespace-nowrap"
            >
              Deactivate
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
          <p className="font-semibold text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
         {/* Main content Area */}
         <div className="lg:col-span-8 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
               <div className="border-b border-slate-100 px-8 py-5 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800 dark:text-white">
                     <UserCircle className="h-5 w-5 text-secondary" /> 
                     Professional Identity
                  </h3>
               </div>
               
               <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Display Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Type</label>
                        <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/30 px-5 py-3.5 text-sm font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-800/50">
                          Verified Tutor
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Professional Bio</label>
                      <textarea 
                        name="bio" 
                        rows={5} 
                        value={formData.bio} 
                        onChange={handleChange} 
                        placeholder="Highlight your teaching experience and passion..."
                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      ></textarea>
                  </div>
               </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
               <div className="border-b border-slate-100 px-8 py-5 dark:border-slate-800">
                  <h3 className="flex items-center gap-2.5 text-lg font-bold text-slate-800 dark:text-white">
                     <Globe className="h-5 w-5 text-emerald-500" /> 
                     Expertise & Rates
                  </h3>
               </div>
               
               <div className="p-8 space-y-6">
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Specialization</label>
                       <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Conversational Tamil" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Years of Experience</label>
                       <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5+ Years" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Hourly Rate (XP)</label>
                       <div className="relative group">
                          <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} placeholder="Optional" className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-5 py-3.5 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
         </div>

         {/* Sidebar Area */}
         <div className="lg:col-span-4 space-y-8">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/50">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Personal Details</h4>
               
               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Age</label>
                     <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Gender</label>
                     <select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Country</label>
                     <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                     </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Contact Number</label>
                     <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary focus:bg-white transition-all dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-slate-800">
               <div className="flex items-center gap-3 mb-8">
                  <div className="rounded-xl bg-white/5 p-2 border border-white/10">
                    <Sparkles className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <h4 className="font-bold">Earning Hub</h4>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Financial summary</p>
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                    <p className="text-2xl font-black">{user.credits || 0} <span className="text-xs text-slate-500 font-bold uppercase ml-1">XP Points</span></p>
                  </div>
               </div>

               <button 
                 type="submit" 
                 disabled={loading} 
                 className="mt-8 w-full flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-900 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
               >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {loading ? "Updating..." : "Save Profile"}
               </button>
            </div>
         </div>
      </form>
    </div>
  );
}