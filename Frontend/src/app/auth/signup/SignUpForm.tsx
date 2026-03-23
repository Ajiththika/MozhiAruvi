"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthInput, SocialLogin } from '../shared';
import { register } from '@/services/authService';
import { getRoleDashboardRoute } from '@/lib/roleUtils';
import { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function SignUpForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
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
      const res = await register({ name, email, password });
      setUser(res.user);
      router.push(getRoleDashboardRoute(res.user.role));
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        setError(err.response.data.error.message);
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-8 md:mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-extrabold text-accent-text mb-3 tracking-tight">
          Create your account
        </h2>
        <p className="text-muted text-lg md:text-xl font-medium">
          Start learning Tamil today with 50 free credits.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
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

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 px-4 rounded-xl bg-primary text-white font-bold text-[17px] hover:bg-primary-dark hover:-translate-y-0.5 focus:ring-4 focus:ring-primary/20 transition-all shadow-md hover:shadow-xl mt-6 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Creating Account..." : "Create Free Account"}
        </button>
      </form>

      <div className="mt-8 mb-8 flex items-center">
        <div className="flex-1 border-t border-border-color/60"></div>
        <div className="px-5 text-sm text-muted font-bold tracking-wide uppercase">or continue with</div>
        <div className="flex-1 border-t border-border-color/60"></div>
      </div>

      <SocialLogin provider="Google" onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'} />

      <p className="text-center mt-12 text-muted font-medium text-base">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-primary hover:text-primary-dark font-extrabold transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
