import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-soft-bg pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
        <div className="w-[600px] h-[600px] rounded-full bg-light-blue/50 blur-3xl opacity-60"></div>
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
        <div className="w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm text-sm font-medium text-primary-dark mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          One of the oldest living languages — Over 2000 years of heritage
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-accent-text tracking-tight mb-4">
          <span className="block text-primary mb-2">வாழ்க தமிழ் வளர்க கலை</span>
          <span className="block text-3xl md:text-5xl mt-4 text-slate-800">Long Live Tamil, Flourish the Arts</span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          Tamil is a classical language spoken by over 80 million people worldwide. 
          Join us in preserving and celebrating this beautiful language through interactive lessons, 
          expert tutors, and a vibrant community.
        </p>

        {/* Quote Section */}
        <div className="mt-10 max-w-lg mx-auto p-6 bg-white/70 rounded-2xl border border-border-color shadow-sm backdrop-blur">
          <p className="text-xl md:text-2xl font-bold text-primary mb-2">"யாதும் ஊரே யாவரும் கேளிர்"</p>
          <p className="text-md text-accent-text italic mb-2">"To us all towns are one, all men our kin."</p>
          <p className="text-sm text-muted">— Kaniyan Pungundranar, Purananuru</p>
        </div>

        <div className="mt-12">
          <p className="text-lg font-medium text-accent-text mb-6">
            Ready to Begin Your Tamil Journey?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/auth/signup"
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-primary text-white hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Create Free Account <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link 
              href="#lessons" 
              className="px-8 py-4 text-lg font-semibold rounded-xl bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-light-blue/30 transition-all shadow-sm flex items-center justify-center"
            >
              Learn Today
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-muted">
            No credit card required. Start learning in under 60 seconds.
          </p>
        </div>

      </div>
    </section>
  );
}
