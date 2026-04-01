"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getEvents, deleteEvent, MozhiEvent, submitJoinRequest, JoinRequestPayload } from "@/services/eventService";
import { Pagination } from "@/components/ui/Pagination";
import { Loader2, Clock, MapPin, User, ChevronRight, Lock, Info, Calendar, Trash2 } from "lucide-react";
import { EventCard } from "@/components/features/events/EventCard";
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
        {/* ── 1. Modern Horizontal Event Showcase ──────────────────────── */}
        <section className="relative w-full bg-white pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="relative w-full h-[350px] md:h-[450px] rounded-[2rem] overflow-hidden shadow-[0_32px_80px_-20px_rgba(0,0,0,0.15)] group border border-gray-100/30">
              
              {loadingUpcoming ? (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/30" />
                </div>
              ) : spotlightEvents.length === 0 ? (
                <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-12 text-center space-y-4">
                  <Calendar size={48} className="text-gray-200" />
                  <p className="text-sm font-black text-gray-300 uppercase tracking-widest leading-loose">
                    No community spotlights <br /> currently scheduled
                  </p>
                </div>
              ) : (
                <>
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
                                onClick={() => handleOpenRegistration(event)}
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
                  <span className="h-1.5 w-8 rounded-full bg-secondary" />
                  <span className="text-[10px] font-black text-secondary tracking-widest uppercase">Register now</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">Upcoming Events</h2>
                <p className="text-lg text-gray-500 font-medium max-w-xl">Curated workshops, cultural meetups, and live sessions.</p>
              </div>
            </div>

            {loadingUpcoming ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Synchronizing Scrolls</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-responsive border border-dashed border-gray-100">
                <p className="text-lg font-bold text-gray-800">No upcoming events scheduled</p>
                <p className="text-sm text-gray-400 mt-2">Check back soon for new opportunities to connect.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
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
        <section className="py-32 bg-gray-50 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
           <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm text-[10px] font-black text-gray-800 tracking-widest uppercase">
                Archives & Memories
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">
                Previous <span className="text-primary italic">Gatherings</span>
              </h1>
            </div>

            {loadingPast ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-200" />
              </div>
            ) : pastEvents.length === 0 ? (
              <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-xs">The archives are currently empty</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {pastEvents.map((event) => (
                  <Card key={event._id} variant="outline" className="opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 border-none bg-white/50">
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 flex justify-between items-start">
                      <Calendar className="w-6 h-6 text-gray-300" />
                      <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-3 py-1 rounded-md uppercase tracking-widest">Closed</span>
                    </div>
                    <h4 className="font-bold text-gray-800 truncate mb-1">{event.title}</h4>
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-tight">{new Date(event.date).toLocaleDateString()}</p>
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

          <div className="max-w-3xl mx-auto text-center relative z-10 space-y-10">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-black uppercase tracking-[0.2em]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Join the Movement
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
              Experience Tamil Culture <br /> Like Never Before
            </h2>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button
                href="/auth/signup"
                size="xl"
                className="bg-white text-primary hover:bg-white/90 border-none px-12 h-16"
              >
                Sign Up Now
              </Button>
              <Button
                href="/lessons"
                variant="outline"
                size="xl"
                className="border-white/20 text-white hover:bg-white/10 px-12 h-16"
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
