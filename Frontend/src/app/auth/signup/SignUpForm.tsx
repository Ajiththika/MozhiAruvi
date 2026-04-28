"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthInput, SocialLogin } from '../shared';
import { register } from '@/services/authService';
import { submitTutorApplication } from "@/services/tutorService";
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const { user, isLoading, setUser } = useAuth();
  
  // Redirect already logged-in users
  useEffect(() => {
    if (!isLoading && user) {
      const dest = redirectParam || '/student/dashboard';
      router.replace(dest);
    }
  }, [isLoading, user, router, redirectParam]);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
 
    setLoading(true);
 
    try {
      await register({ name, email, password });
      setSuccess(true);
      // We don't call setUser(res.user) here because they aren't verified yet
      // The middleware will block them anyway
    } catch (err: any) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto xl:max-w-md text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight">Check your email</h2>
          <p className="mt-2 text-primary/60 font-bold uppercase tracking-widest text-xs">Verification required</p>
        </div>
        <p className="text-text-secondary mb-6">
          We've sent a verification link to <span className="font-bold text-text-primary">{email}</span>. 
          Please click the link in the email to activate your account.
        </p>
        <div className="space-y-4">
          <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/auth/signin')}>
            Go to Sign In
          </Button>
          <p className="text-sm text-primary/40 uppercase tracking-tighter font-black">
            Didn't receive it? Check your spam folder or try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-4 text-center md:text-left">
        <h2 className="text-xl md:text-2xl font-black text-text-primary tracking-tight leading-tight uppercase">
          Join With Us
        </h2>
        <p className="text-sm font-bold text-primary/60 uppercase tracking-widest mt-1">Tamil Cultural Heritage</p>
      </div>

      <form className="space-y-2.5" onSubmit={handleSubmit}>
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <AuthInput 
          label="Full Name" 
          type="text" 
          name="name" 
          placeholder="John Doe" 
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />

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
        
        <AuthInput 
          label="Password" 
          type="password" 
          name="password" 
          placeholder="Create a strong password" 
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <AuthInput 
          label="Confirm Password" 
          type="password" 
          name="confirmPassword" 
          placeholder="Repeat your password" 
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />

        <Button 
          type="submit" 
          isLoading={loading}
          variant="primary"
          size="xl"
          className="w-full mt-4 shadow-xl shadow-primary/20"
        >
          Begin Heritage Journey
        </Button>
      </form>

      <div className="mt-4 mb-4 flex items-center">
        <div className="flex-1 border-t border-slate-100/60"></div>
        <div className="px-5 text-sm text-primary/60 font-bold tracking-wide uppercase">or</div>
        <div className="flex-1 border-t border-slate-100/60"></div>
      </div>

      <SocialLogin provider="Google" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`} />

      <p className="text-center mt-4 text-primary/60 font-medium text-base">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
















