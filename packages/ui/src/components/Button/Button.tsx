import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "../../lib/cn";
import { Spinner } from "../Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-brand-400 text-slate-950 font-semibold",
    "hover:bg-brand-300",
    "shadow-[0_0_0_1px_rgba(34,211,238,0.3)]",
    "hover:shadow-[0_0_16px_rgba(34,211,238,0.25),0_0_0_1px_rgba(34,211,238,0.4)]",
    "focus-visible:ring-brand-400/50",
    "active:bg-brand-500",
  ].join(" "),
  secondary: [
    "bg-white/5 border border-white/10 text-slate-200 font-medium",
    "hover:bg-white/8 hover:border-white/15 hover:text-white",
    "focus-visible:ring-brand-400/30",
    "active:bg-white/10",
  ].join(" "),
  ghost: [
    "bg-transparent text-slate-400 font-medium",
    "hover:bg-white/5 hover:text-slate-200",
    "focus-visible:ring-brand-400/30",
    "active:bg-white/8",
  ].join(" "),
  danger: [
    "bg-red-500/90 text-white font-semibold",
    "hover:bg-red-400",
    "shadow-[0_0_0_1px_rgba(239,68,68,0.3)]",
    "hover:shadow-[0_0_12px_rgba(239,68,68,0.2),0_0_0_1px_rgba(239,68,68,0.4)]",
    "focus-visible:ring-red-500/50",
    "active:bg-red-600",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs",
  md: "h-9 gap-2 px-4 text-sm",
  lg: "h-11 gap-2.5 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    disabled,
    className,
    children,
    leftIcon,
    rightIcon,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled ?? loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        "disabled:pointer-events-none disabled:opacity-40",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === "lg" ? "md" : "sm"} className="border-current/20 border-t-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
