import React from "react";
import Link from "next/link";

const events = [
  {
    id: 1,
    title: "Tamil Poetry Night",
    date: "March 15, 2026",
    type: "Online",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    id: 2,
    title: "Pongal Celebration",
    date: "Jan 14, 2026",
    type: "Offline",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    id: 3,
    title: "Film Discussion",
    date: "April 5, 2026",
    type: "Online",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 4,
    title: "Conversation Meetup",
    date: "April 10, 2026",
    type: "Offline",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

export default function CulturalEvents() {
  return (
    <section id="events" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Column (Event Cards) */}
          <div className="flex-1 w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-6">
            {events.map((event) => (
              <div 
                key={event.id}
                className="bg-soft-bg rounded-2xl p-6 border border-border-color hover:border-primary/40 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                    event.type === 'Online' ? 'bg-blue-100 text-primary-dark' : 'bg-green-100 text-green-700'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <h4 className="font-bold text-accent-text text-lg mb-1">{event.title}</h4>
                <div className="text-sm font-medium text-muted flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (Text) */}
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-blue text-sm font-semibold text-primary mb-6">
              CULTURAL EVENTS
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-accent-text mb-6">
              Join Our Cultural Events &amp; Celebrate Tamil Heritage
            </h2>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              Experience Tamil culture through poetry readings, festival celebrations, film screenings, interactive workshops, and more. Connect with fellow enthusiasts and deepen your understanding beyond the classroom.
            </p>

            <Link 
              href="/events" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md hover:-translate-y-0.5"
            >
              Browse Events
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
