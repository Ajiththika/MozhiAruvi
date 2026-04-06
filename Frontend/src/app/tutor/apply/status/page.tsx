"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Hourglass, CheckCircle2, XCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Button from "@/components/ui/Button";
import { getMe } from "@/services/authService";

export default function StatusPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll for status updates every 10 seconds
  useEffect(() => {
    if (!user || user.tutorStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const updatedUser = await getMe();
        if (updatedUser.tutorStatus === "approved") {
          setUser(updatedUser);
          router.push("/tutor/dashboard");
        } else if (updatedUser.tutorStatus === "rejected") {
          setUser(updatedUser);
        }
      } catch (err: unknown) {
        console.error("Failed to poll status:", err instanceof Error ? err.message : String(err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [user, router, setUser]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updatedUser = await getMe();
      setUser(updatedUser);
      if (updatedUser.tutorStatus === "approved") {
        router.push("/tutor/dashboard");
      }
    } catch (err: unknown) {
      console.error("Manual refresh failed:", err instanceof Error ? err.message : String(err));
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user || user.tutorStatus === "none") {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center opacity-80">
            <Hourglass className="h-16 w-16 text-slate-300 mx-auto mb-6" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">No active application found.</p>
            <Button onClick={() => router.push('/tutor/apply')} className="mt-8 px-8 py-3 rounded-2xl shadow-lg ring-4 ring-primary/10">Submit an Application</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStatus = () => {
    switch (user.tutorStatus) {
      case "pending":
        return (
          <div className="relative group overflow-hidden bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] shadow-2xl p-12 text-center animate-in fade-in zoom-in duration-700">
            {/* Animated Glows */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative flex flex-col items-center">
              <div className="h-32 w-32 bg-indigo-50 rounded-full flex items-center justify-center mb-10 ring-8 ring-white shadow-inner">
                <Hourglass className="h-14 w-14 text-primary animate-pulse" />
              </div>
              
              <h2 className="text-4xl font-black text-indigo-950 tracking-tight leading-none mb-6">
                Awaiting Hub Approval
              </h2>
              <p className="text-indigo-900/60 font-medium max-w-md mx-auto text-lg leading-relaxed mb-10">
                Welcome to the Mozhi Aruvi family! Our team is currently verifying your profile to maintain our platform's academic standards. 
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                <div className="flex items-center gap-3 px-8 py-4 bg-indigo-50/50 backdrop-blur rounded-2xl border border-indigo-100/50 group-hover:scale-105 transition-transform duration-500">
                   <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                   <span className="text-primary font-black uppercase tracking-tighter text-sm">Status: Deep Review</span>
                </div>
                
                <button 
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 text-indigo-500 hover:text-primary font-bold text-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Checking...' : 'Check Now'}
                </button>
              </div>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-100 to-transparent my-10" />

              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="secondary" onClick={() => router.push('/student/dashboard')} className="flex items-center gap-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 px-8 rounded-2xl">
                   <LayoutDashboard className="h-4 w-4" />
                   Return to Student Home
                </Button>
              </div>
            </div>
          </div>
        );
      case "approved":
        return (
          <div className="bg-white/80 backdrop-blur-2xl border border-green-100 rounded-[3rem] shadow-2xl p-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="h-32 w-32 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-white shadow-green-500/5 shadow-xl">
              <CheckCircle2 className="h-14 w-14 text-green-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6 uppercase">You're In!</h2>
            <p className="text-slate-600 font-medium max-w-sm mx-auto text-lg leading-relaxed mb-10">
              Your tutor credentials have been verified. Welcome to the professional community of Mozhi Aruvi.
            </p>
            <Button 
                onClick={() => router.push('/tutor/dashboard')} 
                className="w-full sm:w-auto px-12 py-5 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-lg font-black"
            >
                Launch Tutor Dashboard
            </Button>
          </div>
        );
      case "rejected":
        return (
          <div className="bg-white/80 backdrop-blur-2xl border border-red-100 rounded-[3rem] shadow-2xl p-12 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
            <div className="h-32 w-32 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10 ring-8 ring-white shadow-red-500/5 shadow-xl">
              <XCircle className="h-14 w-14 text-red-600" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-6 uppercase">Application Closed</h2>
            <p className="text-slate-600 font-medium max-w-sm mx-auto text-lg leading-relaxed mb-10">
              Our review team has decided not to move forward with your application at this time. 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => router.push('/tutor/apply')} variant="secondary" className="px-8 py-4 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-bold">Try Re-Applying</Button>
                <Button onClick={() => router.push('/student/dashboard')} variant="secondary" className="px-8 py-4 border-slate-100 text-slate-500 rounded-2xl font-bold">Continue as Student</Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        <div className="w-full max-w-3xl">
          {renderStatus()}
        </div>
      </main>
      <Footer />
    </div>
  );
}
