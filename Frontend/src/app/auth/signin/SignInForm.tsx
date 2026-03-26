"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthInput, SocialLogin } from '../shared';
import { login } from '@/services/authService';
import { getRoleDashboardRoute } from '@/lib/roleUtils';
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Button from '@/components/common/Button';

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
      setUser(res.user);
      
      // After login success: Check for "redirect" query param
      if (redirectParam) {
        router.push(redirectParam);
      } else {
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
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-700 mb-3 tracking-tight">
          Welcome back
        </h2>
        <p className="text-gray-400 text-lg md:text-xl font-medium">
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

      <div className="mt-8 mb-8 flex items-center">
        <div className="flex-1 border-t border-gray-100/60"></div>
        <div className="px-5 text-sm text-gray-400 font-bold tracking-wide uppercase">or continue with</div>
        <div className="flex-1 border-t border-gray-100/60"></div>
      </div>

      <SocialLogin provider="Google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} />

      <p className="text-center mt-12 text-gray-400 font-medium text-base">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

