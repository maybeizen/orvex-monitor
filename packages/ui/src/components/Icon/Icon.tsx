import { cn } from "../../lib/cn";

export type IconPosition = "left" | "right";

export interface IconProps {
  icon?: string;
  iconPosition?: IconPosition;
}

export interface IconComponentProps {
  className: string;
}

export function Icon({ className }: IconComponentProps) {
  return (
    <i
      className={cn("inline-block shrink-0 text-[length:inherit] leading-none", className)}
      aria-hidden
    />
  );
}

export function renderIcon(className: string) {
  return <Icon className={className} />;
}
