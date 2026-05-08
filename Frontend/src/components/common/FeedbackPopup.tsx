"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, X, CheckCircle2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackPopup() {
  const [show, setShow] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Check if user has already submitted feedback
    const hasSubmitted = localStorage.getItem("mozhi_feedback_submitted");
    
    // Manual trigger listener
    const handleManualOpen = () => {
      setSubmitted(false);
      setRating(0);
      setComment("");
      setShow(true);
    };

    window.addEventListener("OPEN_FEEDBACK_MODAL", handleManualOpen);

    if (hasSubmitted) return;

    // 2. Wait for 2 minutes (120,000 ms)
    const timer = setTimeout(() => {
      setShow(true);
    }, 120000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("OPEN_FEEDBACK_MODAL", handleManualOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating first.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call
    console.log("Feedback Submitted:", { rating, comment });
    
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Save to localStorage so it doesn't show again
    localStorage.setItem("mozhi_feedback_submitted", "true");
    
    setSubmitted(true);
    setLoading(false);

    // Hide after 3 seconds of success
    setTimeout(() => {
      setShow(false);
    }, 3000);
  };

  const closePopup = () => {
    setShow(false);
    // Also mark as "seen" even if closed without submit, 
    // or you could choose to show it again next time.
    // Here we mark it so it doesn't annoy the user.
    localStorage.setItem("mozhi_feedback_submitted", "true");
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] w-[calc(100vw-3rem)] sm:w-[400px] animate-in slide-in-from-bottom-10 duration-700">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-primary/20 border border-primary/5 p-8 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        
        <button 
          onClick={closePopup}
          className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-500 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 tracking-tight leading-none mb-1">Your Feedback</h3>
                <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest">Help us improve your experience</p>
              </div>
            </div>

            <div className="py-2">
              <p className="text-sm font-bold text-slate-600 mb-4">How was your time on MozhiAruvi?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "w-9 h-9 transition-colors",
                        (hover || rating) >= star
                          ? "fill-primary text-primary"
                          : "text-slate-200"
                      )}
                    />
                  </button>
                ))}
              </div>
              {error && <p className="text-xs font-bold text-red-500 mt-3 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 rotate-180" /> {error}
              </p>}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-1">Any specific comments?</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you loved or what we can improve..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-3xl text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all resize-none h-32 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-primary text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-500">
            <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Thank You!</h3>
            <p className="text-sm font-bold text-slate-400 max-w-[240px]">
              We really appreciate you taking the time to help us grow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
