"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthInput } from '../shared';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { ShieldCheck, CheckCircle2, ArrowRight, KeyRound, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCheckingToken, setIsCheckingToken] = useState(true);

    useEffect(() => {
        // Initial check for email in URL
        const emailParam = searchParams.get('email');
        if (emailParam) setEmail(emailParam);

        // Give Next.js a moment to hydrate searchParams
        const timer = setTimeout(() => {
            if (!token) {
                setError("Invalid or missing reset token. Please request a new link.");
            }
            setIsCheckingToken(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [token, searchParams]);

    const handleResend = async () => {
        if (!email) {
            router.push('/auth/forgot-password');
            return;
        }

        setResending(true);
        setError(null);
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email });
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 5000);
        } catch (err: any) {
            setError("Could not resend link. Please try again manually.");
        } finally {
            setResending(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

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
            // Enhanced error reporting
            const resError = err.response?.data?.error;
            const msg = resError?.message || 
                        err.response?.data?.message || 
                        "An error occurred. Please ensure your reset link hasn't expired.";
            setError(msg);

            // Capture email if the backend returned it (for expired tokens)
            if (resError?.email) {
                setEmail(resError.email);
            }
        } finally {
            setLoading(false);
        }
    };


    if (isCheckingToken) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-primary/60 font-medium lowercase tracking-widest">Verifying secure link...</p>
            </div>
        );
    }

    if (success) {
        return (
            <div className="w-full max-w-sm mx-auto xl:max-w-md text-center py-12">
                <div className="flex justify-center mb-8">
                    <div className="h-28 w-28 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 animate-in zoom-in-50 duration-500 shadow-xl shadow-emerald-500/10 border border-emerald-100">
                        <CheckCircle2 size={64} />
                    </div>
                </div>
                <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">Access Restored!</h2>
                <p className="text-primary/70 font-medium mb-10 leading-relaxed text-lg">
                    Your password has been successfully updated. You can now use your new credentials to sign in.
                </p>
                <Button href="/auth/signin" variant="primary" size="xl" className="w-full rounded-2xl shadow-xl shadow-primary/20 group py-6">
                    Sign In Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </div>
        );
    }

    if (!token && !isCheckingToken) {
        return (
            <div className="w-full max-w-sm mx-auto xl:max-w-md text-center py-12">
                <div className="flex justify-center mb-8">
                    <div className="h-24 w-24 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                        <AlertCircle size={48} />
                    </div>
                </div>
                <h2 className="text-3xl font-black text-primary mb-4 tracking-tight">Invalid Link</h2>
                <p className="text-primary/70 font-medium mb-10 leading-relaxed">
                    This password reset link is invalid or has expired.
                </p>
                <Button href="/auth/forgot-password" variant="primary" size="lg" className="w-full rounded-2xl shadow-lg shadow-primary/10">
                    Get New Link
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto xl:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-6 border border-primary/10">
                    <KeyRound size={12} className="text-primary" /> Secure Update
                </div>
                <h2 className="text-4xl font-black text-primary mb-3 tracking-tight">
                    Reset Password
                </h2>
                <p className="text-primary/70 text-lg font-medium leading-relaxed">
                    Set a new strong password for your <b>Mozhi Aruvi</b> account.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="p-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-2xl animate-in shake duration-500 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                           <AlertCircle size={16} /> {error}
                        </div>
                        {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
                           <button 
                             type="button"
                             onClick={handleResend}
                             disabled={resending}
                             className="text-left text-xs font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                           >
                             {resending ? 'Sending...' : '→ Resend new link now'}
                           </button>
                        ) : null}
                    </div>
                )}

                {resendSuccess && (
                    <div className="p-4 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in slide-in-from-top-2">
                        A fresh reset link has been sent to your email! (Expires in 10m)
                    </div>
                )}

                <div className="space-y-5">
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
                        label="Repeat New Password" 
                        type="password" 
                        name="confirmPassword" 
                        placeholder="••••••••" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                    />
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        isLoading={loading}
                        variant="primary"
                        size="xl"
                        className="w-full rounded-2xl shadow-xl shadow-primary/30 py-6"
                    >
                        Update My Password
                    </Button>
                </div>
                
                <div className="flex flex-col items-center gap-4 pt-4">
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest">
                        Secure 256-bit Encryption
                    </p>
                    
                    <button 
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {resending ? 'Sending Link...' : 'Issue with this link? Resend'}
                    </button>

                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-primary/20 animate-spin" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}


















