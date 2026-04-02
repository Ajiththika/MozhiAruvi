"use client";

import React, { useState } from "react";
import { Mail, AlertCircle, CheckCircle, Edit3, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import ProfileEditModal from "@/components/features/profile/ProfileEditModal";

export default function AdminProfile() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-primary/70 font-bold uppercase tracking-widest text-[10px]">Accessing Core Identity...</p>
    </div>
  );

  if (!user) return (
    <div className="p-8 text-center flex flex-col items-center gap-4">
      <AlertCircle className="h-12 w-12 text-error" />
      <p className="text-slate-600 font-bold">Unauthorized System Access.</p>
    </div>
  );

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
    setMessage({ type: "success", text: "Administrative profile refined." });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── TOP HEADER SECTION ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-10 shadow-xl border border-border">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-500/5 blur-3xl -mr-32 -mt-32" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="h-40 w-40 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-2xl ring-1 ring-border group-hover:ring-red-500/30 transition-all duration-500">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-50">
                    <Shield className="h-20 w-20 text-slate-200" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-red-600 border-4 border-white shadow-lg flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
            </div>

            <div className="text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <h2 className="text-4xl font-black tracking-tighter text-primary">{user.name}</h2>
                <span className="px-4 py-1.5 rounded-full bg-red-50 border border-red-100 text-[10px] font-black uppercase tracking-widest text-red-600">
                  System Administrator
                </span>
              </div>
              <p className="flex items-center justify-center md:justify-start gap-2 text-primary/70 font-bold text-sm tracking-tight">
                <Mail className="h-4 w-4 text-red-500" /> {user.email}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div>
                   <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Access level</p>
                   <p className="text-sm font-bold text-slate-800">Superuser / Foundation</p>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div>
                   <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Active since</p>
                   <p className="text-sm font-black text-slate-800">{new Date(user.createdAt || "").toLocaleDateString("en-GB", { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsEditing(true)}
            variant="primary" 
            size="xl" 
            className="bg-slate-900 text-white hover:bg-black rounded-2xl px-10 shadow-lg group translate-y-[-10px]"
          >
            <Edit3 className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" />
            Control Hub
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          {/* System info can go here if needed */}
        </div>
        <div className="lg:col-span-2 space-y-8">
           <div className="rounded-2xl bg-white p-10 border border-border shadow-sm min-h-[400px]">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-slate-900/5 flex items-center justify-center text-primary">
                   <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-primary">Administrative Mandate</h3>
              </div>
              
              <div className="space-y-8">
                 <div className="p-8 rounded-[2rem] bg-surface-soft/40 border border-border/40 relative">
                    <div className="absolute top-4 left-4 h-8 w-8 text-red-500 opacity-10">
                       <Shield className="h-full w-full" />
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed italic">
                       {user.bio || "No mandate specified. Manage the MozhiAruvi ecosystem with precision and dedication."}
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-2">Location Origin</p>
                        <p className="text-lg font-bold text-slate-800">{user.country || "Global Headquarters"}</p>
                    </div>
                    <div className="p-6 rounded-3xl border border-border/60 bg-white">
                        <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-2">Internal Contact</p>
                        <p className="text-lg font-bold text-slate-800">{user.phoneNumber || "Encrypted"}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {isEditing && (
        <ProfileEditModal 
          user={user} 
          setUser={handleUpdateUser} 
          onClose={() => setIsEditing(false)} 
          role="admin" 
        />
      )}

      {message.text && (
        <div className={`fixed bottom-10 right-10 p-6 rounded-[2rem] flex items-center gap-4 shadow-2xl animate-in slide-in-from-right duration-500 z-[110] ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-error text-white'}`}>
           {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
           <p className="font-black uppercase text-[10px] tracking-widest">{message.text}</p>
        </div>
      )}
    </div>
  );
}
