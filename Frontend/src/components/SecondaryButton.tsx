import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
};

type ButtonAsButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonAsLinkProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

type SecondaryButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function SecondaryButton({ children, className = '', href, ...props }: SecondaryButtonProps) {
  const baseClasses = `inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold rounded-xl bg-white text-primary border-2 border-primary/20 hover:border-primary/50 hover:bg-light-blue/30 transition-all shadow-sm ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
