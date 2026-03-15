"use client";

import React from 'react';
import Link from 'next/link';
import { AuthInput, SocialLogin } from '../shared';

export default function SignInForm() {
  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-accent-text mb-3 tracking-tight">
          Welcome back
        </h2>
        <p className="text-muted text-lg md:text-xl font-medium">
          Sign in to continue your Tamil learning journey.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <AuthInput 
          label="Email" 
          type="email" 
          name="email" 
          placeholder="your@email.com" 
          autoComplete="email"
          required 
        />
        
        <div className="space-y-1.5">
          <AuthInput 
            label="Password" 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            autoComplete="current-password"
            required 
          />
          <div className="flex justify-end pt-2">
            <Link href="/forgot-password" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors drop-shadow-sm">
              Forgot password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full py-4 px-4 rounded-xl bg-primary text-white font-bold text-[17px] hover:bg-primary-dark hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-xl mt-4"
        >
          Sign In
        </button>
      </form>

      <div className="mt-8 mb-8 flex items-center">
        <div className="flex-1 border-t border-border-color/60"></div>
        <div className="px-5 text-sm text-muted font-bold tracking-wide uppercase">or continue with</div>
        <div className="flex-1 border-t border-border-color/60"></div>
      </div>

      <SocialLogin provider="Google" />

      <p className="text-center mt-12 text-muted font-medium text-base">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
