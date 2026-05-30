import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Input, Label } from "@orvex/ui";

import { isValidSlug } from "@/lib/slug";

interface SlugAvailabilityFieldProps {
  slug: string;
  onSlugChange: (value: string) => void;
  onSlugTouched: () => void;
  canCheck: boolean;
  available: boolean | undefined;
  isChecking: boolean;
  isError: boolean;
}

export function SlugAvailabilityField({
  slug,
  onSlugChange,
  onSlugTouched,
  canCheck,
  available,
  isChecking,
  isError,
}: SlugAvailabilityFieldProps) {
  const showTaken = canCheck && !isChecking && available === false;
  const showAvailable = canCheck && !isChecking && available === true;

  let statusLabel = "Enter at least 2 characters using lowercase letters, numbers, or dashes.";
  let statusClass = "border-white/10 bg-white/3 text-slate-400";

  if (!canCheck && slug.length > 0) {
    statusLabel = "Slug must be 2–50 characters: lowercase letters, numbers, and dashes only.";
    statusClass = "border-amber-500/30 bg-amber-500/10 text-amber-200";
  } else if (isChecking) {
    statusLabel = "Checking availability…";
    statusClass = "border-brand-400/30 bg-brand-400/10 text-brand-200";
  } else if (isError) {
    statusLabel = "Could not verify slug availability. Try again in a moment.";
    statusClass = "border-amber-500/30 bg-amber-500/10 text-amber-200";
  } else if (showTaken) {
    statusLabel = "This slug is already taken — choose another.";
    statusClass = "border-red-500/40 bg-red-500/10 text-red-200";
  } else if (showAvailable) {
    statusLabel = "This slug is available.";
    statusClass = "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="org-slug" required>
        URL slug
      </Label>
      <div className="relative">
        <Input
          id="org-slug"
          value={slug}
          onChange={(event) => {
            onSlugTouched();
            onSlugChange(event.target.value);
          }}
          required
          aria-invalid={showTaken}
          className={
            showTaken
              ? "border-red-500/50 pr-10 focus:border-red-400"
              : showAvailable
                ? "border-emerald-500/40 pr-10 focus:border-emerald-400"
                : "pr-10"
          }
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          {isChecking ? (
            <Loader2 size={16} className="animate-spin text-brand-300" aria-hidden="true" />
          ) : showAvailable ? (
            <CheckCircle2 size={16} className="text-emerald-400" aria-hidden="true" />
          ) : showTaken ? (
            <XCircle size={16} className="text-red-400" aria-hidden="true" />
          ) : isError ? (
            <AlertCircle size={16} className="text-amber-400" aria-hidden="true" />
          ) : null}
        </span>
      </div>

      <div
        className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${statusClass}`}
        role="status"
        aria-live="polite"
      >
        {isChecking ? (
          <Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" aria-hidden="true" />
        ) : showAvailable ? (
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        ) : showTaken || isError ? (
          <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        ) : null}
        <span>{statusLabel}</span>
      </div>

      {isValidSlug(slug) ? (
        <p className="font-mono text-[11px] text-slate-500">
          Dashboard URL:{" "}
          <span className="text-slate-300">/app/org/{slug}</span>
        </p>
      ) : null}
    </div>
  );
}
