import React from 'react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* Left Side: Form Container */}
      <div className="w-full md:w-1/2 flex flex-col relative z-10 order-1 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Simple Top Nav */}
        <div className="p-6 md:p-8 lg:px-12 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-secondary">Mozhi</span>Aruvi
          </Link>
        </div>
        
        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-8 lg:py-12 relative">
          {children}
        </div>
      </div>

      {/* Right Side: Branding visual */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-soft/50 via-white to-accent/30 flex flex-col justify-center relative overflow-hidden order-2 hidden md:flex border-l border-gray-100">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-black text-[12rem] text-primary transform rotate-12 select-none pointer-events-none">அ</div>
        <div className="absolute bottom-10 left-10 p-12 opacity-[0.04] font-black text-[15rem] text-primary transform -rotate-12 select-none pointer-events-none">ழ</div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto px-8 lg:px-16 text-center">
          
          <div className="inline-flex items-center justify-center p-4 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-xl mb-14 border border-white/60 group relative hover:-translate-y-1 transition-transform duration-500">
             <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg group-hover:rotate-[-5deg] transition-transform duration-300">
              த
            </div>
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-white text-4xl font-black -ml-6 shadow-md group-hover:-translate-y-2 transition-transform duration-300 delay-75">
              மி
            </div>
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center text-primary text-4xl font-black -ml-6 shadow-sm group-hover:rotate-[5deg] transition-transform duration-300 delay-150 border border-primary/10">
              ழ்
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-800 tracking-tight mb-6">
            தமிழ் கற்கும் பயணம்
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 font-medium leading-relaxed max-w-lg mx-auto">
            Discover the beauty of one of the world's oldest living languages.
          </p>
          
          <div className="mt-16 flex items-center justify-center gap-6 p-6 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/50 max-w-sm mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow cursor-default">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full border-2 border-white bg-[#E0E7FF] flex items-center justify-center font-bold text-[#3730A3] shadow-sm">K</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-[#DCFCE7] flex items-center justify-center font-bold text-[#166534] shadow-sm">M</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-[#FCE7F3] flex items-center justify-center font-bold text-[#9D174D] shadow-sm">S</div>
              <div className="w-12 h-12 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">+1k</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5 text-accent-gold">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm font-bold text-gray-700 mt-1">Join 1,200+ learners</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
