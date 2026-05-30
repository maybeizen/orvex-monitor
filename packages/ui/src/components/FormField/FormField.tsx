import { type ReactElement, cloneElement, useId } from "react";

import { cn } from "../../lib/cn";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";

export interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{
    id?: string;
    "aria-describedby"?: string;
    "aria-invalid"?: boolean;
  }>;
}

export function FormField({ label, hint, error, required, className, children }: FormFieldProps) {
  const generatedId = useId();
  const fieldId = children.props.id ?? generatedId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy =
    [children.props["aria-describedby"], hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={fieldId} {...(required ? { required: true } : {})}>
          {label}
        </Label>
      )}
      {cloneElement(children, {
        id: fieldId,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(error || children.props["aria-invalid"]
          ? { "aria-invalid": error ? true : children.props["aria-invalid"] }
          : {}),
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <ErrorMessage {...(errorId ? { id: errorId } : {})}>{error}</ErrorMessage>
      )}
    </div>
  );
}
