import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked = false, onCheckedChange, label, className, disabled, id, ...props },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-3",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <button
        ref={ref}
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
          checked
            ? "border-brand-500/50 bg-brand-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
            : "border-white/10 bg-slate-800",
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
      {label && <span className="select-none text-sm text-slate-300">{label}</span>}
    </label>
  );
});
