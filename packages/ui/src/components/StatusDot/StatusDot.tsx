import { cn } from "../../lib/cn";

export type StatusDotStatus = "up" | "down" | "unknown" | "paused";

export interface StatusDotProps {
  status: StatusDotStatus;
  pulse?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const colorClasses: Record<StatusDotStatus, string> = {
  up: "bg-emerald-400",
  down: "bg-red-400",
  unknown: "bg-slate-500",
  paused: "bg-amber-400",
};

const glowClasses: Record<StatusDotStatus, string> = {
  up: "shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  down: "shadow-[0_0_8px_rgba(248,113,113,0.6)]",
  unknown: "",
  paused: "shadow-[0_0_8px_rgba(251,191,36,0.5)]",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
  sm: "size-2",
  md: "size-2.5",
  lg: "size-3.5",
};

export function StatusDot({ status, pulse = false, size = "md", className }: StatusDotProps) {
  return (
    <span className={cn("relative flex shrink-0 items-center justify-center", className)} aria-hidden="true">
      {pulse && status === "up" && (
        <span
          className={cn(
            "absolute inline-flex animate-ping rounded-full opacity-60",
            colorClasses[status],
            sizeClasses[size],
          )}
        />
      )}
      <span
        className={cn(
          "relative inline-flex rounded-full",
          colorClasses[status],
          glowClasses[status],
          sizeClasses[size],
        )}
      />
    </span>
  );
}
