import { memo, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { cn } from "@orvex/ui";

interface MfaPasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
}

export const MfaPasswordField = memo(function MfaPasswordField({
  value,
  onChange,
  disabled = false,
  label = "Password",
}: MfaPasswordFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          disabled={disabled}
          autoComplete="current-password"
          onChange={(e) => { onChange(e.target.value); }}
          className={cn(
            "h-11 w-full rounded-lg border border-white/10 bg-slate-950 px-3 pr-10 text-sm text-slate-100",
            "transition-all duration-150 placeholder:text-slate-600",
            "hover:border-white/15",
            "focus:border-brand-400/50 focus:outline-none focus:ring-2 focus:ring-brand-400/30",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
          onClick={() => { setShow((v) => !v); }}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
});
