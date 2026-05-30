import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className, id, disabled, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2.5",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        disabled={disabled}
        className={cn(
          "size-4 shrink-0 cursor-pointer rounded border-white/15 bg-slate-950 text-brand-400",
          "transition-colors",
          "focus:ring-2 focus:ring-brand-400/30 focus:ring-offset-2 focus:ring-offset-slate-950",
          "disabled:cursor-not-allowed",
        )}
        {...props}
      />
      {label && <span className="select-none text-sm text-slate-300">{label}</span>}
    </label>
  );
});
