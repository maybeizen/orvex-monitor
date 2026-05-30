import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/cn";
import { ErrorMessage } from "../ErrorMessage";
import { Label } from "../Label";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  selectSize?: SelectSize;
  leftIcon?: ReactNode;
  className?: string;
  id?: string;
  name?: string;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-9 px-3 text-sm",
  lg: "h-11 px-4 text-base",
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value: controlledValue,
    defaultValue,
    onChange,
    label,
    hint,
    error,
    placeholder = "Select an option",
    disabled = false,
    required,
    selectSize = "md",
    leftIcon,
    className,
    id,
    name,
  },
  ref,
) {
  const generatedId = useId();
  const listboxId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue ?? uncontrolledValue;
  const selectedOption = options.find((o) => o.value === value);
  const enabledOptions = options.filter((o) => !o.disabled);

  const setValue = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolledValue(next);
      onChange?.(next);
      setOpen(false);
    },
    [controlledValue, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  useEffect(() => {
    if (!open) { setHighlightIndex(-1); return; }
    const idx = enabledOptions.findIndex((o) => o.value === value);
    setHighlightIndex(idx >= 0 ? idx : 0);
  }, [open, enabledOptions, value]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        setHighlightIndex((i) => Math.min(i + 1, enabledOptions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        setHighlightIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) { setOpen(true); return; }
        if (highlightIndex >= 0 && enabledOptions[highlightIndex]) {
          setValue(enabledOptions[highlightIndex].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Home":
        if (!open) return;
        e.preventDefault();
        setHighlightIndex(0);
        break;
      case "End":
        if (!open) return;
        e.preventDefault();
        setHighlightIndex(enabledOptions.length - 1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-1.5", className)}>
      {name && <input type="hidden" name={name} value={value} />}
      {label && (
        <Label htmlFor={selectId} {...(required ? { required: true } : {})}>
          {label}
        </Label>
      )}
      <button
        ref={ref}
        id={selectId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border bg-slate-950 text-left text-slate-100",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-brand-400/30 focus:border-brand-400/50",
          "disabled:cursor-not-allowed disabled:opacity-40",
          error
            ? "border-red-500/50"
            : "border-white/10 hover:border-white/15",
          sizeClasses[selectSize],
          leftIcon && "pl-9",
        )}
      >
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            {leftIcon}
          </span>
        )}
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-slate-600")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-slate-500 transition-transform duration-150", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={selectId}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-white/10 bg-slate-900 py-1 shadow-xl shadow-black/50"
        >
          {options.map((option) => {
            const enabledIdx = enabledOptions.indexOf(option);
            const isHighlighted = enabledIdx === highlightIndex;
            const isSelected = option.value === value;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={option.disabled || undefined}
                onMouseEnter={() => {
                  if (!option.disabled && enabledIdx >= 0) setHighlightIndex(enabledIdx);
                }}
                onClick={() => { if (!option.disabled) setValue(option.value); }}
                onKeyDown={(e) => {
                  if (option.disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setValue(option.value);
                  }
                }}
                tabIndex={option.disabled ? -1 : 0}
                className={cn(
                  "cursor-pointer px-3 py-2 text-sm text-slate-300 transition-colors duration-100",
                  isHighlighted && "bg-white/5 text-slate-100",
                  isSelected && "text-brand-400",
                  option.disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}

      {hint && !error && (
        <p id={hintId} className="text-xs text-slate-500">{hint}</p>
      )}
      {error && (
        <ErrorMessage {...(errorId ? { id: errorId } : {})}>{error}</ErrorMessage>
      )}
    </div>
  );
});
