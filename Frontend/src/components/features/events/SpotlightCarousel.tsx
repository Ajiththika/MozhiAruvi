"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { MozhiEvent } from "@/services/eventService";
import { cn } from "@/lib/utils";

interface SpotlightCarouselProps {
  events: MozhiEvent[];
  loading: boolean;
  onRsvp: (event: MozhiEvent) => void;
}

export function SpotlightCarousel({ events, loading, onRsvp }: SpotlightCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const spotlightEvents = events.slice(0, 5);

  useEffect(() => {
    if (spotlightEvents.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % spotlightEvents.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [spotlightEvents.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
      </div>
    );
  }

  if (spotlightEvents.length === 0) {
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] bg-gray-50 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <Calendar size={48} className="text-gray-200" />
        <p className="text-sm font-black text-gray-300 uppercase tracking-widest leading-loose">
          No community spotlights <br /> currently scheduled
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] group border border-gray-100/30">
      <div 
        className="absolute inset-0 w-full h-full flex transition-transform duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {spotlightEvents.map((event, idx) => (
          <div key={event._id} className="min-w-full h-full relative shrink-0">
            {/* Background Media */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[15000ms] ease-linear group-hover:scale-110"
              style={{
                backgroundImage: event.image
                  ? `url(${event.image})`
                  : `linear-gradient(to bottom right, #00C9FF, #92FE9D)`
              }}
            />
            {/* Optimized High-Contrast Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            
            {/* Visual Decorative Layer */}
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-black text-[30rem] text-white leading-none select-none pointer-events-none rotate-12">
               க
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
              <div className="max-w-4xl space-y-6">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Spotlight Experience
                </div>

                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.05] drop-shadow-2xl">
                  {event.title}
                </h2>

                <div className="flex flex-wrap items-center gap-8 text-white/80 font-bold text-xs md:text-sm pt-2">
                  <span className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {event.location}
                  </span>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => onRsvp(event)}
                    className="inline-flex items-center gap-6 bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-emerald-400 hover:text-white transition-all shadow-2xl active:scale-95 group/btn"
                  >
                    Reserve Your Spot
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Minimal Indicator Dots */}
      {spotlightEvents.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
          {spotlightEvents.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                activeSlide === i ? "bg-white w-10" : "bg-white/30 w-2 hover:bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
