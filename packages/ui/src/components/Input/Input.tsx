import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from "react";

import { cn } from "../../lib/cn";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  inputSize?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-11 px-4 text-base",
};

const iconPaddingLeft: Record<InputSize, string> = {
  sm: "pl-8",
  md: "pl-9",
  lg: "pl-10",
};

const iconPaddingRight: Record<InputSize, string> = {
  sm: "pr-8",
  md: "pr-9",
  lg: "pr-10",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hint,
    error,
    inputSize = "md",
    leftIcon,
    rightIcon,
    className,
    id,
    required,
    disabled,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={inputId} {...(required ? { required: true } : {})}>
          {label}
        </Label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "w-full rounded-lg border bg-slate-950 text-slate-100 placeholder:text-slate-600",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400/50",
            "disabled:cursor-not-allowed disabled:opacity-40",
            error
              ? "border-red-500/50 focus:ring-red-400/20 focus:border-red-400/50"
              : "border-white/10 hover:border-white/15",
            sizeClasses[inputSize],
            leftIcon && iconPaddingLeft[inputSize],
            rightIcon && iconPaddingRight[inputSize],
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            {rightIcon}
          </span>
        )}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <ErrorMessage {...(errorId ? { id: errorId } : {})}>{error}</ErrorMessage>
      )}
    </div>
  );
});
