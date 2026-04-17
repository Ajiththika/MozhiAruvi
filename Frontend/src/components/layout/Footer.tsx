import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50/50 py-4 md:py-6 border-t border-slate-200 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 text-center md:text-left items-start">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3 flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/" className="inline-flex items-center transition-opacity">
              <div className="relative w-60 h-16 md:w-60 md:h-16">
                <Image
                  src="/logo.png"
                  alt="Mozhi Aruvi"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 240px, 240px"
                />
              </div>
            </Link>
            
            <p className="text-slate-600 max-w-md text-sm leading-relaxed font-semibold">
              The modern platform for learning Tamil language and culture. 
              Bridging the gap between ancient heritage and modern technology.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center gap-3 text-slate-800 font-bold group">
                <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-[10px] md:text-xs group-hover:text-primary transition-colors">mozhiaruvi5@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-800 font-bold group">
                <div className="h-8 w-8 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <span className="text-[10px] md:text-xs group-hover:text-secondary transition-colors">0717441977</span>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Explore Premium
              </Link>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-3">
            <h4 className="font-black text-primary text-[10px] tracking-widest uppercase">Learn Portal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/lessons" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold">
                  Interactive Lessons
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold">
                  Find Teachers
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-3">
            <h4 className="font-black text-primary text-[10px] tracking-widest uppercase">Ecosystem</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold">
                  Latest Events
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="text-slate-600 hover:text-primary transition-colors text-sm font-bold">
                  Culture Blog
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-4 border-t border-slate-100 gap-6">
          {/* Copyright */}
          <p className="text-[9px] md:text-[10px] text-primary/80 font-black uppercase tracking-widest text-center md:text-left">
            &copy; 2026 Mozhi Aruvi. Heritage of Excellence.
          </p>

          {/* Proverb */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-white rounded-2xl border border-slate-100/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500 shadow-sm border border-slate-100 shrink-0">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
               </svg>
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-primary uppercase tracking-tight leading-none mb-1">"அறிவே ஆற்றல்"</div>
              <div className="text-[9px] text-primary/60 font-bold uppercase tracking-widest leading-none">"Knowledge is power"</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
