import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

type ButtonAsButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonAsLinkProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  isLoading,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-bold transition-all duration-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/95 hover:shadow-xl hover:-translate-y-0.5 active:scale-95",
    secondary: "bg-white text-primary border-2 border-primary/10 hover:border-primary/50 hover:bg-slate-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95",
    outline: "bg-transparent text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:scale-95",
    ghost: "text-slate-500 hover:text-primary hover:bg-primary/5 active:scale-95 px-4",
    danger: "bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600 hover:-translate-y-0.5 active:scale-95",
  };

  const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4",
    xl: "text-lg px-10 py-5",
  };

  const currentClasses = cn(baseClasses, variants[variant], sizes[size], className);

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLinkProps;
    return (
      <Link href={href} className={currentClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', disabled, ...buttonProps } = props as ButtonAsButtonProps;

  return (
    <button
      type={type}
      className={currentClasses}
      disabled={isLoading || disabled}
      {...buttonProps}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

