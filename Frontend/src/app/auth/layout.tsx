import React from "react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-background">
      {/* Left Side: Form Container */}
      <div className="w-full md:w-1/2 flex flex-col relative z-10 order-1 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-border/40">
        {/* Simple Top Nav */}
        <div className="p-6 md:p-8 lg:px-12 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-primary italic">Mozhi</span>Aruvi
          </Link>
        </div>
        
        {/* Main Form Content */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-8 lg:py-12 relative">
          {children}
        </div>
      </div>

      {/* Right Side: Branding visual */}
      <div className="w-full md:w-1/2 bg-surface-soft flex flex-col justify-center relative overflow-hidden order-2 hidden md:flex border-l border-border/40">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] font-black text-[15rem] text-primary transform rotate-12 select-none pointer-events-none leading-none">அ</div>
        <div className="absolute bottom-10 left-10 p-12 opacity-[0.04] font-black text-[18rem] text-primary transform -rotate-12 select-none pointer-events-none leading-none">ழ</div>
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto px-8 lg:px-16 text-center">
          
          <div className="inline-flex items-center justify-center p-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl mb-14 border border-white group relative hover:-translate-y-1 transition-transform duration-500">
             <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl -z-10 group-hover:bg-primary/10 transition-colors"></div>
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-xl group-hover:rotate-[-5deg] transition-transform duration-300">
              த
            </div>
            <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-white text-4xl font-black -ml-6 shadow-lg group-hover:-translate-y-2 transition-transform duration-300 delay-75">
              மி
            </div>
            <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center text-white text-4xl font-black -ml-6 shadow-md group-hover:rotate-[5deg] transition-transform duration-300 delay-150 border border-white/20">
              ழ்
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-7xl font-black text-text-primary tracking-tight mb-8 leading-tight">
            தமிழ் கற்கும் <br /><span className="text-primary italic">பயணம்</span>
          </h1>
          <p className="text-xl lg:text-2xl text-text-secondary font-medium leading-relaxed max-w-lg mx-auto italic">
            Discover the geometry and soul of one of the world's oldest living classical languages.
          </p>
          
          <div className="mt-20 flex items-center justify-center gap-6 p-6 rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 max-w-sm mx-auto shadow-2xl shadow-slate-200/40 hover:shadow-primary/5 transition-all cursor-default">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full border-4 border-white bg-primary/10 flex items-center justify-center font-black text-primary shadow-sm">K</div>
              <div className="w-12 h-12 rounded-full border-4 border-white bg-emerald-100 flex items-center justify-center font-black text-emerald-600 shadow-sm">M</div>
              <div className="w-12 h-12 rounded-full border-4 border-white bg-purple-100 flex items-center justify-center font-black text-purple-600 shadow-sm">S</div>
              <div className="w-12 h-12 rounded-full border-4 border-white bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg">+1k</div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5 text-warning">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4 h-4 fill-current drop-shadow-sm" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">1,200+ Active Syncs</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
