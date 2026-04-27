"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { UserCircle, Mail, MapPin, Phone, AlertCircle, CheckCircle, Edit3, Zap, Award, Banknote, Briefcase, GraduationCap, Clock, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Button from "@/components/ui/Button";
import ProfileEditModal from "@/components/features/profile/ProfileEditModal";

export default function TutorProfileSettings() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-primary/70 font-bold uppercase tracking-widest text-[10px]">Accessing Mentor Profile...</p>
    </div>
  );

  if (!user) return (
     <div className="p-8 text-center flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-error" />
        <p className="text-slate-600 font-bold">Authentication mismatch.</p>
        <button onClick={() => window.location.href = "/auth/signin"} className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest">Login Hub</button>
     </div>
  );

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    setMessage({ type: "success", text: "Profile refined successfully!" });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-xl border border-border shadow-soft/20">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-secondary/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-40 w-40 rounded-3xl overflow-hidden bg-surface-soft border-4 border-white shadow-2xl ring-1 ring-border group-hover:ring-secondary/30 transition-all duration-500">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
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
                <h2 className="text-4xl font-black tracking-tighter text-primary">{user.name}</h2>
                <span className="px-4 py-1.5 rounded-full bg-secondary/5 border border-secondary/10 text-[10px] font-black uppercase tracking-widest text-secondary">
                  Verified Language Mentor
                </span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-primary/70 font-bold text-sm tracking-tight">
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
                       user.isTutorAvailable ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-primary/70 border-slate-200"
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
            size="md" 
            className="rounded-xl px-6 shadow-lg shadow-secondary/20 group"
          >
            <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
            Edit
          </Button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── TEACHING STATS ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-8">
           <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 h-32 w-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-8">Professional Metrics</h4>
              
              <div className="space-y-6">
                 <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                       <Zap className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">1:1 Session ($)</p>
                       <p className="text-2xl font-black">$5</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                       <Layers className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">8-Class Bundle ($)</p>
                       <p className="text-2xl font-black">$36</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-5 p-5 rounded-3xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                       <Banknote className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Earnings</p>
                       <p className="text-2xl font-black">${user.credits || 0}</p>
                    </div>
                 </div>

                <div className="pt-4 space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                      <p>Trust Level</p>
                      <p className="text-secondary-light">Verified</p>
                   </div>
                   <div className="flex items-center gap-1.5">
                      {[1,2,3,4,5].map(i => <Award key={i} className="h-5 w-5 text-amber-400 fill-current" />)}
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
                 <h3 className="text-2xl font-black tracking-tight text-primary">Academic & Teaching Bio</h3>
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
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Country</p>
                        <p className="text-xs font-black text-slate-800 truncate">{user.country || "Earth"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Age</p>
                        <p className="text-xs font-black text-slate-800">{user.age || "N/A"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-xs font-black text-slate-800 capitalize">{user.gender || "Any"}</p>
                    </div>
                    <div className="p-4 rounded-3xl border border-border/60 bg-white text-center">
                        <p className="text-[8px] font-black text-primary/60 uppercase tracking-widest mb-1">Joined</p>
                        <p className="text-xs font-black text-slate-800">{new Date(user.createdAt || "").toLocaleDateString("en-GB", { month: 'short', year: 'numeric' })}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* ── EDIT PROFILE MODAL ────────────────────────────────────────────────── */}
      {isEditing && (
        <ProfileEditModal 
          user={user} 
          setUser={handleUpdateUser} 
          onClose={() => setIsEditing(false)} 
          role="teacher" 
        />
      )}

      {message.text && (
        <div className={`fixed bottom-10 right-10 p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl animate-in slide-in-from-right duration-500 z-[110] ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-error text-white'}`}>
           {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
           <p className="font-black uppercase text-[10px] tracking-widest text-white">{message.text}</p>
        </div>
      )}
    </div>
  );
}
