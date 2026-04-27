"use client";

import React, { useState } from "react";
import { Star, X, Check, Award, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorRatingModalProps {
  tutorName: string;
  tutorImage?: string;
  onClose: () => void;
  onSubmit: (data: { rating: number; tags: string[]; review: string }) => void;
}

const FEEDBACK_TAGS = [
  "Clear explanation",
  "Friendly & Patient",
  "Good communication",
  "Engaging session",
  "Helpful materials",
  "Needs improvement",
];

export function TutorRatingModal({ tutorName, tutorImage, onClose, onSubmit }: TutorRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onSubmit({ rating, tags: selectedTags, review });
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-12 text-center flex flex-col items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-100">
              <Check className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Thank you!</h3>
              <p className="text-slate-500 font-medium">Your feedback helps {tutorName} improve and assists other students.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="relative p-8 pb-6 border-b border-slate-100 bg-slate-50/50 text-center flex flex-col items-center">
              <button
                onClick={onClose}
                className="absolute right-6 top-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="h-20 w-20 rounded-full bg-indigo-50 border-4 border-white shadow-md mb-4 overflow-hidden flex items-center justify-center">
                {tutorImage ? (
                  <img src={tutorImage} alt={tutorName} className="h-full w-full object-cover" />
                ) : (
                  <Award className="h-8 w-8 text-indigo-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-slate-800">Rate your class with</h2>
              <h3 className="text-2xl font-black text-primary mt-1">{tutorName}</h3>
            </div>

            <div className="p-8 space-y-8">
              {/* Star Rating */}
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">How was the session?</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={cn(
                          "h-10 w-10 transition-colors duration-200",
                          (hoveredRating || rating) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-100 text-slate-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tags */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest text-center">What stood out?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {FEEDBACK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                          isSelected
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Review */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-widest text-sm">
                  <MessageSquare className="h-4 w-4" />
                  <p>Write a review <span className="text-slate-400 font-medium normal-case">(Optional)</span></p>
                </div>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder={`Tell us what you liked about ${tutorName}'s class...`}
                  className="w-full h-28 resize-none rounded-2xl border border-slate-200 p-4 text-slate-700 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-sm font-medium"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-white transition-all",
                  rating === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20",
                  isSubmitting && "opacity-80 pointer-events-none"
                )}
              >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
