import React from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   Decorative Tamil letter configuration.
   Each letter is placed with absolute positioning
   and is fully hidden on mobile (hidden md:block).
   aria-hidden="true" keeps them invisible to screen readers.
───────────────────────────────────────────── */
const tamilDecorations = [
  // ── Left column ──────────────────────────────
  {
    char: "அ",
    className:
      "top-[-20px] left-[-10px] text-[160px] text-mozhi-secondary opacity-[0.7] -rotate-12",
  },
  {
    char: "ழ",
    className:
      "bottom-[10px] left-[20px] text-[140px] text-blue-300 opacity-[0.6] rotate-6",
  },
  {
    char: "ம்",
    className:
      "top-[35%] left-[20px] text-[120px] text-slate-300 opacity-[0.8] rotate-3",
  },

  // ── Right column ─────────────────────────────
  {
    char: "ஞ",
    className:
      "top-[5%] right-[-10px] text-[160px] text-mozhi-secondary opacity-[0.7] rotate-12",
  },
  {
    char: "க",
    className:
      "bottom-[20px] right-[10px] text-[150px] text-slate-300 opacity-[0.5] -rotate-6",
  },
  {
    char: "வ",
    className:
      "top-[42%] right-[-20px] text-[130px] text-blue-300 opacity-[0.8] -rotate-3",
  },

  // ── Subtle center-spread accents ─────────────
  {
    char: "ண",
    className:
      "top-[15%] left-[8%] text-[90px] text-blue-200 opacity-[0.5] rotate-6",
  },
  {
    char: "ற",
    className:
      "bottom-[15%] right-[8%] text-[90px] text-blue-200 opacity-[0.5] -rotate-6",
  },

  // ── Additional decorative fillers ────────────
  {
    char: "ல",
    className:
      "top-[60%] left-[8%] text-[130px] md:text-[150px] text-blue-300 opacity-[0.5] -rotate-12",
  },
  {
    char: "ஃ",
    className:
      "top-[25%] right-[15%] text-[110px] md:text-[130px] text-blue-200 opacity-[1] rotate-6",
  },
  {
    char: "ய",
    className:
      "bottom-[30%] right-[8%] text-[140px] md:text-[160px] text-slate-300 opacity-[0.5] rotate-12",
  },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-soft-bg pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8">

      {/* ── Ambient gradient blobs (existing) ── */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-light-blue/50 blur-3xl opacity-60" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-primary/10 blur-3xl opacity-50" />
      </div>

      {/* ── Tamil decorative watermark letters ── */}
      {tamilDecorations.map(({ char, className }) => (
        <span
          key={`${char}-${className.slice(0, 12)}`}
          aria-hidden="true"
          className={[
            // Hidden on mobile, visible from md breakpoint
            "hidden md:block",
            // Shared base styles
            "absolute z-0 select-none pointer-events-none",
            "font-bold leading-none tracking-wide",
            "blur-[1px]",
            // Per-letter positional / visual styles
            className,
          ].join(" ")}
        >
          {char}
        </span>
      ))}

      {/* ── Hero content ── z-10 keeps it in front of decorations ── */}
      <div className="max-w-4xl mx-auto relative z-10 text-center">

        {/* Heritage pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm text-sm font-medium text-primary-dark mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          One of the oldest living languages — Over 2000 years of heritage
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-accent-text tracking-tight mb-4">
          <span className="block text-primary mb-2">வாழ்க தமிழ் வளர்க கலை</span>
          <span className="block text-3xl md:text-5xl mt-4 text-slate-800">
            Long Live Tamil, Flourish the Arts
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
          Tamil is a classical language spoken by over 80 million people
          worldwide. Join us in preserving and celebrating this beautiful
          language through interactive lessons, expert tutors, and a vibrant
          community.
        </p>

        {/* Tamil quote card */}
        <div className="mt-10 max-w-lg mx-auto p-6 bg-white/70 rounded-2xl border border-border-color shadow-sm backdrop-blur">
          <p className="text-xl md:text-2xl font-bold text-primary mb-2">
            &ldquo;யாதும் ஊரே யாவரும் கேளிர்&rdquo;
          </p>
          <p className="text-md text-accent-text italic mb-2">
            &ldquo;To us all towns are one, all men our kin.&rdquo;
          </p>
          <p className="text-sm text-muted">— Kaniyan Pungundranar, Purananuru</p>
        </div>

        {/* CTA buttons */}
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
              href="/student/lessons"
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
