"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Mail, MapPin, Phone, Hash, Save, AlertCircle, CheckCircle, Globe, Sparkles, Camera, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

import Button from "@/components/common/Button";

export default function StudentProfile() {
  const { user, setUser, isLoading: authLoading } = useAuth();
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
      fd.append("name", formData.name);
      fd.append("phoneNumber", formData.phoneNumber);
      fd.append("country", formData.country);
      fd.append("age", formData.age);
      fd.append("gender", formData.gender);
      fd.append("bio", formData.bio);
      
      if (selectedFile) {
        fd.append("profilePhoto", selectedFile);
      }

      const res = await api.patch("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setUser(res.data.user);
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent"></div>
        <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] italic">Fetching Profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-wide py-20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3>Session Unavailable</h3>
        <p className="max-w-md mx-auto">Your session has expired or you are not authorized. Please try signing in again.</p>
        <Button href="/auth/signin" variant="primary">
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container-wide py-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header section with standardized card */}
      <div className="card-premium relative overflow-hidden p-10 md:p-14 border border-white shadow-2xl shadow-slate-200/50">
        <div className="absolute top-0 right-0 -m-12 h-80 w-80 rounded-full bg-primary/5 blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="group relative">
               <div 
                 onClick={triggerFileInput}
                 className="flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-[2.5rem] bg-slate-50 shadow-inner ring-4 ring-white group-hover:shadow-2xl group-hover:scale-105 transition-all duration-700 relative border border-slate-100"
               >
                  {(previewUrl || user.profilePhoto) ? (
                    <img src={previewUrl || user.profilePhoto || ""} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="h-24 w-24 text-slate-200 group-hover:scale-110 transition-transform duration-700" />
                  )}
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </div>
               </div>
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileChange} 
                 accept="image/*" 
                 className="hidden" 
               />
               <div className="absolute -bottom-2 -right-2 rounded-2xl bg-white p-2 shadow-xl border border-slate-100">
                  <div className="h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-emerald-50 animate-pulse"></div>
               </div>
               
               {selectedFile && (
                  <button 
                    type="button"
                    onClick={removeSelectedFile}
                    className="absolute -top-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-xl hover:bg-red-600 transition-all hover:scale-110 active:scale-95 z-20"
                    title="Cancel selection"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
               )}
            </div>
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">{user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <span className="text-[10px] font-extrabold text-primary bg-primary/5 px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/10">
                  Student Member
                </span>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 italic">
                  <Mail className="h-4 w-4 text-primary/40" /> {user.email}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-6">
            <div className="text-center md:text-right space-y-1">
              <label className="text-slate-400">Current Level</label>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{user?.level || 'Beginner'}</p>
            </div>
            <button 
              onClick={handleDeactivate}
              className="text-[10px] font-black text-red-400 hover:text-red-600 px-6 py-2.5 hover:bg-red-50 rounded-full transition-all border border-red-50 uppercase tracking-widest shadow-sm active:scale-95"
            >
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-6 rounded-3xl flex items-center gap-4 animate-in zoom-in-95 duration-500 shadow-sm border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-red-50 text-red-800 border-red-100'}`}>
          <div className={`p-2 rounded-xl scale-110 ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
          <p className="font-bold text-sm tracking-tight">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-12 lg:grid-cols-12 pb-20">
         {/* Main content Area */}
         <div className="lg:col-span-8 space-y-12">
            <div className="card-premium overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20">
               <div className="border-b border-slate-50 px-10 py-6">
                  <h3 className="flex items-center gap-3">
                     <UserCircle className="h-6 w-6 text-primary" /> 
                     Profile Information
                  </h3>
               </div>
               
               <div className="p-10 space-y-10">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                     <div className="space-y-3">
                        <label>Full name</label>
                        <input 
                          type="text" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange} 
                          required 
                          placeholder="Your display name"
                        />
                     </div>
                     <div className="space-y-3">
                        <label>Account created</label>
                        <div className="w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-4 text-sm font-bold text-slate-400 italic">
                          {user?.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Date unavailable'}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                      <label>Bio / About you</label>
                      <textarea 
                        name="bio" 
                        rows={5} 
                        value={formData.bio} 
                        onChange={handleChange} 
                        placeholder="Tell the community about your learning journey..."
                      ></textarea>
                  </div>
               </div>
            </div>

            <div className="card-premium overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/20">
               <div className="border-b border-slate-50 px-10 py-6">
                  <h3 className="flex items-center gap-3">
                     <MapPin className="h-6 w-6 text-primary" /> 
                     Contact & Location
                  </h3>
               </div>
               
               <div className="p-10 space-y-10">
                 <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-3">
                       <label>Phone number</label>
                       <div className="relative group/field">
                          <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within/field:text-primary transition-colors" />
                          <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+1 (555) 000-0000" className="pl-14" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label>Country</label>
                       <div className="relative group/field">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within/field:text-primary transition-colors" />
                          <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="e.g. Canada" className="pl-14" />
                       </div>
                    </div>
                 </div>
               </div>
            </div>
         </div>

         {/* Sidebar Area */}
         <div className="lg:col-span-4 space-y-12">
            <div className="card-premium p-10 border border-slate-100 shadow-xl shadow-slate-200/20">
               <label className="text-slate-400 mb-8 block">Personal Details</label>
               
               <div className="space-y-8">
                  <div className="space-y-3">
                     <label>Age</label>
                     <div className="relative group/field">
                        <Hash className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <input type="number" name="age" min="5" max="120" value={formData.age} onChange={handleChange} className="pl-14 font-bold" />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label>Gender</label>
                     <select name="gender" value={formData.gender} onChange={handleChange} className="font-bold">
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="card-premium bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 border-none relative overflow-hidden group">
               <div className="absolute top-0 right-0 -m-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/40 transition-colors duration-1000"></div>
               
               <div className="relative flex items-center gap-4 mb-10">
                  <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500">
                     <Sparkles className="h-6 w-6 text-primary shadow-[0_0_12px_rgba(42,87,148,0.8)]" />
                  </div>
                  <div>
                    <h4 className="text-white">Student Stats</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Performance Summary</p>
                  </div>
               </div>
               
               <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/5 space-y-1">
                    <label className="text-white/40 mb-0">XP Points</label>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{user?.xp || 0}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm border border-white/5 space-y-1">
                    <label className="text-white/40 mb-0">Credits</label>
                    <p className="text-4xl font-black italic tracking-tighter text-white">{user?.credits || 0}</p>
                  </div>
               </div>

               <Button 
                 type="submit" 
                 disabled={loading} 
                 variant="primary"
                 size="xl"
                 className="mt-12 w-full shadow-2xl shadow-primary/40"
               >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  {loading ? "Saving Changes..." : "Save My Profile"}
               </Button>
            </div>
         </div>
      </form>
    </div>
  );
}

