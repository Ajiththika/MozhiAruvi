import React from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";

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
    <section id="events" className="py-10 md:py-14 bg-slate-50 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light text-xs font-bold text-primary tracking-tight">
            Community & culture
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            Live Cultural Events
          </h2>
          <p className="text-base text-slate-700 font-medium max-w-xl mx-auto leading-relaxed">
            Language is best learned through the heart of its culture. Join our regular gatherings to experience Tamil heritage in action.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Column (Event Cards) */}
          <div className="flex-[1.2] w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm transition-all duration-300 group hover:border-primary/20 hover:shadow-xl cursor-pointer flex flex-col gap-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-primary flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    {event.icon}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    event.type === 'Online' ? 'bg-light text-primary' : 'bg-success/10 text-success'
                  }`}>
                    {event.type}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg mb-1 tracking-tight">{event.title}</h4>
                  <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary/60" />
                    {event.date}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column (Text) */}
          <div className="flex-1 w-full text-center lg:text-left space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
              Celebrate Tamil Heritage Together
            </h3>
            <p className="text-base text-slate-700 font-medium leading-relaxed max-w-xl">
              Experience Tamil culture through poetry readings, festival celebrations, film screenings, and interactive workshops. Connect with fellow enthusiasts and deepen your understanding beyond the classroom.
            </p>
            <Link 
              href="/events" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              Browse All Events <span>&rarr;</span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
