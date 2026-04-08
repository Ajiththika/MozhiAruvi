"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getEvents, deleteEvent, MozhiEvent, submitJoinRequest, JoinRequestPayload } from "@/services/eventService";
import Pagination from "@/components/ui/Pagination";
import { Loader2, Clock, MapPin, ChevronRight, Calendar } from "lucide-react";
import EventCard from "@/components/features/events/EventCard";
import RegistrationModal from "@/components/features/events/RegistrationModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EventsPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [upcomingEvents, setUpcomingEvents] = useState<MozhiEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<MozhiEvent[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);
  
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MozhiEvent | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const isAdmin = user?.role === "admin";
  const spotlightEvents = upcomingEvents.slice(0, 5);

  const handleEdit = (id: string) => {
    router.push(`/admin/events?edit=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action will deactivate it for all users.")) return;
    try {
      await deleteEvent(id);
      setUpcomingEvents(prev => prev.filter(e => e._id !== id));
      alert("Event deleted successfully.");
    } catch (err) {
      alert("Failed to delete event.");
    }
  };

  useEffect(() => {
    setLoadingUpcoming(true);
    getEvents(upcomingPage, 6, "upcoming")
      .then((res) => {
        setUpcomingEvents(res.events);
        setUpcomingTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingUpcoming(false));
  }, [upcomingPage]);

  useEffect(() => {
    setLoadingPast(true);
    getEvents(1, 4, "past")
      .then((res) => {
        setPastEvents(res.events);
      })
      .catch(console.error)
      .finally(() => setLoadingPast(false));
  }, []);

  useEffect(() => {
    if (spotlightEvents.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % spotlightEvents.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [spotlightEvents.length]);

  const handleOpenRegistration = (event: MozhiEvent) => {
    if (!user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent("/events")}`);
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSubmit = async (data: JoinRequestPayload) => {
    if (!selectedEvent) return;
    try {
      await submitJoinRequest(selectedEvent._id, data);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.redirect) {
        if (data.requiresPayment) {
          if (window.confirm("You've reached your free event limit. Would you like to join this event for $5?")) {
            const { createEventPayment } = await import("@/services/paymentService");
            const { url } = await createEventPayment(selectedEvent._id);
            window.location.href = url;
            return;
          }
        }
        router.push(data.redirect);
        throw err; // propagates to modal for error state
      }
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. Cinematic Horizontal Event Showcase (Ultra-Premium) ───────── */}
        <section className="relative w-full bg-white pt-8 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full h-[450px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(30,27,75,0.3)] group border border-white/20">
              
              {loadingUpcoming ? (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                     <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">Curating Moments</p>
                  </div>
                </div>
              ) : spotlightEvents.length === 0 ? (
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
                     <Calendar size={32} className="text-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">The Horizon is Clear</p>
                    <p className="text-xs font-bold text-slate-400">No community spotlights currently scheduled.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="absolute inset-0 w-full h-full flex transition-transform duration-[1200ms] ease-[cubic-bezier(0.2,1,0.2,1)]"
                    style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                  >
                    {spotlightEvents.map((event, idx) => (
                      <div key={event._id} className="min-w-full h-full relative shrink-0">
                        {/* Background Media with Parallax-like Slow Zoom */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20000ms] ease-linear group-hover:scale-110"
                          style={{
                            backgroundImage: event.image
                              ? `url(${event.image})`
                              : `linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)`
                          }}
                        />
                        
                        {/* Advanced Layered Overlay System */}
                        <div className="absolute inset-0 bg-indigo-950/40 mix-blend-multiply" /> 
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/60 to-transparent z-10" /> 
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-transparent to-transparent z-10" /> 
                        
                        {/* Cinematic Floating Content */}
                        <div className="absolute inset-0 flex items-center p-8 md:p-20 z-20">
                          <div className="max-w-xl space-y-8 animate-in fade-in slide-in-from-left-12 duration-1000">
                            
                            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-lg">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                              </span>
                              Platform Spotlight
                            </div>

                            <div className="space-y-4">
                              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[0.95] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                {event.title}
                              </h2>
                              <div className="h-1.5 w-24 bg-emerald-400 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.5)]" />
                            </div>

                            <div className="flex flex-wrap items-center gap-8 text-white/90 font-bold text-[10px] md:text-xs pt-4 uppercase tracking-[0.1em]">
                              <div className="flex items-center gap-3 group/info">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover/info:bg-emerald-400/20 group-hover/info:border-emerald-400/30 transition-colors">
                                  <Calendar className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-white drop-shadow-md">
                                  {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 group/info">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover/info:bg-emerald-400/20 group-hover/info:border-emerald-400/30 transition-colors">
                                  <Clock className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-white drop-shadow-md">{event.time}</span>
                              </div>
                              <div className="flex items-center gap-3 group/info">
                                <div className="p-2 rounded-lg bg-white/10 border border-white/10 group-hover/info:bg-emerald-400/20 group-hover/info:border-emerald-400/30 transition-colors">
                                  <MapPin className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-white drop-shadow-md">{event.location}</span>
                              </div>
                            </div>

                            <div className="pt-10">
                              <button
                                onClick={() => handleOpenRegistration(event)}
                                className="inline-flex items-center gap-4 bg-white text-indigo-950 px-12 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] hover:bg-emerald-400 hover:text-white transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] active:scale-95 group/btn border-none"
                              >
                                Reserve Experience
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Background Floating Glyph */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] font-black text-[40rem] text-white leading-none select-none pointer-events-none translate-x-1/4">
                           க
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Minimal Indicator Dots */}
                  {spotlightEvents.length > 1 && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
                      {spotlightEvents.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={cn(
                            "h-2 rounded-full transition-all duration-500 shadow-sm",
                            activeSlide === i ? "bg-white w-14" : "bg-white/20 w-3 hover:bg-white/50"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* ── 2. Upcoming Events ──────────────────────────────────── */}
        <section id="upcoming" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-10 rounded-full bg-secondary shadow-sm" />
                  <span className="text-xs font-bold text-secondary tracking-widest uppercase">Live Sessions</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-primary tracking-tight">Upcoming Events</h2>
                <p className="text-xl text-slate-600 font-semibold max-w-xl leading-relaxed">Curated workshops, cultural meetups, and live sessions with native tutors.</p>
              </div>
            </div>

            {loadingUpcoming ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xs font-bold text-primary/60 uppercase tracking-widest">Synchronizing Scrolls</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-xl font-bold text-primary">No upcoming events scheduled</p>
                <p className="text-base text-primary/70 mt-2">Check back soon for new opportunities to connect.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                  {upcomingEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      {...event}
                      id={event._id}
                      onRsvp={() => handleOpenRegistration(event)}
                      onEdit={isAdmin ? () => handleEdit(event._id) : undefined}
                      onDelete={isAdmin ? () => handleDelete(event._id) : undefined}
                    />
                  ))}
                </div>

                {upcomingTotalPages > 1 && (
                  <div className="mt-20">
                    <Pagination
                      currentPage={upcomingPage}
                      totalPages={upcomingTotalPages}
                      onPageChange={setUpcomingPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* ── 3. Past Events ──────────────────────────────────────── */}
        <section className="py-32 bg-slate-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
           <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-primary/20 bg-white shadow-xl shadow-slate-200/50 text-xs font-bold text-primary tracking-widest uppercase">
                Archives & Memories
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tight">
                Previous Gatherings
              </h1>
            </div>

            {loadingPast ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-10 h-10 animate-spin text-primary/40" />
              </div>
            ) : pastEvents.length === 0 ? (
              <p className="text-center text-primary/60 font-bold uppercase tracking-widest text-xs">The archives are currently empty</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {pastEvents.map((event) => (
                  <Card key={event._id} variant="outline" className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700 border border-slate-100 bg-white/80 shadow-sm hover:shadow-xl">
                    <div className="bg-slate-50 rounded-xl p-5 mb-5 flex justify-between items-start">
                      <Calendar className="w-7 h-7 text-primary/40" />
                      <span className="text-xs font-bold bg-slate-100 text-primary/70 px-3 py-1.5 rounded-lg uppercase tracking-widest">Closed</span>
                    </div>
                    <h4 className="font-bold text-primary text-base truncate mb-1">{event.title}</h4>
                    <p className="text-xs text-primary/70 font-bold uppercase tracking-tight">{new Date(event.date).toLocaleDateString()}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── 4. Community CTA ────────────────────────────────────── */}
        <section className="py-32 bg-primary px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] font-black text-[25rem] text-white select-none pointer-events-none">
              க
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-12">
            <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full bg-white/15 border border-white/25 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-black/10">
              <span className="w-3 h-3 rounded-full bg-white animate-pulse shadow-sm" />
              Join the Global Community
            </div>

            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Experience Tamil Culture <br /> Like Never Before
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6">
              <Button
                href="/auth/signup"
                size="xl"
                className="bg-white text-indigo-900 hover:bg-slate-50 border-none px-16 h-20 rounded-2xl shadow-2xl shadow-indigo-950/40 text-sm font-bold uppercase tracking-widest"
              >
                Sign Up Now
              </Button>
              <Button
                href="/lessons"
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10 px-16 h-20 rounded-2xl text-sm font-bold uppercase tracking-widest"
              >
                Explore Lessons
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {selectedEvent && (
        <RegistrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          eventTitle={selectedEvent.title}
          eventId={selectedEvent._id}
          onSubmit={handleRegistrationSubmit}
        />
      )}
    </div>
  );
}
















