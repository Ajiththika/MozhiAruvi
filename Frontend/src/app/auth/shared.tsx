"use client";

import React, { InputHTMLAttributes, useState } from 'react';
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function AuthInput({ label, error, id, type, ...props }: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={inputId} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1 select-none">
        {label}
      </label>
      <div className="relative group">
        <input
          id={inputId}
          type={currentType}
          className={cn(
            "w-full px-6 py-3.5 rounded-xl border bg-slate-50/50 text-slate-800 font-medium placeholder:text-slate-400 transition-all duration-300 outline-none focus:ring-4 focus:ring-primary/5 hover:border-primary/20 hover:bg-white focus:bg-white pr-14 shadow-sm",
            error ? 'border-red-400 ring-red-500/5 hover:border-red-500/60' : 'border-slate-100 focus:border-primary/40'
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-text-tertiary hover:text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} className="animate-in fade-in zoom-in duration-200" />
            ) : (
              <Eye size={18} className="animate-in fade-in zoom-in duration-200" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-[10px] font-bold text-error mt-0.5 ml-1 animate-in fade-in duration-300 select-none flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-error" /> {error}</p>}
    </div>
  );
}

interface SocialLoginProps {
  provider: 'Google';
  onClick?: () => void;
}

export function SocialLogin({ provider, onClick }: SocialLoginProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full flex items-center justify-center gap-4 px-6 py-3.5 rounded-xl border border-slate-100 bg-white text-slate-800 font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-slate-50 hover:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all group active:scale-[0.98]"
    >
      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Secure Google Identity Sync
    </button>
  );
}
















