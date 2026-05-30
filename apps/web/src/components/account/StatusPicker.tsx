import { UserStatus } from "@orvex/types";
import { cn } from "@orvex/ui";

const options = [
  { value: UserStatus.Online, label: "Online", color: "bg-emerald-400" },
  { value: UserStatus.Away, label: "Away", color: "bg-amber-400" },
  { value: UserStatus.DoNotDisturb, label: "Do not disturb", color: "bg-rose-400" },
  { value: UserStatus.Offline, label: "Offline", color: "bg-slate-500" },
] as const;

interface StatusPickerProps {
  value: UserStatus;
  onChange: (status: UserStatus) => void;
  disabled?: boolean;
}

export function StatusPicker({ value, onChange, disabled }: StatusPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => { onChange(opt.value); }}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all duration-200",
            value === opt.value
              ? "border-brand-400/30 bg-brand-500/10 text-brand-200"
              : "border-white/8 bg-white/2 text-slate-400 hover:border-white/12 hover:text-slate-200",
            disabled && "opacity-50",
          )}
        >
          <span className={cn("size-2 rounded-full", opt.color)} />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
