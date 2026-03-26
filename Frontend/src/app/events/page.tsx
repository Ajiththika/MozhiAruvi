"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { getEvents, MozhiEvent, submitJoinRequest, JoinRequestPayload } from "@/services/eventService";
import { Pagination } from "@/components/Pagination";
import { Loader2, Clock, MapPin, User, ChevronRight, Lock, Info, Calendar } from "lucide-react";
import { EventCard } from "@/components/common/EventCard";
import RegistrationModal from "@/components/common/RegistrationModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
    await submitJoinRequest(selectedEvent._id, data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans scroll-smooth">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. Premium Hero Section ─────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 border-b border-gray-50">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
            <div className="absolute top-1/4 right-1/4 opacity-[0.03] font-black text-[20rem] text-primary select-none leading-none pointer-events-none rotate-12">
              க
            </div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
              {/* Left Column: Content */}
              <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 text-[10px] font-black text-primary uppercase tracking-widest border border-primary/10">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Community Experience
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-800 tracking-tight leading-tight">
                  Connect, Learn & Grow with <br />
                  <span className="text-primary italic">Tamil Culture</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed font-medium">
                  Experience the richness of Tamil heritage through curated workshops, poetry nights, and interactive meetups. Connect with native speakers worldwide.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 pt-6">
                  <Button
                    href="#upcoming"
                    size="xl"
                    className="w-full sm:w-auto px-10 shadow-xl shadow-primary/20"
                  >
                    Browse Events
                  </Button>
                  <Button
                    href="/about"
                    variant="outline"
                    size="xl"
                    className="w-full sm:w-auto px-10"
                  >
                    Explore Community
                  </Button>
                </div>
              </div>

              {/* Right Column: Featured Event Card */}
              <div className="lg:col-span-5 animate-in fade-in slide-in-from-right-4 duration-700 delay-150">
                {loadingUpcoming ? (
                  <div className="bg-gray-50 rounded-responsive h-[480px] w-full animate-pulse border border-gray-100 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-primary/20 animate-spin" />
                  </div>
                ) : upcomingEvents.length > 0 ? (
                  <div className="relative group">
                    <div className="absolute -inset-6 bg-primary/5 rounded-[3.5rem] blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                    <Card variant="elevated" padding="none" className="h-[520px] flex flex-col">
                      <div className="bg-soft/20 aspect-[16/10] relative overflow-hidden">
                        <div className="absolute top-6 left-6 flex flex-col items-center justify-center h-16 w-16 rounded-2xl bg-white shadow-xl text-primary border border-gray-100">
                          <span className="text-[10px] font-black leading-none mb-1 uppercase tracking-tighter">
                            {new Date(upcomingEvents[0].date).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                          <span className="text-xl font-black">
                            {new Date(upcomingEvents[0].date).getDate()}
                          </span>
                        </div>
                        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                          <div className="px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md text-[10px] font-black text-gray-800 tracking-widest uppercase border border-white/20">
                            Featured Event
                          </div>
                        </div>
                        <div className="h-full w-full flex items-center justify-center text-8xl opacity-10 font-black grayscale group-hover:grayscale-0 transition-all select-none">
                          MOZHI
                        </div>
                      </div>

                      <CardBody className="p-10 space-y-6">
                        <h3 className="text-3xl font-black text-gray-800 tracking-tight leading-tight group-hover:text-primary transition-colors">
                          {upcomingEvents[0].title}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3 text-gray-500 text-xs font-bold tracking-tight">
                            <Clock className="w-5 h-5 text-primary/40" />
                            {upcomingEvents[0].time}
                          </div>
                          <div className="flex items-center gap-3 text-gray-500 text-xs font-bold tracking-tight">
                            <MapPin className="w-5 h-5 text-primary/40" />
                            {upcomingEvents[0].location}
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleOpenRegistration(upcomingEvents[0])}
                          size="xl"
                          className="w-full py-7 gap-3 shadow-xl shadow-primary/20"
                        >
                          Reserve My Spot <ChevronRight className="w-5 h-5" />
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                ) : (
                  <Card variant="flat" padding="lg" className="h-[480px] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="h-20 w-20 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl">🗓️</div>
                    <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Community Hub</h3>
                    <p className="text-base text-gray-500 font-medium leading-relaxed max-w-xs">Join our global network. New events are scheduled regularly.</p>
                    <Button href="/about" variant="outline" size="md">View Our Story</Button>
                  </Card>
                )}
              </div>
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
