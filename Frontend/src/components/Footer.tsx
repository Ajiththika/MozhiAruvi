import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 py-10 md:py-14 border-t border-slate-200 px-4 md:px-8 lg:px-12 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="text-3xl font-bold text-primary flex items-center gap-2 mb-4 tracking-tight">
              <span className="text-secondary tracking-tight">Mozhi</span>Aruvi
            </Link>
            <p className="text-slate-700 dark:text-slate-400 max-w-sm text-base leading-relaxed font-medium">
              The modern platform for learning Tamil language and culture. We connect learners with expert tutors and interactive heritage resources.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-sm tracking-tight uppercase">Learn</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/student/lessons" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-base font-medium">
                  Interactive Lessons
                </Link>
              </li>
              <li>
                <Link href="#tutors" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-base font-medium">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-base font-medium">
                  Premium Pass
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-sm tracking-tight uppercase">Community</h4>
            <ul className="space-y-4">
              <li>
                <Link href="#events" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-base font-medium">
                  Latest Events
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-base font-medium">
                  Our Story
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
          {/* Copyright */}
          <p className="text-sm text-slate-500 mb-4 md:mb-0">
            &copy; 2026 Mozhi Aruvi. All rights reserved.
          </p>

          {/* Proverb */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <div className="text-right">
              <div className="text-sm font-bold text-primary">"அறிவே ஆற்றல்"</div>
              <div className="text-xs text-slate-500 italic">"Knowledge is power"</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
