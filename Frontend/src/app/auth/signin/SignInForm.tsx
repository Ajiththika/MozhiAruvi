"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthInput, SocialLogin } from '../shared';
import { login } from '@/services/authService';
import { isAxiosError } from 'axios';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard'); // or wherever the user should go
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <AuthInput 
          label="Email" 
          type="email" 
          name="email" 
          placeholder="your@email.com" 
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <div className="space-y-1.5">
          <AuthInput 
            label="Password" 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <div className="flex justify-end pt-2">
            <Link href="/auth/forgot-password" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors drop-shadow-sm">
              Forgot password?
            </Link>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 px-4 rounded-xl bg-primary text-white font-bold text-[17px] hover:bg-primary-dark hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-xl mt-4 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-8 mb-8 flex items-center">
        <div className="flex-1 border-t border-border-color/60"></div>
        <div className="px-5 text-sm text-muted font-bold tracking-wide uppercase">or continue with</div>
        <div className="flex-1 border-t border-border-color/60"></div>
      </div>

      <SocialLogin provider="Google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} />

      <p className="text-center mt-12 text-muted font-medium text-base">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}
