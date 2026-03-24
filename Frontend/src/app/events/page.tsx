"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/common/Button";
import { getEvents, MozhiEvent, submitJoinRequest, JoinRequestPayload } from "@/services/eventService";
import { Pagination } from "@/components/Pagination";
import { Loader2, Calendar, Clock, MapPin, User, ChevronRight, Lock, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import RegistrationModal from "@/components/common/RegistrationModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: string | boolean }) {
  const isOnline = type === "Online" || type === true;
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border",
        isOnline
          ? "bg-light text-primary border-primary/10"
          : "bg-success/10 text-success border-success/10"
      )}
    >
      {isOnline ? "Online" : "In-Person"}
    </span>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
      {tag}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<MozhiEvent[]>([]);
  const [pastEvents, setPastEvents] = useState<MozhiEvent[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [loadingPast, setLoadingPast] = useState(true);
  
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingTotalPages, setUpcomingTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MozhiEvent | null>(null);

  useEffect(() => {
    setLoadingUpcoming(true);
    getEvents(upcomingPage, 6, 'upcoming')
      .then(res => {
        setUpcomingEvents(res.events);
        setUpcomingTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingUpcoming(false));
  }, [upcomingPage]);

  useEffect(() => {
    setLoadingPast(true);
    getEvents(1, 4, 'past') // Only fetch first 4 past events
      .then(res => {
        setPastEvents(res.events);
      })
      .catch(console.error)
      .finally(() => setLoadingPast(false));
  }, []);

  const handleOpenRegistration = (event: MozhiEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSubmit = async (data: JoinRequestPayload) => {
    if (!selectedEvent) return;
    await submitJoinRequest(selectedEvent._id, data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── 1. Premium Hero Section ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-28 pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
          </div>

          <div className="container-wide relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              
              {/* Left Column: Content */}
              <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-12 rounded-full bg-primary" />
                  <label>Live Community Experience</label>
                </div>

                <h1>
                  Connect, Learn & Grow with <br />
                  <span className="text-primary italic">Tamil Cultural Events</span>
                </h1>

                <p className="text-lg md:text-xl max-w-2xl">
                  Experience the richness of Tamil heritage through curated workshops, poetry nights, and interactive meetups. Connect with native speakers and passionate learners worldwide in our vibrant space.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                  <Button 
                    href="#upcoming" 
                    variant="primary" 
                    size="xl"
                    className="w-full sm:w-auto"
                  >
                    Browse Events
                  </Button>
                  <Button 
                    href="/about" 
                    variant="secondary" 
                    size="xl"
                    className="w-full sm:w-auto"
                  >
                    Explore Community
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-10 border-t border-slate-50">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-14 w-14 rounded-full border-4 border-white bg-slate-50 flex items-center justify-center overflow-hidden shadow-sm">
                        <User className="h-8 w-8 text-slate-300" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-slate-500 tracking-tight">
                    Join 1,200+ members in our next gathering
                  </p>
                </div>
              </div>

              {/* Right Column: Featured Event Card */}
              <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                {loadingUpcoming ? (
                  <div className="bg-slate-50 rounded-[2rem] h-[520px] w-full animate-pulse border border-slate-100 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary/20 animate-spin" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="relative group">
                    <div className="absolute -inset-8 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-colors duration-1000" />
                    <div className="relative bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden group-hover:shadow-3xl transition-all duration-700">
                      {/* Card Header/Image Placeholder */}
                      <div className="bg-slate-50 aspect-[16/10] relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                        <div className="absolute top-8 left-8 flex flex-col items-center justify-center h-20 w-20 rounded-[1.5rem] bg-white shadow-xl text-primary border border-slate-50">
                          <span className="text-xs font-bold leading-none mb-1">
                            {new Date(upcomingEvents[0].date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </span>
                          <span className="text-2xl font-extrabold tracking-tighter">
                            {new Date(upcomingEvents[0].date).getDate()}
                          </span>
                        </div>
                        <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                           <div className="px-5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-bold text-slate-900 tracking-widest border border-slate-200 uppercase">
                              Featured Event
                           </div>
                           <EventTypeBadge type={true} />
                        </div>
                        <div className="h-full w-full flex items-center justify-center text-8xl opacity-30 filter grayscale group-hover:grayscale-0 transition-all duration-1000">📅</div>
                      </div>

                      <div className="p-10 md:p-12 space-y-8">
                        <h2 className="text-slate-900 leading-tight group-hover:text-primary transition-colors">
                          {upcomingEvents[0].title}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-8">
                          <div className="flex items-center gap-4 text-slate-600 text-sm font-bold tracking-tight">
                            <Clock className="w-5 h-5 text-primary opacity-40" />
                            {upcomingEvents[0].time}
                          </div>
                          <div className="flex items-center gap-4 text-slate-600 text-sm font-bold tracking-tight">
                             <MapPin className="w-5 h-5 text-primary opacity-40" />
                             {upcomingEvents[0].location}
                          </div>
                        </div>

                        <p className="line-clamp-2 italic">
                          "{upcomingEvents[0].description}"
                        </p>

                        <div className="pt-4">
                          <Button 
                            onClick={() => handleOpenRegistration(upcomingEvents[0])}
                            variant="primary" 
                            size="lg"
                            className="w-full flex items-center justify-center gap-3"
                          >
                            Reserve My Spot <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-[2rem] p-16 border border-slate-100 flex flex-col items-center text-center space-y-8">
                    <div className="h-24 w-24 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl">🗓️</div>
                    <h3 className="text-slate-900">Community Hub</h3>
                    <p className="max-w-xs mx-auto">Join our global network of Tamil learners. New events are scheduled regularly to help you master the language.</p>
                    <Button href="/about" variant="secondary" size="lg">View Our Story</Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Upcoming Events ──────────────────────────────────── */}
        <section id="upcoming" className="section-spacing container-wide">
            <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-10 border-b border-slate-100 pb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="h-1.5 w-10 rounded-full bg-secondary" />
                  <label className="text-secondary">Register now</label>
                </div>
                <h2>Upcoming Events</h2>
                <p className="max-w-2xl">Book your spot for our latest workshops and meetups.</p>
              </div>
            </div>

            {loadingUpcoming ? (
               <div className="flex flex-col items-center justify-center py-40 gap-6">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <label>Opening the scrolls...</label>
               </div>
            ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 shadow-inner">
                   <h3 className="text-slate-900">No upcoming events found</h3>
                   <p className="mt-2">Check back later for new workshops and meetups.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-[2rem] border border-slate-50 p-10 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 group flex flex-col relative overflow-hidden shadow-xl shadow-slate-200/20"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110 duration-1000" />
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex flex-col items-start gap-1">
                           <span className="text-3xl font-extrabold text-primary tracking-tighter">
                             {new Date(event.date).getDate()}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                           </span>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <TagBadge tag="Community" />
                          <EventTypeBadge type={true} />
                        </div>
                      </div>

                      <h3 className="group-hover:text-primary transition-colors duration-300 leading-tight mb-4">
                        {event.title}
                      </h3>
                      <p className="text-sm line-clamp-3 flex-1 mb-8">
                        {event.description}
                      </p>

                      <div className="space-y-4 mb-10 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-4 text-slate-600 text-xs font-bold tracking-tight">
                          <Clock className="w-4.5 h-4.5 text-primary/40" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-4 text-slate-600 text-xs font-bold tracking-tight">
                          <MapPin className="w-4.5 h-4.5 text-primary/40" />
                          {event.location}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenRegistration(event)}
                        variant="primary"
                        size="lg"
                        className="w-full gap-3 group/btn"
                      >
                        Register Now <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ))}
                </div>

                {upcomingTotalPages > 1 && (
                  <div className="mt-20 flex justify-center">
                    <Pagination 
                      currentPage={upcomingPage}
                      totalPages={upcomingTotalPages}
                      onPageChange={setUpcomingPage}
                    />
                  </div>
                )}
                </>
            )}
        </section>

        {/* ── 3. Past Events ──────────────────────────────────────── */}
        <section className="section-spacing bg-white px-4 sm:px-6 lg:px-8 border-t border-slate-100">
          <div className="container-wide">
            <div className="mb-20 text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <span className="h-1.5 w-10 rounded-full bg-slate-300" />
                <label className="text-slate-400">Archives</label>
                <span className="h-1.5 w-10 rounded-full bg-slate-300" />
              </div>
              <h2>Past Community Milestones</h2>
              <p className="max-w-xl mx-auto">
                Highlights from our previous gatherings and cultural celebrations.
              </p>
            </div>

            {loadingPast ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
              </div>
            ) : pastEvents.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                   <label>The archives are currently empty</label>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {pastEvents.map((event) => (
                    <div key={event._id} className="bg-slate-50 rounded-[2rem] border border-slate-100 p-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:bg-white hover:shadow-xl shadow-slate-200/20">
                        <div className="bg-white rounded-2xl p-6 mb-6 flex justify-between items-start shadow-sm border border-slate-100">
                           <span className="text-3xl">🗓️</span>
                           <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full uppercase tracking-widest">Completed</span>
                        </div>
                        <h4 className="line-clamp-1 mb-3">{event.title}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">
                          {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        
                        <div className="flex items-center gap-3 py-4 border-t border-slate-200/50 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                           <Lock className="w-4 h-4" /> Registration Closed
                        </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* ── 4. Community CTA ────────────────────────────────────── */}
        <section className="section-spacing bg-primary px-4 sm:px-6 lg:px-8 relative overflow-hidden text-center">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-[1200px] h-96 bg-primary-dark/20 rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto relative z-10 space-y-10">
            <div className="flex items-center justify-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-white/20" />
              <label className="text-white/80">Join the Movement</label>
              <span className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            <h1 className="text-white lg:text-7xl">
              Experience Tamil Culture <br /> Like Never Before
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 max-w-2xl mx-auto leading-relaxed font-medium">
              Become part of a flourishing global community dedicated to preserving and exploring the world's oldest living classical language.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Button
                href="/auth/signup"
                variant="primary"
                size="xl"
                className="bg-white text-primary border-none shadow-2xl shadow-black/20"
              >
                Sign Up for Updates
              </Button>
              <Button
                href="/lessons"
                variant="outline"
                size="xl"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Browse Lessons
              </Button>
            </div>

            <div className="pt-12 flex items-center justify-center gap-3 text-xs text-blue-200/50 font-bold uppercase tracking-widest">
              <Info className="w-4 h-4" /> 1,200+ active learners across 25 countries
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Registration Modal */}
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

