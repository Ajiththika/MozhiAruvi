"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Camera, Edit3, Trash2, Shield, Briefcase, UserCircle } from "lucide-react";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import { ImageAdjuster } from "@/components/ui/ImageAdjuster";
import { cn } from "@/lib/utils";
import { SafeUser } from "@/services/authService";

interface ProfileFormData {
  name: string;
  phoneNumber: string;
  country: string;
  age: string;
  gender: string;
  bio: string;
  specialization: string;
  experience: string;
  oneClassFee: string;
  eightClassFee: string;
  weeklySchedule: string;
}

interface ProfileEditModalProps {
  user: SafeUser;
  setUser: (user: SafeUser) => void;
  onClose: () => void;
  role: "admin" | "student" | "teacher";
}

export default function ProfileEditModal({ user, setUser, onClose, role }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    phoneNumber: "",
    country: "",
    age: "",
    gender: "",
    bio: "",
    specialization: "",
    experience: "",
    oneClassFee: "",
    eightClassFee: "",
    weeklySchedule: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        specialization: user.specialization || "",
        experience: user.experience || "",
        oneClassFee: user.oneClassFee ? String(user.oneClassFee) : "",
        eightClassFee: user.eightClassFee ? String(user.eightClassFee) : "",
        weeklySchedule: user.weeklySchedule || "",
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
    setError("");

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value as string);
        }
      });
      
      if (selectedFile) {
        fd.append("profilePhoto", selectedFile);
      }

      const isMentor = role === 'teacher' || (user as any).role === 'tutor' || (user as any).role === 'teacher';
      const endpoint = isMentor ? "/tutors/me" : "/users/me";
      const res = await api.patch(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const updatedUser = isMentor ? res.data.tutor : res.data.user;
      setUser(updatedUser);
      onClose();
    } catch (err: unknown) {
      const errorMsg = (err as any).response?.data?.error?.message || (err as any).response?.data?.message || "Failed to update profile.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const accentColor = role === 'admin' ? 'red' : (role === 'teacher' ? 'secondary' : 'primary');
  const Icon = role === 'admin' ? Shield : (role === 'teacher' ? Briefcase : UserCircle);

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between p-8 border-b border-border bg-surface-soft/30">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg",
                role === 'admin' ? 'bg-slate-900 shadow-black/20' : (role === 'teacher' ? 'bg-secondary shadow-secondary/20' : 'bg-primary shadow-primary/20')
              )}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-primary tracking-tight">Profile Transformation</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">Configure your professional identity</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 rounded-2xl hover:bg-error/10 text-primary/60 hover:text-error transition-all">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto scrollbar-hide">
             {error && (
               <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
                 <X className="h-4 w-4" /> {error}
               </div>
             )}

             <div className="flex flex-col items-center gap-6 mb-4">
                <div className="relative group">
                   <div className={cn(
                     "h-32 w-32 rounded-[2rem] overflow-hidden bg-surface-soft border-2 border-dashed transition-all",
                     role === 'admin' ? 'group-hover:border-red-500 border-red-500/20' : (role === 'teacher' ? 'group-hover:border-secondary border-secondary/20' : 'group-hover:border-primary border-primary/20')
                   )}>
                      {(previewUrl || (user && user.profilePhoto)) ? (
                        <img src={previewUrl || user.profilePhoto || ""} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-30">
                           <Camera className="h-8 w-8" />
                        </div>
                      )}
                   </div>
                   
                   <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all rounded-[2rem] flex items-center justify-center gap-3">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()} 
                        title="Upload New"
                        className="p-3 bg-white rounded-xl text-primary hover:scale-110 transition-transform shadow-xl"
                      >
                         <Camera size={18} />
                      </button>
                      {(previewUrl || user.profilePhoto) && (
                        <>
                          <button 
                            type="button"
                            onClick={() => setAdjustImage(previewUrl || user.profilePhoto || "")} 
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
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Display Name</label>
                   <input name="name" value={formData.name} onChange={handleChange} required className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none" />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Contact Phone</label>
                   <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none" />
                </div>
                
                {role === 'teacher' && (
                  <>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Subject Specialization</label>
                       <input name="specialization" value={formData.specialization} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Daily Availability Hours</label>
                       <input name="weeklySchedule" value={formData.weeklySchedule} onChange={handleChange} placeholder="e.g., Mon-Fri 9AM - 5PM IST" className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-secondary transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Single Session Fee ($ USD)</label>
                       <input type="number" name="oneClassFee" value={formData.oneClassFee} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-emerald-500 transition-all outline-none" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">8-Class Intensive Fee ($ USD)</label>
                       <input type="number" name="eightClassFee" value={formData.eightClassFee} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 transition-all outline-none" />
                    </div>
                  </>
                )}

                <div className="space-y-1">
                   <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Operation Origin (Country)</label>
                   <input name="country" value={formData.country} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Chronology (Age)</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full h-14 rounded-2xl bg-surface-soft border border-border px-6 text-sm font-bold text-slate-800 focus:bg-white focus:border-primary transition-all outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Gender Class</label>
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
                <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Mandate / Biography</label>
                <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full rounded-3xl bg-surface-soft border border-border p-6 text-sm font-medium text-slate-700 focus:bg-white focus:border-primary transition-all outline-none resize-none" />
             </div>

             <div className="flex items-center gap-4 pt-4">
                <Button type="submit" isLoading={loading} variant={role === 'admin' ? 'primary' : (role === 'teacher' ? 'secondary' : 'primary')} size="xl" className={cn(
                  "flex-1 rounded-2xl shadow-xl",
                  role === 'admin' ? 'bg-slate-900 border-none shadow-black/20' : (role === 'teacher' ? 'shadow-secondary/20' : 'shadow-primary/20')
                )}>
                   Save Transformations
                </Button>
                <button type="button" onClick={onClose} className="px-10 h-[60px] rounded-2xl bg-slate-100 text-primary/70 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">
                   Abort
                </button>
             </div>
          </form>
        </div>
      </div>

      {adjustImage && (
        <ImageAdjuster 
          image={adjustImage} 
          aspect={1} 
          onConfirm={handleAdjustConfirm} 
          onCancel={() => setAdjustImage(null)} 
        />
      )}
    </>
  );
}
