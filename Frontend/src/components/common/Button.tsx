import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

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
  const baseClasses = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-sm",
    secondary: "border border-primary text-primary hover:bg-light/30",
    ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium",
    danger: "bg-error text-white hover:bg-red-600 shadow-sm",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-5 py-2",
    lg: "text-base px-5 py-3",
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
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}
