"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthInput } from '../shared';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/auth/signin');
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
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
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Password Reset!</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          Your credentials have been successfully updated. You can now securely sign in to your student account.
        </p>
        <Button href="/auth/signin" variant="primary" size="xl" className="w-full rounded-2xl shadow-xl shadow-primary/20 group">
          Sign In Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md">
      <div className="mb-10 text-center md:text-left">
        <div className="inline-flex items-center gap-2 text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-6">
          <ShieldCheck size={14} className="text-primary" /> Secure Reset
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
          New Password
        </h2>
        <p className="text-slate-500 text-lg font-medium">
          Create a new, strong password to secure your Tamil learning account.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl">
            {error}
          </div>
        )}

        <AuthInput 
          label="New Password" 
          type="password" 
          name="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <AuthInput 
          label="Confirm New Password" 
          type="password" 
          name="confirmPassword" 
          placeholder="••••••••" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required 
        />

        <Button 
          type="submit" 
          isLoading={loading}
          variant="primary"
          size="xl"
          className="w-full rounded-2xl shadow-xl shadow-primary/20"
        >
          Update Password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Reset Handler...</div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}



