import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { BookOpen, Monitor, Globe, Star, Sparkles, Trophy, ArrowRight, Info, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About - Mozhi Aruvi",
  description: "Learn about Mozhi Aruvi — the modern platform for learning Tamil language and culture.",
};

const missionCards = [
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: "Preserve Tamil Heritage",
    description: "Tamil is one of the world's oldest living classical languages. We build tools that help learners connect with 2,000+ years of literary and cultural tradition.",
  },
  {
    icon: <Monitor className="w-8 h-8" />,
    title: "Modern Learning Tools",
    description: "Voice pronunciation practice, gamified quizzes, AI-powered feedback, and one-on-one tutor sessions — learning Tamil has never been this engaging.",
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Global Tamil Community",
    description: "From Tamil Nadu to Toronto, our learners span the globe. Join a vibrant community built on shared love for Tamil language and culture.",
  },
];

const featureCards = [
  { emoji: "📚", title: "Interactive Lessons", description: "Structured lessons covering scripts, grammar, and vocabulary." },
  { emoji: "🎙️", title: "Voice Pronunciation", description: "Practice your pronunciation with real-time phonetics feedback." },
  { emoji: "👩‍🏫", title: "Expert Tamil Tutors", description: "Access 38+ verified Tamil tutors for private sessions." },
  { emoji: "🎮", title: "Gamified Learning", description: "Earn XP, build streaks, and unlock lessons like a game." },
  { emoji: "🎉", title: "Cultural Events", description: "Participate in events celebrating Tamil arts and poetry." },
  { emoji: "🌍", title: "Global Network", description: "Connect with enthusiasts from across the world." },
];

