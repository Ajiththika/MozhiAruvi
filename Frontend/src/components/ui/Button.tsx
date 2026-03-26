import React, { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
}

type ButtonAsButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
type ButtonAsLinkProps = ButtonBaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  isLoading,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-black tracking-widest uppercase transition-all duration-300 rounded-responsive focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-primary text-white shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]",
    secondary:
      "bg-primary-soft text-primary border-2 border-primary/20 hover:bg-primary/10 transition-colors active:scale-[0.98]",
    outline:
      "bg-transparent text-text-primary border-2 border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
    ghost:
      "text-text-secondary hover:text-primary hover:bg-primary/5 active:scale-[0.98] outline-none",
    danger:
      "bg-error text-white shadow-xl shadow-error/20 hover:bg-error/90 hover:scale-[1.02] active:scale-[0.98]",
    accent:
      "bg-accent text-white shadow-xl shadow-accent/20 hover:bg-accent/90 hover:scale-[1.02] active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-[9px] px-4 py-2",
    md: "text-[10px] px-6 py-3.5",
    lg: "text-[12px] px-8 py-5",
    xl: "text-[14px] px-10 py-6",
  };

  const currentClasses = cn(
    baseClasses, 
    variants[variant], 
    sizes[size], 
    className
  );

  if ("href" in props && props.href) {
    const { href, ...linkProps } = props as ButtonAsLinkProps;
    return (
      <Link href={href} className={currentClasses} {...linkProps}>
        {children}
      </Link>
    );
  }

  const {
    type = "button",
    disabled,
    ...buttonProps
  } = props as ButtonAsButtonProps;

  return (
    <button
      type={type}
      className={currentClasses}
      disabled={isLoading || disabled}
      {...buttonProps}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      <span className="flex items-center gap-2">{children}</span>
    </button>
  );
}

export default Button;
