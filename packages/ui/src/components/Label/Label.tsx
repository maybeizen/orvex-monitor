import { forwardRef, type LabelHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { children, className, required, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn("block text-sm font-medium text-slate-300", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-400" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});
