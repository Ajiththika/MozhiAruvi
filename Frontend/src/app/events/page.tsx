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
import { SpotlightCarousel } from "@/components/features/events/SpotlightCarousel";
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

  const isAdmin = user?.role === "admin";

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
        {/* ── 1. Modern Horizontal Event Showcase ──────────────────────── */}
        <section className="relative w-full bg-white pt-6 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SpotlightCarousel
              events={upcomingEvents}
              loading={loadingUpcoming}
              onRsvp={handleOpenRegistration}
            />
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
