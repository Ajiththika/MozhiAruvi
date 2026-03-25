import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/common/Button";

export const metadata: Metadata = {
  title: "About - Mozhi Aruvi",
  description: "Learn about Mozhi Aruvi — the modern platform for learning Tamil language and culture through interactive lessons and expert tutors.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const missionCards = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Preserve Tamil Heritage",
    description: "Tamil is one of the world's oldest living classical languages. We build tools that help learners connect with 2,000+ years of literary and cultural tradition.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "Modern Learning Tools",
    description: "Voice pronunciation practice, gamified quizzes, AI-powered feedback, and one-on-one tutor sessions — learning Tamil has never been this engaging.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Global Tamil Community",
    description: "From Tamil Nadu to Toronto, our learners and tutors span the globe. Join a vibrant community built on shared love for Tamil language and culture.",
  },
];

const featureCards = [
  {
    emoji: "📚",
    title: "Interactive Lessons",
    description: "Structured lessons covering scripts, grammar, vocabulary, and reading comprehension.",
  },
  {
    emoji: "🎙️",
    title: "Voice Pronunciation",
    description: "Listen to native speakers and practice your pronunciation with real-time feedback.",
  },
  {
    emoji: "👩‍🏫",
    title: "Expert Tamil Tutors",
    description: "Get direct access to 38+ verified Tamil tutors for guidance and private sessions.",
  },
  {
    emoji: "🎮",
    title: "Gamified Learning",
    description: "Earn XP, build streaks, complete challenges, and unlock lessons like a game.",
  },
  {
    emoji: "🎉",
    title: "Cultural Events",
    description: "Participate in online and offline events celebrating Tamil arts, poetry, and festivals.",
  },
  {
    emoji: "🌍",
    title: "Global Community",
    description: "Connect with Tamil learners and enthusiasts from across the world.",
  },
];

const events = [
  { title: "Tamil Poetry Night", date: "March 15, 2026", type: "Online", emoji: "📜" },
  { title: "Pongal Celebration", date: "Jan 14, 2026", type: "Offline", emoji: "🌾" },
  { title: "Film Discussion", date: "April 5, 2026", type: "Online", emoji: "🎬" },
  { title: "Conversation Meetup", date: "April 10, 2026", type: "Offline", emoji: "💬" },
];

const stats = [
  { value: "1,200+", label: "Active Learners" },
  { value: "50+", label: "Interactive Lessons" },
  { value: "38", label: "Expert Tutors" },
  { value: "95%", label: "Satisfaction Rate" },
];



// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-soft/10 font-sans">
      <Navbar />

      <main className="flex-1">

        {/* ── 1. Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-soft/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] text-[18rem] text-primary select-none leading-none">
              த
            </div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30-blue border border-primary/20 text-primary text-sm font-semibold mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Our Story
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight leading-tight">
                About{" "}
                <span className="text-primary">Mozhi Aruvi</span>
              </h1>
            </div>
 
            <p className="text-base text-gray-700 max-w-xl mx-auto leading-relaxed mt-6 font-medium">
              Preserving Tamil language and culture through modern, interactive learning — making one of the world's oldest living languages accessible to everyone, everywhere.
            </p>
 
            <div className="inline-block px-8 py-5 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-sm mt-10 mb-10">
              <p className="text-2xl md:text-3xl font-bold text-primary tracking-tight">தமிழ் மொழி வாழ்க</p>
              <p className="text-xs text-gray-500 mt-1 italic font-semibold">Long live the Tamil language</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/student/lessons" size="lg">Explore Lessons</Button>
              <Button href="/student/dashboard" variant="secondary" size="lg">Join the Community</Button>
            </div>
          </div>
        </section>

        {/* ── 2. Mission ──────────────────────────────────────────── */}
        <section className="py-24 bg-soft/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30 text-xs font-bold text-primary tracking-tight">
                Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight">Our Mission</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {missionCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-3xl p-10 border border-gray-100 hover:border-primary/20 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">{card.title}</h3>
                  <p className="text-base text-gray-600 leading-relaxed font-medium">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Story ────────────────────────────────────────────── */}
        <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              {/* Text */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30 text-xs font-bold text-primary tracking-tight">
                  Our Story
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight">
                  Born from a Love of Tamil
                </h2>
                <div className="space-y-6 text-gray-700 text-base leading-relaxed font-medium">
                  <p>
                    Mozhi Aruvi was founded by Tamil diaspora members who grew up speaking Tamil at home but had no structured, modern platform to deepen their understanding of the language and its rich cultural roots.
                  </p>
                  <p>
                    What began as a small study group became a full-featured learning platform, built together by language scholars, software engineers, and passionate Tamil educators — all united by a single vision.
                  </p>
                  <p>
                    Today, Mozhi Aruvi serves learners across India, Sri Lanka, Singapore, the UK, Canada, and beyond — bridging the ancient soul of Tamil with the tools of the modern world.
                  </p>
                </div>
              </div>

              {/* Visual Card */}
              <div className="flex-1 w-full max-w-md">
                <div className="relative">
                  <div className="absolute -top-4 -right-4 w-full h-full bg-accent/30-blue rounded-3xl -z-10 rotate-2" />
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 relative z-10">
                    <div className="text-center mb-8">
                      <div className="text-5xl font-bold text-primary mb-2">வா</div>
                      <p className="text-xs text-gray-500 font-medium">Vaa — Come (invitation)</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 bg-soft/10 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl">📖</div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Lesson 1 — Tamil Alphabet</p>
                          <div className="h-1.5 bg-border-color rounded-full mt-2 w-full overflow-hidden">
                            <div className="w-4/5 h-full bg-primary rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-soft/10 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">🎙️</div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Pronunciation Practice</p>
                          <div className="h-1.5 bg-border-color rounded-full mt-2 w-full overflow-hidden">
                            <div className="w-3/5 h-full bg-green-500 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-soft/10 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center text-accent-gold text-xl">⭐</div>
                        <div>
                          <p className="font-bold text-gray-700 text-sm">Quiz — Basic Greetings</p>
                          <div className="h-1.5 bg-border-color rounded-full mt-2 w-full overflow-hidden">
                            <div className="w-2/5 h-full bg-accent-gold rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between px-2">
                      <p className="text-gray-400 text-sm font-medium">Your Progress</p>
                      <p className="text-primary font-bold">62%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Features ─────────────────────────────────────────── */}
        <section className="py-24 bg-soft/10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30-blue text-sm font-semibold text-primary mb-4">
                FEATURES
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-4">
                What Makes Mozhi Aruvi Special
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                We have built every feature around one goal — making Tamil learnable, lovable, and alive.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="text-4xl mb-5 group-hover:scale-110 transition-transform inline-block">
                    {card.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-3">{card.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Community & Culture ───────────────────────────────── */}
        <section id="community" className="py-24 bg-white px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/30-blue text-sm font-semibold text-primary mb-4">
                COMMUNITY &amp; CULTURE
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-700 mb-4">
                Learning Beyond Language
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                At Mozhi Aruvi, we believe learning Tamil means experiencing Tamil culture too.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {events.map((event) => (
                <div
                  key={event.title}
                  className="bg-soft/10 rounded-2xl p-6 border border-gray-100 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group cursor-pointer"
                >
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                    {event.emoji}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700 text-lg leading-tight">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${event.type === "Online" ? "bg-mozhi-light text-primary-dark" : "bg-green-100 text-green-700"}`}>
                      {event.type}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">{event.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Stats ────────────────────────────────────────────── */}
        <section className="py-24 bg-soft/10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-[0.03] text-primary select-none">ழ</div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
                Our Growing Community
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                These numbers represent real learners who are keeping Tamil alive.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all"
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-gray-500 font-semibold text-base md:text-lg">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* ── 8. Final CTA ────────────────────────────────────────── */}
        <section className="py-28 bg-soft/10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto relative z-10 space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-bold text-primary tracking-tight">
              Join us today
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight leading-tight">
              Start Your Tamil Learning Journey
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
              Experience the depth of one of humankind's greatest heritages through fun, interactive paths.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Button href="/auth/signup" size="lg">
                Create Free Account
              </Button>
              <Button href="/student/lessons" variant="secondary" size="lg">
                Explore Lessons
              </Button>
            </div>

            <p className="mt-6 text-sm text-gray-500 font-medium">
              No credit card required. Start learning in under 60 seconds.
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
