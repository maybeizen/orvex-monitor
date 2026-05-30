import type { Organization } from "@orvex/types";
import { cn } from "@orvex/ui";

const sizeClasses = {
  xs: "size-5 text-[10px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-12 text-lg",
} as const;

export function OrganizationIcon({
  organization,
  size = "md",
  className,
}: {
  organization: Pick<Organization, "name" | "icon">;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  if (organization.icon) {
    return (
      <img
        src={organization.icon}
        alt=""
        className={cn(
          "shrink-0 rounded-md border border-white/10 object-cover",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 font-semibold text-slate-400",
        sizeClasses[size],
        className,
      )}
    >
      {organization.name.slice(0, 1).toUpperCase()}
    </span>
  );
}
