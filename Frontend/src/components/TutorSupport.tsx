"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import Button from "./common/Button";

export default function TutorSupport() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <section id="tutors" className="section-spacing bg-white overflow-hidden">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
          
          {/* Left Column (Text) */}
          <div className="flex-1 w-full relative z-10 space-y-10">
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-12 rounded-full bg-primary" />
              <label>Tutor Support</label>
            </div>
            <h1>
              Stuck on a Lesson? <br/> Ask a Tutor.
            </h1>
            <p className="text-lg md:text-xl leading-relaxed">
              When lessons get tough, don't struggle alone. Send a question directly to an expert Tamil tutor from within any lesson. Need deeper help? Book a private one-on-one class for personalized guidance.
            </p>

            <ul className="space-y-6">
              {[
                "Ask quick questions for free with your credits",
                "Book private tutoring sessions (premium)",
                "Tutors accept and answer within 24 hours",
                "Choose from 38+ verified Tamil experts"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-700 font-bold italic tracking-tight">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-6">
              <Button 
                onClick={() => {
                  const target = "/student/tutors";
                  if (!user) {
                    router.push(`/auth/signin?redirect=${encodeURIComponent(target)}`);
                  } else {
                    router.push(target);
                  }
                }}
                variant="primary"
                size="xl"
                className="w-full sm:w-auto"
              >
                Explore Tutors
              </Button>
            </div>
          </div>

          {/* Right Column (Mock UI) */}
          <div className="flex-1 w-full max-w-xl relative">
            <div className="absolute top-12 -left-12 w-full h-full bg-primary/5 rounded-[2rem] -z-10 rotate-3 transition-transform duration-1000 group-hover:rotate-6"></div>
            
            <div className="card-premium overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/50">
              <div className="bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400 shadow-inner"></div>
                </div>
                <label className="text-slate-400">Tutor support</label>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                
                {/* Student Question */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-end px-2">
                    <label className="text-slate-400">Student Question</label>
                  </div>
                  <div className="bg-primary/5 border border-primary/20 rounded-[1.5rem] rounded-tr-none p-6 text-slate-900 shadow-sm ml-12 relative animate-in fade-in slide-in-from-right-4 duration-700">
                    <p className="font-bold italic text-lg leading-relaxed">"How do I pronounce the 'zh' (ழ) sound in Tamil? I keep getting it wrong. Any tips?"</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center">
                   <div className="px-5 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm italic">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Karthik R. is typing...
                   </div>
                </div>

                {/* Tutor Answer */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 px-2">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xl ring-4 ring-white">KR</div>
                    <label className="text-slate-400">Tutor Response</label>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] rounded-tl-none p-6 text-slate-700 shadow-sm relative mr-12 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                    <p className="leading-relaxed font-medium">
                      "The 'zh' (ழ) sound is unique. Place your tongue curled back toward the roof of your mouth, without touching it, and push air out firmly. Try 'Azhagu' slowly. I'll send an audio clip to help!"
                    </p>

                    {/* Audio clip preview mock */}
                    <div className="mt-8 flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/80 transition-all shadow-lg hover:scale-105 active:scale-95">
                        <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <div className="flex-1 space-y-2">
                        <div className="h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                           <div className="w-1/3 h-full bg-primary rounded-full shadow-[0_0_8px_rgba(42,87,148,0.4)]"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 tracking-tighter uppercase leading-none">
                          <span>0:04</span>
                          <span>0:12</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

