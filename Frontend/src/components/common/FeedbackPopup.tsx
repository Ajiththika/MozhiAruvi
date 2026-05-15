"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, X, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function FeedbackPopup() {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Manual trigger function attached to window for maximum reliability
    // We set this even for admins so the Footer button still works if clicked manually
    (window as any).openFeedback = () => {
      setSubmitted(false);
      setRating(0);
      setComment("");
      setShow(true);
    };

    // 1. Never show AUTOMATICALLY to admins
    if (user?.role === "admin") {
      return () => {
        delete (window as any).openFeedback;
      };
    }

    const hasSubmitted = localStorage.getItem("mozhi_feedback_submitted");
    if (hasSubmitted) {
      return () => {
        delete (window as any).openFeedback;
      };
    }

    // 2. Check if dismissed recently (within 56 hours)
    const dismissedAt = localStorage.getItem("mozhi_feedback_dismissed_at");
    const FIFTY_SIX_HOURS = 56 * 60 * 60 * 1000;
    
    if (dismissedAt) {
      const timeSinceDismissal = Date.now() - parseInt(dismissedAt);
      if (timeSinceDismissal < FIFTY_SIX_HOURS) {
        return () => {
          delete (window as any).openFeedback;
        };
      }
    }

    // 3. Wait for 7 minutes (420,000 ms)
    const timer = setTimeout(() => {
      setShow(true);
    }, 420000);

    return () => {
      if (timer) clearTimeout(timer);
      delete (window as any).openFeedback;
    };
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // API call to save feedback
      await api.post("/feedback", {
        rating,
        comment,
        userEmail: user?.email || "anonymous@mozhiaruvi.com",
        userId: user?._id
      });

      // Permanently mark as submitted
      localStorage.setItem("mozhi_feedback_submitted", "true");
      // Clear dismissal time if they finally submitted
      localStorage.removeItem("mozhi_feedback_dismissed_at");
      window.dispatchEvent(new Event("mozhi_feedback_submitted"));
      
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }

    // Auto-close after success
    if (!error) setTimeout(() => setShow(false), 2500);
  };

  const closePopup = () => {
    setShow(false);
    
    // If they haven't submitted, mark as dismissed at this time
    const hasSubmitted = localStorage.getItem("mozhi_feedback_submitted");
    if (!hasSubmitted) {
      localStorage.setItem("mozhi_feedback_dismissed_at", Date.now().toString());
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500" 
        onClick={closePopup}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-[480px] bg-white rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-slate-100 p-8 sm:p-10 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />
        
        <button 
          onClick={closePopup}
          className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="relative space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary shadow-xl shadow-primary/5 mb-2">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">How's your experience?</h3>
                <p className="text-xs font-black text-primary/40 uppercase tracking-[0.3em]">Help us grow MozhiAruvi</p>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-6 py-2">
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-125 focus:outline-none p-1"
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-colors",
                        (hover || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-slate-200"
                      )}
                    />
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-50 px-4 py-2 rounded-full border border-red-100 animate-bounce">
                   {error}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 px-2">Write a short note (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What can we do better?..."
                className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-base font-bold text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-primary/20 focus:ring-[15px] focus:ring-primary/5 transition-all resize-none h-40 leading-relaxed shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 py-6 bg-primary text-white text-[13px] font-black uppercase tracking-[0.25em] rounded-[2rem] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
            <div className="h-24 w-24 rounded-[3rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/10 border border-emerald-100">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Feedback Received!</h3>
            <p className="text-base font-bold text-slate-400 max-w-[280px] leading-relaxed">
              We appreciate your support in making MozhiAruvi better.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <div className={cn("h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin", className)} />
  );
}
