"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthInput } from '../shared';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm mx-auto xl:max-w-md text-center py-12">
        <div className="flex justify-center mb-8">
          <div className="h-24 w-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 animate-in zoom-in-50 duration-500">
            <CheckCircle2 size={64} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Check your email</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          If an account exists for <span className="text-slate-900 font-black">{email}</span>, we've sent instructions to reset your password.
        </p>
        <Link href="/auth/signin" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] hover:translate-x-1 transition-transform">
          <ArrowLeft size={16} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-10 text-center md:text-left">
        <Link href="/auth/signin" className="inline-flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-6 hover:text-primary transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
        </Link>
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          Forgot Password?
        </h2>
        <p className="text-slate-500 text-lg font-medium">
          No worries! Enter your email below and we'll send you a link to reset it.
        </p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl animate-in shake duration-500">
            {error}
          </div>
        )}

        <AuthInput 
          label="Account Email" 
          type="email" 
          name="email" 
          placeholder="your@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />

        <Button 
          type="submit" 
          isLoading={loading}
          variant="primary"
          size="xl"
          className="w-full rounded-2xl shadow-xl shadow-primary/20"
        >
          Send Reset Link
        </Button>
      </form>

      <p className="text-center mt-12 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
        Remembered it?{' '}
        <Link href="/auth/signin" className="text-primary hover:underline ml-2">
          Sign In
        </Link>
      </p>
    </div>
  );
}



