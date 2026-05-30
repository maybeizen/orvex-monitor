import { cn } from "../../lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function Avatar({ src, alt, name = "", size = "md", className }: AvatarProps) {
  const initials = getInitials(name || alt || "?");
  const label = alt ?? name ?? initials;

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={cn(
          "inline-block shrink-0 rounded-full border border-white/10 object-cover ring-1 ring-white/5",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-white/10",
        "bg-linear-to-br from-brand-500/20 to-brand-600/10 font-semibold text-brand-300",
        "ring-1 ring-white/5",
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}
