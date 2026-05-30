import { type ReactNode } from "react";

import { cn } from "../../lib/cn";

export type BadgeVariant = "up" | "down" | "unknown" | "paused" | "neutral";

export interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  up: "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  down: "border-red-500/25 bg-red-500/10 text-red-400",
  unknown: "border-slate-600/50 bg-slate-800/60 text-slate-400",
  paused: "border-amber-500/25 bg-amber-500/10 text-amber-400",
  neutral: "border-white/10 bg-white/5 text-slate-300",
};

const dotClasses: Record<BadgeVariant, string> = {
  up: "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.7)]",
  down: "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.7)]",
  unknown: "bg-slate-500",
  paused: "bg-amber-400",
  neutral: "bg-slate-400",
};

export function Badge({ variant, children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", dotClasses[variant])} />}
      {children}
    </span>
  );
}
