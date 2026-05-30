import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "../../lib/cn";

export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
}

export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { children, className, padding = "md", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-white/[0.06] bg-white/[0.02]",
        "shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]",
        "backdrop-blur-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
});

const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(function CardHeader(
  { children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("border-b border-white/[0.06] px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

const CardBody = forwardRef<HTMLDivElement, CardSectionProps>(function CardBody(
  { children, className, ...props },
  ref,
) {
  return (
    <div ref={ref} className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
});

const CardFooter = forwardRef<HTMLDivElement, CardSectionProps>(function CardFooter(
  { children, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn("border-t border-white/[0.06] px-5 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
