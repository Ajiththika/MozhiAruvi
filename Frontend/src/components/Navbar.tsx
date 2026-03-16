import Link from "next/link";
import React from "react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary flex items-center gap-2">
              <span className="text-secondary">Mozhi</span>Aruvi
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#lessons" className="text-muted hover:text-primary transition-colors font-medium">
              Lessons
            </Link>
            <Link href="#tutors" className="text-muted hover:text-primary transition-colors font-medium">
              Tutors
            </Link>
            <Link href="/events" className="text-muted hover:text-primary transition-colors font-medium">
              Events
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 rounded-lg text-primary font-medium hover:bg-light-blue transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
