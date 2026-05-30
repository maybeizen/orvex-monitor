import { forwardRef, type TextareaHTMLAttributes, useId } from "react";

import { cn } from "../../lib/cn";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  textareaSize?: TextareaSize;
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: "min-h-20 px-3 py-2 text-sm",
  md: "min-h-24 px-3 py-2 text-sm",
  lg: "min-h-32 px-4 py-3 text-base",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, textareaSize = "md", className, id, required, disabled, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint ? `${textareaId}-hint` : undefined;
  const errorId = error ? `${textareaId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={textareaId} {...(required ? { required: true } : {})}>
          {label}
        </Label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "w-full resize-y rounded-lg border bg-slate-950 text-slate-100 placeholder:text-slate-600",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400/50",
          "disabled:cursor-not-allowed disabled:opacity-40",
          error
            ? "border-red-500/50 focus:ring-red-400/20 focus:border-red-400/50"
            : "border-white/10 hover:border-white/15",
          sizeClasses[textareaSize],
          className,
        )}
        {...props}
      />
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
