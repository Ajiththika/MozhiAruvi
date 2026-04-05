"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthInput, SocialLogin } from '../shared';
import { login } from '@/services/authService';
import { submitTutorApplication } from "@/services/tutorApplicationService";
import { getRoleDashboardRoute } from '@/lib/roleUtils';
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading, setUser } = useAuth();
  
  const redirectParam = searchParams.get('redirect');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Wait until auth state is resolved, then redirect already-logged-in users
  useEffect(() => {
    if (!isLoading && user) {
      const dest = redirectParam || getRoleDashboardRoute(user.role);
      router.replace(dest);
    }
  }, [isLoading, user, router, redirectParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });

      if (redirectParam === '/tutor/apply') {
        if (res.user.tutorStatus === 'none' || !res.user.tutorStatus) {
            // Quick Apply: Auto-submit with basic info
            try {
                await submitTutorApplication({
                    name: res.user.name,
                    email: res.user.email,
                    phone: "",
                    experience: "Automated Login Applicant",
                    bio: "Interested in joining as a tutor from the platform join button.",
                    languages: [],
                    availability: "Contact for details",
                    certifications: ""
                });
                setUser({ ...res.user, tutorStatus: 'pending' });
                router.push('/tutor/apply/status');
            } catch (err) {
                // If auto-submit fails, just go to the form normally
                setUser(res.user);
                router.push(redirectParam);
            }
        } else {
            setUser(res.user);
            router.push('/tutor/apply/status');
        }
      } else if (!res.user.hasCompletedOnboarding && res.user.role === 'student' && !redirectParam) {
        setUser(res.user);
        router.push('/auth/role-selection');
      } else if (redirectParam) {
        setUser(res.user);
        router.push(redirectParam);
      } else if (res.user.tutorStatus === 'pending') {
        setUser(res.user);
        router.push('/tutor/apply/status');
      } else {
        setUser(res.user);
        router.push(getRoleDashboardRoute(res.user.role));
      }
    } catch (err) {
      if (isAxiosError(err)) {
        if (!err.response) {
          // Network error — backend is not reachable
          setError("Cannot reach the server. Please make sure the backend is running on port 5000.");
        } else if (err.response?.data?.error?.message) {
          setError(err.response.data.error.message);
        } else {
          setError(`Server error (${err.response.status}). Please try again.`);
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-6 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight leading-tight">
          Welcome back
        </h2>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <Button 
          type="submit" 
          isLoading={loading}
          variant="primary"
          size="xl"
          className="w-full mt-4"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-4 mb-4 flex items-center">
        <div className="flex-1 border-t border-slate-100/60"></div>
        <div className="px-5 text-sm text-primary/60 font-bold tracking-wide uppercase">or continue with</div>
        <div className="flex-1 border-t border-slate-100/60"></div>
      </div>

      <SocialLogin provider="Google" onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`} />

      <p className="text-center mt-6 text-primary/60 font-medium text-base">
        New to the heritage?{' '}
        <Link href="/auth/signup" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Join Flow
        </Link>
      </p>
    </div>
  );
}

















