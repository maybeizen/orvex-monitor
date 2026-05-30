import { Link } from "react-router";
import { Activity } from "lucide-react";

import { cn } from "@orvex/ui";

const sizeClasses = {
  sm: "size-6 rounded-md",
  md: "size-7 rounded-lg",
} as const;

const iconSizes = {
  sm: 12,
  md: 14,
} as const;

interface OrvexMarkProps {
  size?: keyof typeof sizeClasses;
  to?: string;
  className?: string;
}

export function OrvexMark({
  size = "md",
  to = "/app/organizations",
  className,
}: OrvexMarkProps) {
  return (
    <Link
      to={to}
      aria-label="Orvex organizations"
      className={cn(
        "flex shrink-0 items-center justify-center bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all hover:opacity-90 hover:shadow-[0_0_18px_rgba(34,211,238,0.35)]",
        sizeClasses[size],
        className,
      )}
    >
      <Activity size={iconSizes[size]} className="text-slate-950" />
    </Link>
  );
}
