import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";

export const metadata: Metadata = {
  title: "Events - Mozhi Aruvi",
  description: "Join Tamil cultural events, language workshops, poetry nights, and community discussions hosted by Mozhi Aruvi.",
};

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

const upcomingEvents = [
  {
    id: 1,
    title: "Tamil Conversation Meetup",
    emoji: "💬",
    description: "Practice your spoken Tamil in a relaxed, friendly environment with native speakers and fellow learners.",
    date: "April 5, 2026",
    type: "Online",
    tag: "Speaking",
  },
  {
    id: 2,
    title: "Pongal Cultural Celebration",
    emoji: "🌾",
    description: "Celebrate Tamil harvest festival together with traditional rituals, music, and cultural storytelling.",
    date: "April 10, 2026",
    type: "Offline",
    tag: "Festival",
  },
  {
    id: 3,
    title: "Tamil Film Discussion Night",
    emoji: "🎬",
    description: "Watch and analyse a classic Tamil film together. Explore language, themes, and cinematic history.",
    date: "April 18, 2026",
    type: "Online",
    tag: "Culture",
  },
  {
    id: 4,
    title: "Beginner Tamil Workshop",
    emoji: "🔤",
    description: "A structured, interactive 2-hour workshop for absolute beginners covering scripts and basic phrases.",
    date: "April 25, 2026",
    type: "Online",
    tag: "Workshop",
  },
  {
    id: 5,
    title: "Tamil Music & Lyrics Night",
    emoji: "🎵",
    description: "Explore the poetry hidden in Tamil classical and film music with lyric breakdowns and live discussion.",
    date: "May 3, 2026",
    type: "Online",
    tag: "Music",
  },
  {
    id: 6,
    title: "Tamil Calligraphy Workshop",
    emoji: "✍️",
    description: "Learn to write beautiful Tamil script by hand with guided instruction from our expert educators.",
    date: "May 12, 2026",
    type: "Offline",
    tag: "Workshop",
  },
];

const pastEvents = [
  {
    id: 1,
    title: "Tamil Literature Talk",
    emoji: "📚",
    recap: "A captivating discussion on Thirukkural — its philosophy, relevance, and timeless wisdom. Over 200 attendees joined live.",
    date: "February 10, 2026",
  },
  {
    id: 2,
    title: "Sangam Poetry Reading",
    emoji: "🌿",
    recap: "We explored the Akam and Puram traditions of Sangam poetry, reading aloud passages and discussing their meanings.",
    date: "January 28, 2026",
  },
  {
    id: 3,
    title: "Tamil Movie Night",
    emoji: "🍿",
    recap: "Community members watched and discussed a landmark Tamil film together, exploring language, history, and culture.",
    date: "January 14, 2026",
  },
  {
    id: 4,
    title: "Language Beginner Bootcamp",
    emoji: "🚀",
    recap: "A 3-hour intensive for new learners covering the Tamil alphabet, basic vocabulary, and essential greetings.",
    date: "December 20, 2025",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function EventTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${type === "Online"
          ? "bg-mozhi-light text-mozhi-primary"
          : "bg-green-100 text-green-700"
        }`}
    >
      {type}
    </span>
  );
}

function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-light-blue text-primary">
      {tag}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventsPage() {
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

            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-4">
              Connect, learn, and celebrate Tamil culture with our global community.
            </p>
            <p className="text-base text-muted max-w-xl mx-auto leading-relaxed mb-8">
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

                  <p className="text-muted text-lg leading-relaxed mb-8">
                    {featuredEvent.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {[
                      { icon: "📅", label: "Date", value: featuredEvent.date },
                      { icon: "⏰", label: "Time", value: featuredEvent.time },
                      { icon: "📍", label: "Location", value: featuredEvent.location },
                      { icon: "🎤", label: "Host", value: featuredEvent.host },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-3 p-4 bg-soft-bg rounded-xl border border-border-color">
                        <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-0.5">{item.label}</p>
                          <p className="text-sm font-semibold text-accent-text">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <PrimaryButton href="/auth/signup" className="flex-1 justify-center">
                      Register Now
                    </PrimaryButton>
                    <SecondaryButton href="#" className="flex-1 justify-center">
                      View Details
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-soft-bg rounded-2xl border border-border-color p-7 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="text-4xl group-hover:scale-110 transition-transform">{event.emoji}</div>
                    <div className="flex items-center gap-2">
                      <TagBadge tag={event.tag} />
                      <EventTypeBadge type={event.type} />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-accent-text mb-3 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-5 flex-1">
                    {event.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-5 border-t border-border-color">
                    <div className="flex items-center gap-2 text-muted text-sm font-medium">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {event.date}
                    </div>
                    <button className="text-sm font-bold text-primary hover:text-primary-dark hover:underline transition-colors">
                      View Event →
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-mozhi-light/20 backdrop-blur-sm rounded-2xl border border-mozhi-soft/20 p-6 hover:shadow-md hover:border-mozhi-soft/50 transition-all duration-300 group flex flex-col"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{event.emoji}</div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                      Completed
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-accent-text mb-3 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed mb-5 flex-1">
                    {event.recap}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border-color">
                    <div className="text-xs font-medium text-muted">{event.date}</div>
                    <button className="text-xs font-bold text-muted hover:text-primary transition-colors">
                      View Highlights →
                    </button>
                  </div>
                </div>
              ))}
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
