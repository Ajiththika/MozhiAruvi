import React, { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputBaseProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  options?: { label: string; value: string | number }[];
  className?: string; // Container className
  inputClassName?: string; // Direct input element className
}

type InputElementProps = InputHTMLAttributes<HTMLInputElement> &
  SelectHTMLAttributes<HTMLSelectElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export type InputProps = InputBaseProps & InputElementProps;

export function Input({
  label,
  error,
  icon,
  multiline,
  options,
  className,
  inputClassName,
  ...props
}: InputProps) {
  const containerClasses = cn("flex flex-col gap-2.5", className);

  const inputBaseClasses = cn(
    "w-full rounded-responsive border border-border bg-background px-5 py-4 text-sm font-medium text-text-primary placeholder:text-text-tertiary transition-all duration-300 focus:border-primary/40 focus:ring-4 focus:ring-primary/10 hover:border-primary/20 outline-none disabled:opacity-50 disabled:bg-surface-soft",
    icon && "pl-12",
    error && "border-error focus:ring-error/10 focus:border-error hover:border-error/60",
    inputClassName
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1 select-none">
          {label}
        </label>
      )}

      <div className="relative group/input">
        {icon && (
          <div className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors duration-300 group-focus-within/input:text-primary",
            error && "text-error"
          )}>
            {icon}
          </div>
        )}

        {options ? (
          <select
            className={cn(inputBaseClasses, "appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[length:1em_1em] pr-10 cursor-pointer")}
            style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")`
            }}
            {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
          >
            {props.placeholder && (
              <option value="" disabled hidden>
                {props.placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            className={cn(inputBaseClasses, "min-h-[120px] resize-none")}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            className={inputBaseClasses}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>

      {error && (
        <span className="text-[10px] font-bold text-error mt-0.5 ml-1 flex items-center gap-1.5 animate-in fade-in duration-300">
           <div className="w-1.5 h-1.5 rounded-full bg-error" /> {error}
        </span>
      )}
    </div>
  );
}

export default Input;