const stats = [
  { value: "1,200+", label: "Active Learners" },
  { value: "50+", label: "Modules" },
  { value: "38", label: "Expert Tutors" },
  { value: "95%", label: "Linguistic Sync" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans scroll-smooth">
      <Navbar />

      <main className="flex-1">
        {/* ── 1. Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-white pt-24 pb-32 px-4 sm:px-6 lg:px-8 border-b border-border/40">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] text-[25rem] font-black text-primary select-none leading-none">
              த
            </div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Our Collective Story
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-text-primary tracking-tighter leading-none">
                About <br /><span className="text-primary italic">Mozhi Aruvi</span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium italic">
                Bridging the ancient geometry of Tamil with the power of modern neural learning.
              </p>
            </div>

            <div className="inline-block px-10 py-6 rounded-[2.5rem] bg-surface-soft border border-border shadow-inner mt-12 mb-12 transform hover:scale-105 transition-transform">
              <p className="text-3xl md:text-5xl font-black text-primary tracking-tight">தமிழ் மொழி வாழ்க</p>
              <p className="text-[10px] text-text-tertiary mt-2 uppercase font-black tracking-[0.3em]">Resonance of the Eternal Language</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button href="/student/lessons" size="xl" className="px-12 shadow-2xl shadow-primary/20">Explore Lessons</Button>
              <Button href="/student/dashboard" variant="outline" size="xl" className="px-12">Join Movement</Button>
            </div>
          </div>
        </section>

        {/* ── 2. Mission ──────────────────────────────────────────── */}
        <section className="py-32 bg-surface-soft/40 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
                Mission Directive
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-text-primary tracking-tight">The Core Mandate</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {missionCards.map((card) => (
                <Card
                  key={card.title}
                  variant="elevated"
                  padding="lg"
                  className="group hover:border-primary/20"
                >
                  <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                    {card.icon}
                  </div>
                  <h3 className="text-2xl font-black text-text-primary mb-4 tracking-tight uppercase">{card.title}</h3>
                  <p className="text-lg text-text-secondary leading-relaxed font-medium italic">{card.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. Story ────────────────────────────────────────────── */}
        <section className="py-32 bg-white px-4 sm:px-6 lg:px-8 border-y border-border/40">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-24 items-center">
              <div className="flex-1 space-y-10">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-secondary">
                    Conceptual Genesis
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight leading-tight">
                    Born from a <br /> <span className="text-primary">Linguistic Hunger</span>
                  </h2>
                </div>
                
                <div className="space-y-8 text-text-secondary text-lg leading-relaxed font-medium italic">
                  <p className="border-l-4 border-primary/20 pl-8">
                    Mozhi Aruvi was born from the realization that while Tamil is immortal, our methods of transmitting its soul were becoming fragmented in the digital age.
                  </p>
                  <p className="pl-8">
                    Founded by educators and engineers in the diaspora, we sought to build a bridge between the 2,000-year-old Sangam literary tradition and the neuro-educational tools of the 21st century.
                  </p>
                  <p className="pl-8">
                    Today, we serve a global frequency of learners from Chennai to Chicago, all united by the same vibrations of the "oldest living classical language."
                  </p>
                </div>
                
                <div className="pt-6">
                   <Button href="/auth/signup" variant="primary" size="lg" className="rounded-2xl">Start Your History <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex-1 w-full max-w-xl animate-in fade-in slide-in-from-right-10 duration-1000">
                <Card variant="elevated" padding="none" className="h-[520px] relative border-none bg-primary shadow-primary/20 group">
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                   <div className="p-10 flex flex-col items-center justify-center h-full text-center space-y-10">
                      <div className="h-40 w-40 rounded-[3rem] bg-white flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
                         <span className="text-8xl font-black text-primary">வா</span>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50">VAA — EVOKE / COME</p>
                        <h4 className="text-3xl font-black text-white tracking-widest uppercase">The Invitation</h4>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full max-w-sm">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase text-white/70">Sync Rate</span>
                            <span className="text-xl font-black text-white">88%</span>
                         </div>
                         <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                            <div className="w-[88%] h-full bg-white animate-pulse" />
                         </div>
                      </div>
                   </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Features ─────────────────────────────────────────── */}
        <section className="py-32 bg-surface-soft/40 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary underline underline-offset-8">
                System Capabilities
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tight">
                Linguistic Infrastructure
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {featureCards.map((card) => (
                <Card
                  key={card.title}
                  variant="shadow"
                  padding="lg"
                  className="group hover:bg-primary/5 transition-all duration-500 border-border/40"
                >
                  <div className="text-5xl mb-8 group-hover:scale-125 transition-transform duration-500 inline-block drop-shadow-sm">
                    {card.emoji}
                  </div>
                  <h3 className="text-xl font-black text-text-primary mb-4 uppercase tracking-tight">{card.title}</h3>
                  <p className="text-text-secondary font-medium leading-relaxed italic">{card.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. Stats ────────────────────────────────────────────── */}
        <section className="py-32 bg-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="max-w-7xl mx-auto relative z-10 space-y-20">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-6xl md:text-7xl font-black text-primary mb-4 tracking-tighter group-hover:scale-110 transition-transform duration-500">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{stat.label}</div>
                  <div className="h-1 w-12 bg-primary/20 mx-auto mt-6 rounded-full group-hover:w-24 transition-all duration-700" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. Final CTA ────────────────────────────────────────── */}
        <section className="py-40 bg-primary/5 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-border/40">
           <div className="absolute inset-0 pointer-events-none opacity-30">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[200px]" />
           </div>

          <div className="max-w-4xl mx-auto relative z-10 space-y-12 text-center animate-in zoom-in-95 duration-1000">
            <div className="flex justify-center">
               <div className="h-20 w-20 rounded-[2rem] bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 group hover:rotate-12 transition-transform duration-500 focus-within:ring-4 focus-within:ring-primary/40">
                  <Heart className="w-10 h-10 fill-current" />
               </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl md:text-7xl font-black text-text-primary tracking-tighter leading-tight uppercase">
                 Join the <span className="text-primary italic">Ancestral Resonance</span>
              </h2>
              <p className="text-xl md:text-2xl text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium italic">
                Secure your place in the continuum of the world's oldest living language. Start your free sync today.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8 px-4">
              <Button href="/auth/signup" size="xl" className="w-full sm:w-auto h-20 px-16 shadow-3xl shadow-primary/30 text-lg">Initialize Account</Button>
              <Button href="/student/lessons" variant="outline" size="xl" className="w-full sm:w-auto h-20 px-16 text-lg">View Archives</Button>
            </div>

            <p className="pt-10 text-[10px] font-black text-text-tertiary uppercase tracking-[0.5em] animate-pulse">
               Synchronized Protocol Established • End-to-End Encryption Enabled
            </p>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
