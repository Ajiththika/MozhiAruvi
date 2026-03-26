import React from "react";
import Button from "@/components/ui/Button";

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
      "top-[-20px] left-[-10px] text-[160px] text-secondary opacity-[0.4] -rotate-12",
  },
  {
    char: "ழ",
    className:
      "bottom-[10px] left-[20px] text-[140px] text-primary opacity-[0.3] rotate-6",
  },
  {
    char: "ம்",
    className:
      "top-[35%] left-[20px] text-[120px] text-gray-300 opacity-[0.5] rotate-3",
  },

  // ── Right column ─────────────────────────────
  {
    char: "ஞ",
    className:
      "top-[5%] right-[-10px] text-[160px] text-secondary opacity-[0.4] rotate-12",
  },
  {
    char: "க",
    className:
      "bottom-[20px] right-[10px] text-[150px] text-gray-300 opacity-[0.3] -rotate-6",
  },
  {
    char: "வ",
    className:
      "top-[42%] right-[-20px] text-[130px] text-primary opacity-[0.4] -rotate-3",
  },

  // ── Subtle center-spread accents ─────────────
  {
    char: "ண",
    className:
      "top-[15%] left-[8%] text-[90px] text-accent opacity-[0.5] rotate-6",
  },
  {
    char: "ற",
    className:
      "bottom-[15%] right-[8%] text-[90px] text-accent opacity-[0.5] -rotate-6",
  },

  // ── Additional decorative fillers ────────────
  {
    char: "ல",
    className:
      "top-[60%] left-[8%] text-[130px] md:text-[150px] text-secondary opacity-[0.5] -rotate-12",
  },
  {
    char: "ஃ",
    className:
      "top-[25%] right-[15%] text-[110px] md:text-[130px] text-accent opacity-[1] rotate-6",
  },
  {
    char: "ய",
    className:
      "bottom-[30%] right-[8%] text-[140px] md:text-[160px] text-gray-300 opacity-[0.5] rotate-12",
  },
] as const;

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white py-10 md:py-14 px-4 md:px-8 lg:px-12">

      {/* ── Ambient gradient blobs (existing) ── */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-accent/30 blur-3xl opacity-60" />
      </div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 pointer-events-none">
        <div className="w-[400px] h-[400px] rounded-full bg-soft/20 blur-3xl opacity-50" />
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white/60 backdrop-blur-sm text-sm font-semibold text-gray-800 mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          One of the oldest living languages - Over 2000 years of heritage
        </div>

        {/* Headline */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight leading-tight">
            <span className="block text-primary">வாழ்க தமிழ் வளர்க கலை</span>
            <span className="block text-2xl md:text-3xl mt-4 text-gray-800">
              Long Live Tamil Flourish the Arts
            </span>
          </h1>
        </div>

        {/* Description */}
        <p className="mt-8 text-base text-gray-600 max-w-xl mx-auto leading-relaxed font-medium">
          Join us in preserving and celebrating this beautiful
          language through interactive lessons, expert tutors, and a vibrant
          community.
        </p>

        {/* Tamil quote card */}
        <div className="mt-12 max-w-xl mx-auto p-8 bg-white/70 rounded-3xl border border-gray-100 shadow-md backdrop-blur">
          <p className="text-lg font-bold text-primary mb-3">
            &ldquo;யாதும் ஊரே யாவரும் கேளிர்&rdquo;
          </p>
          <p className="text-base text-gray-700 italic mb-3 leading-relaxed font-bold">
            &ldquo;To us all towns are one, all men our kin.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-gray-500 font-bold border-t border-gray-50 pt-4 tracking-tight">
            - Kaniyan Pungundranar, Purananuru
          </div>
        </div>

        {/* CTA buttons */}
        <div className="mt-12">
          <p className="text-sm font-semibold text-gray-800 mb-6">
            Ready to Begin Your Tamil Journey?
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              href="/auth/signup"
              variant="primary"
              size="lg"
              className="px-8 flex items-center justify-center gap-2"
            >
              Create Free Account <span aria-hidden="true">&rarr;</span>
            </Button>
            <Button
              href="/lessons"
              variant="secondary"
              size="lg"
              className="px-8 flex items-center justify-center"
            >
              Learn Today
            </Button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            No credit card required. Start learning in under 60 seconds.
          </p>
        </div>

      </div>
    </section>
  );
}

