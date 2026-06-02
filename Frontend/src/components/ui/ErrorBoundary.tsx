"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** When this value changes, a previously-caught error is cleared (e.g. next question). */
  resetKey?: string | number;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic React error boundary. Used to isolate the dynamic question renderer
 * so a single malformed question can't crash the entire lesson session.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.reset = this.reset.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prev: ErrorBoundaryProps) {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  reset() {
    this.setState({ hasError: false, error: undefined });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="w-full max-w-lg mx-auto text-center p-8 rounded-[2rem] border-2 border-amber-100 bg-amber-50/40 animate-in fade-in">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-slate-800 mb-2">Something went wrong here</h3>
          <p className="text-sm font-medium text-slate-500 mb-6">
            This part couldn&apos;t load. You can retry without losing the rest of your session.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
