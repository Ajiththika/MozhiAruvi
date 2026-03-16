import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-soft-bg pt-16 pb-8 border-t border-border-color px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2 mb-4">
              <span className="text-secondary">Mozhi</span>Aruvi
            </Link>
            <p className="text-muted max-w-sm">
              The modern platform for learning Tamil language and culture. We connect learners with expert tutors and interactive resources.
            </p>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-accent-text mb-4 uppercase text-sm tracking-wider">Learn</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#lessons" className="text-muted hover:text-primary transition-colors text-sm font-medium">
                  Lessons
                </Link>
              </li>
              <li>
                <Link href="#tutors" className="text-muted hover:text-primary transition-colors text-sm font-medium">
                  Find Tutors
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-muted hover:text-primary transition-colors text-sm font-medium">
                  Go Premium
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-accent-text mb-4 uppercase text-sm tracking-wider">Community</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#events" className="text-muted hover:text-primary transition-colors text-sm font-medium">
                  Events
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border-color">
          {/* Copyright */}
          <p className="text-sm text-slate-500 mb-4 md:mb-0">
            &copy; 2026 Mozhi Aruvi. All rights reserved.
          </p>

          {/* Proverb */}
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-accent-gold" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <div className="text-right">
              <div className="text-sm font-bold text-primary">"அறிவே ஆற்றல்"</div>
              <div className="text-xs text-muted italic">"Knowledge is power"</div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
