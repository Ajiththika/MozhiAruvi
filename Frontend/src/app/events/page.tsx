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
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: string | boolean }) {
  const isOnline = type === "Online" || type === true;
  return (
    <span
      className={cn(
        "text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full border",
        isOnline
          ? "bg-accent/30 text-primary border-primary/10"
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
    if (!user) {
      router.push(`/auth/signin?redirect=${encodeURIComponent('/events')}`);
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegistrationSubmit = async (data: JoinRequestPayload) => {
    if (!selectedEvent) return;
    await submitJoinRequest(selectedEvent._id, data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── 1. Premium Hero Section ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 border-b border-gray-50">
          {/* Background decorative elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
            <div className="absolute top-1/4 right-1/4 opacity-[0.03] font-bold text-[20rem] text-primary select-none leading-none pointer-events-none rotate-12">
              க
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              
              {/* Left Column: Content */}
              <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 text-xs font-bold text-primary tracking-tight border border-primary/10">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Community Experience
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-gray-800 tracking-tight leading-tight">
                  Connect, Learn & Grow with <br />
                  <span className="text-primary italic">Tamil Cultural Events</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed font-medium">
                  Experience the richness of Tamil heritage through curated workshops, poetry nights, and interactive meetups. Connect with native speakers and passionate learners worldwide in our vibrant space.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 pt-6">
                  <Button 
                    href="#upcoming" 
                    variant="primary" 
                    size="lg"
                    className="w-full sm:w-auto px-10 shadow-xl shadow-primary/10"
                  >
                    Browse Events
                  </Button>
                  <Button 
                    href="/about" 
                    variant="secondary" 
                    size="lg"
                    className="w-full sm:w-auto px-10 border-primary text-primary font-bold hover:bg-primary/5"
                  >
                    Explore Community
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-10 border-t border-slate-50">
                  <div className="flex -space-x-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm">
                        <User className="h-7 w-7 text-gray-300" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-500 tracking-tight">
                    Join 1,200+ members in our next gathering
                  </p>
                </div>
              </div>

              {/* Right Column: Featured Event Card */}
              <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                {loadingUpcoming ? (
                  <div className="bg-gray-50 rounded-[3rem] h-[480px] w-full animate-pulse border border-gray-100 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary/20 animate-spin" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="relative group">
                    <div className="absolute -inset-6 bg-primary/5 rounded-[3.5rem] blur-2xl group-hover:bg-primary/10 transition-colors duration-700" />
                    <div className="relative bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-slate-200/40 overflow-hidden group-hover:shadow-3xl transition-all duration-700">
                      {/* Card Header/Date Overlay */}
                      <div className="bg-gray-50 aspect-[16/10] relative overflow-hidden group-hover:bg-primary/5 transition-colors">
                        <div className="absolute top-6 left-6 flex flex-col items-center justify-center h-16 w-16 rounded-3xl bg-white shadow-xl text-primary border border-gray-100">
                          <span className="text-xs font-bold leading-none mb-1">
                            {new Date(upcomingEvents[0].date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </span>
                          <span className="text-xl font-bold">
                            {new Date(upcomingEvents[0].date).getDate()}
                          </span>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                           <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-bold text-gray-800 tracking-tight border border-gray-100">
                              Featured Event
                           </div>
                           <EventTypeBadge type={true} />
                        </div>
                        <div className="h-full w-full flex items-center justify-center text-7xl opacity-50 filter grayscale group-hover:grayscale-0 transition-all">📅</div>
                      </div>

                      <div className="p-10 space-y-6">
                        <h3 className="text-3xl font-bold text-gray-800 tracking-tight leading-tight group-hover:text-primary transition-colors">
                          {upcomingEvents[0].title}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3 text-gray-600 text-sm font-bold tracking-tight">
                            <Clock className="w-5 h-5 text-primary opacity-40" />
                            {upcomingEvents[0].time}
                          </div>
                          <div className="flex items-center gap-3 text-gray-600 text-sm font-bold tracking-tight">
                             <MapPin className="w-5 h-5 text-primary opacity-40" />
                             {upcomingEvents[0].location}
                          </div>
                        </div>

                        <p className="text-base text-gray-500 leading-relaxed line-clamp-2 italic font-medium">
                          "{upcomingEvents[0].description}"
                        </p>

                        <Button 
                          onClick={() => handleOpenRegistration(upcomingEvents[0])}
                          variant="primary" 
                          className="w-full py-7 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-primary/10"
                        >
                          Reserve My Spot <ChevronRight className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-[3rem] p-12 border border-gray-100 flex flex-col items-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl">🗓️</div>
                    <h3 className="text-xl font-bold text-gray-800">Community Hub</h3>
                    <p className="text-base text-gray-500 font-medium leading-relaxed">Join our global network of Tamil learners. New events are scheduled regularly to help you master the language.</p>
                    <Button href="/about" variant="secondary" size="md" className="px-8 border-primary text-primary">View Our Story</Button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* ── 2. Upcoming Events ──────────────────────────────────── */}
        <section id="upcoming" className="py-10 md:py-14 bg-white px-4 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-gray-50 pb-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-8 rounded-full bg-secondary" />
                  <span className="text-xs font-bold text-secondary tracking-tight">Register now</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight">Upcoming Events</h2>
                <p className="text-base text-gray-600 font-medium leading-relaxed">Book your spot for our latest workshops and meetups.</p>
              </div>
            </div>

            {loadingUpcoming ? (
               <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Opening the scrolls...</p>
               </div>
            ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-100">
                   <p className="text-lg font-semibold text-gray-800">No upcoming events found</p>
                   <p className="text-sm text-gray-500 mt-2">Check back later for new workshops and meetups.</p>
                </div>
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {upcomingEvents.map((event) => (
                    <div
                      key={event._id}
                      className="bg-white rounded-3xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-500 group flex flex-col relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full transition-all group-hover:scale-110" />
                      
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col items-start gap-1">
                           <span className="text-2xl font-bold text-primary">
                             {new Date(event.date).getDate()}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                             {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                           </span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <TagBadge tag="Community" />
                          <EventTypeBadge type={true} />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-800 mb-4 leading-tight group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1 font-medium line-clamp-3">
                        {event.description}
                      </p>

                      <div className="space-y-4 mb-8 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3 text-gray-600 text-xs font-bold tracking-tight">
                          <Clock className="w-4 h-4 text-primary/40" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 text-xs font-bold tracking-tight">
                          <MapPin className="w-4 h-4 text-primary/40" />
                          {event.location}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleOpenRegistration(event)}
                        variant="primary"
                        size="md"
                        className="w-full gap-2 rounded-xl py-4"
                      >
                        Register Now <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  ))}
                </div>

                {upcomingTotalPages > 1 && (
                  <div className="mt-16">
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
        <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-4xl mx-auto relative z-10 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm text-xs font-bold text-gray-800 tracking-tight">
              Community & Culture
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight">
              Tamil Cultural Events & <span className="text-primary italic">Gatherings</span>
            </h1>
                <p className="text-gray-700 text-base font-medium max-w-xl leading-relaxed">
                  Highlights from our previous gatherings and community milestones.
                </p>
              </div>
            </div>

            {loadingPast ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : pastEvents.length === 0 ? (
                <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-gray-100">
                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">The archives are currently empty</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {pastEvents.map((event) => (
                    <div key={event._id} className="bg-white rounded-2xl border border-gray-100 p-6 opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 flex justify-between items-start">
                           <span className="text-2xl">🗓️</span>
                           <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded-md uppercase tracking-wider">Expired</span>
                        </div>
                        <h4 className="font-bold text-gray-800 line-clamp-1 mb-2">{event.title}</h4>
                        <p className="text-[11px] text-gray-500 font-medium mb-4">{new Date(event.date).toLocaleDateString()}</p>
                        
                        <div className="flex items-center gap-2 py-3 border-t border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                           <Lock className="w-3 h-3" /> Registration Closed
                        </div>
                    </div>
                  ))}
                </div>
            )}
          </div>
        </section>

        {/* ── 4. Community CTA ────────────────────────────────────── */}
        <section className="py-28 bg-primary px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] font-black text-[18rem] text-white select-none pointer-events-none">
              க
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Join the Movement
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Experience Tamil Culture <br /> Like Never Before
            </h2>
            <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed font-medium">
              Become part of a flourishing global community dedicated to preserving and exploring the world's oldest living classical language.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href="/auth/signup"
                variant="primary"
                size="lg"
                className="bg-white text-primary hover:bg-accent/30 border-none shadow-xl px-8"
              >
                Sign Up for Updates
              </Button>
              <Button
                href="/lessons"
                variant="secondary"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 px-8"
              >
                Browse Lessons
              </Button>
            </div>

            <p className="mt-8 text-xs text-blue-200/50 font-medium tracking-wide flex items-center justify-center gap-2">
              <Info className="w-3.5 h-3.5" /> 1,200+ active learners across 25 countries
            </p>
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

