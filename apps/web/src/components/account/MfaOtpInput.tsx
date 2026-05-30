import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@orvex/ui";

const cellClassName = cn(
  "h-11 w-10 rounded-lg border border-white/10 bg-slate-950 text-center text-lg font-semibold text-slate-100",
  "transition-all duration-150 placeholder:text-slate-700",
  "hover:border-white/15",
  "focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
  "disabled:cursor-not-allowed disabled:opacity-40",
);

interface MfaOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
  autoFocus?: boolean;
}

export function MfaOtpInput({
  value,
  onChange,
  disabled = false,
  length = 6,
  autoFocus = true,
}: MfaOtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const initialFocusDone = useRef(false);
  const prevValueLengthRef = useRef(0);

  const focusIndex = useCallback((index: number) => {
    const el = inputsRef.current[index];
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  useEffect(() => {
    if (!autoFocus || disabled || initialFocusDone.current) return;
    initialFocusDone.current = true;
    focusIndex(0);
  }, [autoFocus, disabled, focusIndex]);

  useLayoutEffect(() => {
    if (disabled) return;
    const prevLen = prevValueLengthRef.current;
    const len = value.length;
    if (len > prevLen) {
      if (len < length) {
        focusIndex(len);
      } else {
        inputsRef.current[length - 1]?.blur();
      }
    }
    prevValueLengthRef.current = len;
  }, [value, disabled, length, focusIndex]);

  function applyDigits(next: string) {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (cleaned.length < length) {
      focusIndex(cleaned.length);
    } else {
      inputsRef.current[length - 1]?.blur();
    }
  }

  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length === 0) {
      const chars = value.split("");
      chars[index] = "";
      applyDigits(chars.join(""));
      return;
    }
    if (cleaned.length > 1) {
      const prefix = value.slice(0, index);
      applyDigits(prefix + cleaned);
      return;
    }
    const chars = value.padEnd(length, " ").split("");
    chars[index] = cleaned;
    applyDigits(chars.join("").replace(/\s/g, ""));
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) focusIndex(index - 1);
    if (e.key === "ArrowRight" && index < length - 1) focusIndex(index + 1);
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pasted) applyDigits(pasted);
  }

  return (
    <div className="flex justify-center gap-2" role="group" aria-label="Authentication code">
      {Array.from({ length }, (_, index) => (
        <input
          key={`otp-cell-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ""}
          onChange={(e) => { handleChange(index, e.target.value); }}
          onKeyDown={(e) => { handleKeyDown(index, e); }}
          onPaste={handlePaste}
          onFocus={(e) => { e.target.select(); }}
          className={cellClassName}
          aria-label={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </div>
  );
}
