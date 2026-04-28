"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail } from '@/services/authService';
import Button from '@/components/ui/Button';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Missing token.');
      return;
    }

    async function doVerify() {
      try {
        const res = await verifyEmail(token as string);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully!');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.error?.message || 'Verification failed. The link may be expired or invalid.');
      }
    }

    doVerify();
  }, [token]);

  return (
    <div className="w-full max-w-sm mx-auto xl:max-w-md text-center py-10">
      {status === 'loading' && (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">{message}</h2>
        </div>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">Verified!</h2>
          <p className="text-text-secondary mb-8">{message}</p>
          <Button variant="primary" size="xl" className="w-full shadow-lg" onClick={() => router.push('/auth/signin')}>
            Sign In Now
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">Verification Failed</h2>
          <p className="text-text-secondary mb-8">{message}</p>
          <div className="space-y-4">
            <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/auth/signup')}>
              Try Signing Up Again
            </Button>
            <p className="text-sm">
              <Link href="/auth/signin" className="text-primary font-bold hover:underline">
                Back to Sign In
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-sm mx-auto xl:max-w-md text-center py-10">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
