import { forwardRef, type HTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface ErrorMessageProps extends HTMLAttributes<HTMLParagraphElement> {
  id?: string;
}

export const ErrorMessage = forwardRef<HTMLParagraphElement, ErrorMessageProps>(
  function ErrorMessage({ children, className, id, ...props }, ref) {
    if (!children) return null;

    return (
      <p
        ref={ref}
        id={id}
        role="alert"
        className={cn("flex items-center gap-1.5 text-xs text-red-400", className)}
        {...props}
      >
        {children}
      </p>
    );
  },
);
