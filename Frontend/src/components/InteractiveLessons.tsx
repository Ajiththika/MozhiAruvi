import React from "react";
import Link from "next/link";

export default function InteractiveLessons() {
  return (
    <section id="lessons" className="py-10 md:py-14 bg-slate-50 px-4 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Column */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light text-xs font-bold text-primary tracking-tight">
              Interactive lessons
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              Every Lesson Has Voice Practice
            </h2>
            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">
              Each lesson includes listening exercises, pronunciation practice where you speak the words, quizzes, and progression. Level up as you learn.
            </p>

            <ul className="mb-10 space-y-4">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-accent-text font-medium">Smart pronunciation tools in every lesson</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-accent-text font-medium">Listen to native speaker audio</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-accent-text font-medium">Game-style quizzes with rewards</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-accent-text font-medium">Ask a tutor when you're stuck</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-primary mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-accent-text font-medium">50 free credits to get started</span>
              </li>
            </ul>

            <Link 
              href="/auth/signup" 
              className="mt-4 md:mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
            >
              Go to Lessons <span>&rarr;</span>
            </Link>
          </div>

          {/* Right Column (Mock UI Card) */}
          <div className="flex-1 w-full max-w-lg lg:scale-105">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="text-xs font-bold text-slate-500 tracking-tight mb-6">
                Pronunciation practice
              </div>

              <div className="text-center mb-8">
                <h3 className="text-5xl md:text-6xl font-bold text-primary mb-4 drop-shadow-sm">வணக்கம்</h3>
                <p className="text-xl font-medium text-accent-text">Vannakkam — Hello</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1 h-2.5 rounded-full bg-soft-bg overflow-hidden border border-border-color/50">
                    <div className="h-full bg-primary rounded-full w-[75%]"></div>
                  </div>
                  <span className="text-sm font-bold text-muted">75%</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Practice Block 1 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-light-blue/20 border border-primary/20 hover:bg-light-blue/40 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.686 2 6 4.686 6 8v5H4v4h2v1c0 1.103.897 2 2 2h2v-2H8v-1h4v1.5a2.5 2.5 0 01-5 0h-2a4.5 4.5 0 009 0V8c0-2.206-1.794-4-4-4z"/><path d="M16 13h2v4h-2zM16 8c0-2.206-1.794-4-4-4v2c1.103 0 2 .897 2 2v5h-2v4h2c1.103 0 2-.897 2-2v-1h2v-4h-2V8z"/></svg>
                    </div>
                    <div>
                      <div className="font-bold text-accent-text">Listen & Repeat</div>
                      <div className="text-sm text-muted">Hear the word, then say it aloud</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                  </div>
                </div>

                {/* Practice Block 2 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border-color hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-soft-bg flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-accent-text">Spell It Out</div>
                      <div className="text-sm text-muted">Practice spelling each letter</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-border-color"></div>
                </div>

                {/* Practice Block 3 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-border-color hover:border-primary/50 transition-colors cursor-pointer group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-soft-bg flex items-center justify-center text-muted group-hover:text-primary transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                    </div>
                    <div>
                      <div className="font-bold text-accent-text">Quiz Time</div>
                      <div className="text-sm text-muted">Test your knowledge</div>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-border-color"></div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
