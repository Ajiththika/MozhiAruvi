"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function TutorSupport() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <section id="tutors" className="py-10 md:py-14 bg-white px-4 md:px-8 lg:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row-reverse gap-16 items-center">
          
          {/* Right Column (Text for flex-row-reverse, so it appears on right in code, left visually) wait, flex-row-reverse means first item goes right. So text is Left visually. Let's not use row-reverse to avoid confusion. */}
          
          {/* Left Column (Text) */}
          <div className="flex-1 w-full relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light text-xs font-bold text-primary tracking-tight">
              Tutor support
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Stuck on a Lesson? <br/> Ask a Tutor.
            </h2>
            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
              When lessons get tough, don't struggle alone. Send a question directly to an expert Tamil tutor from within any lesson. Need deeper help? Book a private one-on-one class for personalized guidance.
            </p>

            <ul className="mb-10 space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-accent-text font-medium">Ask quick questions for free with your credits</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-accent-text font-medium">Book private tutoring sessions (premium)</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-accent-text font-medium">Tutors accept and answer within 24 hours</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-accent-text font-medium">Choose from 38+ verified Tamil experts</span>
              </li>
            </ul>

            <button 
              onClick={() => {
                const target = "/student/tutors";
                if (!user) {
                  router.push(`/auth/signin?redirect=${encodeURIComponent(target)}`);
                } else {
                  router.push(target);
                }
              }}
              className="mt-4 md:mt-8 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all font-semibold shadow-xl shadow-primary/20 w-full sm:w-auto"
            >
              Explore Tutors
            </button>
          </div>

          {/* Right Column (Mock UI) */}
          <div className="flex-1 w-full max-w-lg relative lg:scale-105">
            <div className="absolute top-10 -left-10 w-full h-full bg-light-blue/20 rounded-2xl -z-10 rotate-3"></div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-soft-bg border-b border-border-color p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="text-xs font-bold text-slate-500 tracking-tight">Tutor support</div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Student Question */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 tracking-tight pl-1">Question</div>
                  <div className="bg-light-blue/30 border border-primary/10 rounded-2xl rounded-tr-none p-4 text-accent-text shadow-sm ml-8 relative">
                    <p className="font-medium text-[15px]">"How do I pronounce the 'zh' (ழ) sound in Tamil? I keep getting it wrong. Any tips?"</p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-center -my-2">
                   <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                     Accepted by Karthik R.
                   </div>
                </div>

                {/* Tutor Answer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-white">KR</div>
                    <div className="text-xs font-bold text-slate-500 tracking-tight">Tutor answer</div>
                  </div>
                  <div className="bg-white border border-border-color rounded-2xl rounded-tl-none p-4 text-accent-text shadow-sm relative mr-8">
                    <p className="text-[15px] leading-relaxed">
                      "The 'zh' (ழ) sound is unique to Tamil. Place your tongue curled back toward the roof of your mouth, without touching it, and push air out firmly. Try saying 'Azhagu' slowly. I'll send an audio clip to help!"
                    </p>
                  </div>
                </div>

                {/* Audio clip preview mock */}
                <div className="flex items-center gap-3 p-3 bg-soft-bg rounded-xl border border-border-color mr-8">
                  <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary-dark transition-colors">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                  <div className="flex-1">
                    <div className="h-1.5 bg-border-color rounded-full w-full overflow-hidden">
                       <div className="w-1/3 h-full bg-primary rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-muted">0:12</div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
