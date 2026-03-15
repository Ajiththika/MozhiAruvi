import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import Link from 'next/link';

type ButtonBaseProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
};

type ButtonAsButtonProps = ButtonBaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonAsLinkProps = ButtonBaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

type PrimaryButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export default function PrimaryButton({ children, className = '', href, ...props }: PrimaryButtonProps) {
  const baseClasses = `inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold rounded-xl bg-primary text-white transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:bg-primary-dark focus:ring-4 focus:ring-primary/20 ${className}`;

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
