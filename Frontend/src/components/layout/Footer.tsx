import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-50/50 py-8 md:py-10 border-t border-slate-200 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-90 transition-opacity">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <Image
                  src="/logo.png"
                  alt="Mozhi Aruvi Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl md:text-2xl font-black text-primary tracking-tighter flex items-center gap-1">
                Mozhi<span className="text-secondary">Aruvi</span>
              </span>
            </Link>
            
            <p className="text-slate-800 max-w-xl text-sm leading-relaxed font-bold">
              The modern platform for learning Tamil language and culture. 
              Bridging the gap between ancient heritage and modern technology.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-slate-800 font-bold group">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] group-hover:text-primary transition-colors">mozhiaruvi5@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold group">
                <div className="h-7 w-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shrink-0">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] group-hover:text-secondary transition-colors">0717441977</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold group">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-[10px] group-hover:text-primary transition-colors">Jaffna, Srilanaka</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Explore Premium
              </Link>
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="md:ml-auto">
            <h4 className="font-black text-primary mb-5 text-[10px] tracking-widest uppercase">Learn Portal</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/lessons" className="text-slate-800 hover:text-primary transition-colors text-xs font-bold">
                  Interactive Lessons
                </Link>
              </li>
              <li>
                <Link href="/tutors" className="text-slate-800 hover:text-primary transition-colors text-xs font-bold">
                  Find Teachers
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="md:ml-auto">
            <h4 className="font-black text-primary mb-5 text-[10px] tracking-widest uppercase">Ecosystem</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/events" className="text-slate-800 hover:text-primary transition-colors text-xs font-bold">
                  Latest Events
                </Link>
              </li>
              <li>
                 <Link href="/blogs" className="text-slate-800 hover:text-primary transition-colors text-xs font-bold">
                   Culture Blog
                 </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-200">
          {/* Copyright */}
          <p className="text-[10px] text-primary/80 font-black uppercase tracking-widest mb-4 md:mb-0">
            &copy; 2026 Mozhi Aruvi. Heritage of Excellence.
          </p>

          {/* Proverb */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-amber-500 shadow-sm border border-slate-100 shrink-0">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                 <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
               </svg>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-primary uppercase tracking-tight leading-none">"அறிவே ஆற்றல்"</div>
              <div className="text-[8px] text-primary/60 font-bold">"Knowledge is power"</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
