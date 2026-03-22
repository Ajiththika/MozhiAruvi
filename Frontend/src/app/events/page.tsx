"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import { getEvents, MozhiEvent } from "@/services/eventService";
import { Pagination } from "@/components/Pagination";
import { Loader2, Calendar, Clock, MapPin, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const featuredEvent = {
  title: "Tamil Poetry Night",
  emoji: "📜",
  description:
    "Join our global community for an evening celebrating classical and modern Tamil poetry. Listen to live readings, discuss meanings, explore Sangam literature, and experience the breathtaking beauty of Tamil literary tradition.",
  date: "March 22, 2026",
  time: "7:00 PM – 9:00 PM IST",
  location: "Online — Zoom Webinar",
  host: "Meena Priya, Head of Curriculum",
  type: "Online",
  spots: "120 spots remaining",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: string | boolean }) {
  const isOnline = type === "Online" || type === true;
  return (
    <span
      className={cn(
        "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border shadow-sm",
        isOnline
          ? "bg-mozhi-light/20 text-mozhi-primary border-mozhi-primary/20"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      )}
    >
      {isOnline ? "Online" : "In-Person"}
    </span>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
      {tag}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [events, setEvents] = useState<MozhiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    setLoading(true);
    getEvents(currentPage)
      .then(res => {
        setEvents(res.events);
        setTotalPages(res.totalPages);
        setTotalEvents(res.totalEvents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentPage]);
  return (
    <div className="min-h-screen flex flex-col bg-soft-bg font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── 1. Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-light-blue/40 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.025] font-black text-[18rem] text-primary select-none leading-none pointer-events-none">
              க
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-light-blue border border-primary/20 text-primary text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Community Events
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-accent-text tracking-tight mb-6">
              Tamil{" "}
              <span className="text-primary">Cultural Events</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4 font-medium">
              Connect, learn, and celebrate Tamil culture with our global community.
            </p>
            <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
              Mozhi Aruvi hosts cultural events, language workshops, poetry nights, and community discussions to help learners experience Tamil beyond the classroom.
            </p>

            <div className="inline-block px-6 py-4 rounded-2xl bg-light-blue/50 border border-primary/20 mb-10">
              <p className="text-2xl md:text-3xl font-bold text-primary">தமிழ் கலாச்சாரம் வாழ்க</p>
              <p className="text-sm text-muted mt-1 italic">Long live Tamil culture</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton href="#upcoming">Browse Upcoming Events</PrimaryButton>
              <SecondaryButton href="/auth/signup">Join Community</SecondaryButton>
            </div>
          </div>
        </section>

        {/* ── 2. Featured Event ───────────────────────────────────── */}
        <section className="py-24 bg-soft-bg px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-sm font-bold text-amber-700">
                ⭐ FEATURED EVENT
              </div>
            </div>

            <div className="bg-mozhi-light/20 backdrop-blur border border-mozhi-soft/20 rounded-3xl overflow-hidden shadow-lg shadow-mozhi-dark/5">
              <div className="flex flex-col lg:flex-row">

                {/* Left — Image placeholder */}
                <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-[480px] bg-gradient-to-br from-primary/10 via-light-blue to-secondary/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.06] font-black text-[20rem] text-primary select-none flex items-center justify-center leading-none">
                    📜
                  </div>
                  <div className="relative z-10 text-center p-12">
                    <div className="text-8xl mb-6">{featuredEvent.emoji}</div>
                    <div className="text-5xl font-black text-primary mb-2">கவிதை</div>
                    <div className="text-muted font-medium text-lg">Tamil Poetry</div>
                  </div>
                  {/* Top badge */}
                  <div className="absolute top-6 left-6">
                    <EventTypeBadge type={featuredEvent.type} />
                  </div>
                </div>

                {/* Right — Details */}
                <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary bg-light-blue px-3 py-1 rounded-full">
                      Featured
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      🔥 {featuredEvent.spots}
                    </span>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold text-accent-text mb-5 leading-tight">
                    {featuredEvent.title}
                  </h2>

                  <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                    {featuredEvent.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                      { icon: "📅", label: "Date", value: featuredEvent.date },
                      { icon: "⏰", label: "Time", value: featuredEvent.time },
                      { icon: "📍", label: "Location", value: featuredEvent.location },
                      { icon: "🎤", label: "Host", value: featuredEvent.host },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4 p-4 bg-soft-bg rounded-xl border border-slate-100">
                        <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                          <p className="text-sm font-black text-slate-800 tracking-tight">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <PrimaryButton href="/auth/signup" className="flex-1 justify-center">
                      Register Now
                    </PrimaryButton>
                    <SecondaryButton 
                      disabled 
                      className="flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Event detail pages coming soon"
                    >
                      View Details (Soon)
                    </SecondaryButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Upcoming Events ──────────────────────────────────── */}
        <section id="upcoming" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-blue text-sm font-semibold text-primary mb-4">
                  UPCOMING
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-accent-text">
                  Upcoming Events
                </h2>
              </div>
              <SecondaryButton href="/auth/signup">View All Events</SecondaryButton>
            </div>

            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-mozhi-primary" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opening the scrolls...</p>
               </div>
            ) : events.length === 0 ? (
               <div className="text-center py-20">
                  <p className="text-lg font-black text-slate-900 uppercase">No upcoming events found</p>
                  <p className="text-slate-500 mt-2">Check back later for new workshops and meetups.</p>
               </div>
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="bg-soft-bg rounded-2xl border border-border-color p-7 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="text-4xl group-hover:scale-110 transition-transform">📅</div>
                        <div className="flex items-center gap-2">
                          <TagBadge tag="Community" />
                          <EventTypeBadge type={true} />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-accent-text mb-3 leading-snug">
                        {event.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-5 flex-1 font-medium">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between pt-5 border-t border-border-color">
                        <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                          <Calendar className="w-4 h-4 shrink-0 text-mozhi-secondary" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <button className="text-sm font-black uppercase tracking-widest text-mozhi-primary hover:text-mozhi-secondary transition-colors">
                          Join →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16">
                    <Pagination 
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
                </>
            )}
          </div>
        </section>

        {/* ── 4. Past Events ──────────────────────────────────────── */}
        <section className="py-24 bg-soft-bg px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm font-semibold text-muted mb-4">
                PAST EVENTS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-accent-text">
                Past Events
              </h2>
              <p className="text-muted mt-3 text-lg max-w-xl">
                Missed an event? Browse highlights from our previous gatherings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="col-span-full py-12 text-center bg-white/50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">The archives are currently being digitized</p>
               </div>
            </div>
          </div>
        </section>

        {/* ── 5. Community CTA ────────────────────────────────────── */}
        <section className="py-28 bg-primary px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] font-black text-[18rem] text-white select-none pointer-events-none">
              க
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Be Part of Something Bigger
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Join Our Tamil Community Events
            </h2>
            <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-5 leading-relaxed">
              Mozhi Aruvi events bring together learners, teachers, and Tamil culture enthusiasts from around the world.
            </p>
            <p className="text-base text-blue-200 max-w-xl mx-auto mb-12 leading-relaxed">
              Participate in discussions, workshops, poetry nights, and festival celebrations. Every event is a chance to deepen your connection with Tamil language and culture.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <PrimaryButton
                href="/auth/signup"
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 shadow-none font-semibold px-6 py-3"
              >
                Create Free Account
              </PrimaryButton>
              <PrimaryButton
                href="/lessons"
                className="bg-transparent border border-white/30 text-white hover:bg-white/10 shadow-none font-semibold px-6 py-3"
              >
                Browse Lessons
              </PrimaryButton>
            </div>

            <p className="mt-8 text-sm text-blue-200/70">
              No credit card required. Join 1,200+ Tamil learners today.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
