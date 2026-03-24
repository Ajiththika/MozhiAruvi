import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 py-20 border-t border-slate-100">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="text-4xl font-black text-slate-900 flex items-center gap-3 tracking-tighter hover:scale-105 transition-transform origin-left">
              <span className="text-primary italic">Mozhi</span>Aruvi
            </Link>
            <p className="max-w-md text-lg">
              The modern platform for learning Tamil language and culture. We connect learners with expert tutors and interactive heritage resources.
            </p>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-8">
            <label className="text-slate-400">Learn</label>
            <ul className="space-y-6">
              {[
                { name: "Interactive Lessons", href: "/student/lessons" },
                { name: "Find Tutors", href: "#tutors" },
                { name: "Premium Pass", href: "/auth/signup" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-900 hover:text-primary transition-all font-bold italic tracking-tight flex items-center gap-2 group">
                    <span className="w-0 h-1 bg-primary group-hover:w-4 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-8">
            <label className="text-slate-400">Community</label>
            <ul className="space-y-6">
              {[
                { name: "Latest Events", href: "#events" },
                { name: "Our Story", href: "/about" },
                { name: "Contact Us", href: "/contact" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-900 hover:text-primary transition-all font-bold italic tracking-tight flex items-center gap-2 group">
                    <span className="w-0 h-1 bg-primary group-hover:w-4 transition-all"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-200/50 gap-8">
          {/* Copyright */}
          <p className="text-sm font-bold text-slate-400 tracking-widest uppercase italic">
            &copy; 2026 Mozhi Aruvi. All rights reserved.
          </p>

          {/* Proverb */}
          <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-full shadow-sm border border-slate-100">
            <svg className="w-6 h-6 text-primary animate-bounce" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <div className="text-right">
              <div className="text-lg font-black text-slate-900 leading-none mb-1 tracking-tighter">"அறிவே ஆற்றல்"</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none italic">"Knowledge is power"</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

