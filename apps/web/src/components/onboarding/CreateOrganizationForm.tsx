import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  Check,
  Crown,
  Sparkles,
  Upload,
  Users,
} from "lucide-react";

import { PLAN_LIMITS, SubscriptionPlan } from "@orvex/types";
import {
  Button,
  ErrorMessage,
  FormField,
  Input,
  Modal,
  useToast,
} from "@orvex/ui";

import { SlugAvailabilityField } from "@/components/onboarding/SlugAvailabilityField";
import { useCreateOrganization } from "@/hooks/use-create-organization";
import { useSlugAvailability } from "@/hooks/use-slug-availability";
import {
  defaultOrganizationName,
  defaultOrganizationSlug,
} from "@/lib/org-form";
import { uploadOrganizationIcon } from "@/lib/org-icons";
import { orgPath, setLastOrgSlug } from "@/lib/org-paths";
import { isValidSlug, slugify } from "@/lib/slug";
import { useAuthStore } from "@/stores/auth.store";

type IconMode = "none" | "url" | "upload";
type OrgType = "personal" | "team";

const planCards = [
  {
    plan: SubscriptionPlan.Free,
    title: "Free",
    price: "$0",
    cadence: "forever",
    description: "Perfect for personal projects and small teams getting started.",
    icon: Sparkles,
    highlight: "Best to start",
  },
  {
    plan: SubscriptionPlan.Pro,
    title: "Pro",
    price: "$29",
    cadence: "per month",
    description: "More monitors, faster checks, and soft usage limits.",
    icon: Crown,
    highlight: null,
  },
  {
    plan: SubscriptionPlan.Enterprise,
    title: "Enterprise",
    price: "Custom",
    cadence: "contact us",
    description: "High-volume monitoring with generous limits and support.",
    icon: Building2,
    highlight: null,
  },
] as const;

const orgTypeOptions = [
  {
    value: "personal" as const,
    label: "Personal",
    icon: Building2,
    description: "Just you. Best for solo projects, homelab setups, and personal sites.",
  },
  {
    value: "team" as const,
    label: "Team",
    icon: Users,
    description: "Shared workspace with members, roles, and permission controls.",
  },
];

interface CreateOrganizationFormProps {
  onCancel?: () => void;
}

export function CreateOrganizationForm({ onCancel }: CreateOrganizationFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const apiUser = useAuthStore((s) => s.apiUser);
  const createOrganization = useCreateOrganization();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [iconMode, setIconMode] = useState<IconMode>("none");
  const [iconUrl, setIconUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreviewUrl, setIconPreviewUrl] = useState<string | null>(null);
  const [orgType, setOrgType] = useState<OrgType>("personal");
  const [plan, setPlan] = useState<SubscriptionPlan>(SubscriptionPlan.Free);
  const [checkoutStubOpen, setCheckoutStubOpen] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [iconUploading, setIconUploading] = useState(false);

  useEffect(() => {
    if (!apiUser) return;
    setName(defaultOrganizationName(apiUser.username));
    setSlug(defaultOrganizationSlug(apiUser.username));
  }, [apiUser]);

  useEffect(() => {
    if (!iconFile) {
      setIconPreviewUrl(null);
      return;
    }

    const preview = URL.createObjectURL(iconFile);
    setIconPreviewUrl(preview);

    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [iconFile]);

  const slugAvailability = useSlugAvailability(slug);
  const selectedPlanLimits = useMemo(() => PLAN_LIMITS[plan], [plan]);
  const slugReady = isValidSlug(slug.trim());
  const slugBlocked =
    slugReady &&
    (slugAvailability.isChecking ||
      slugAvailability.available === false ||
      slugAvailability.isError);

  async function resolveIconUrl(): Promise<string | undefined> {
    if (iconMode === "none") return undefined;
    if (iconMode === "url") {
      return iconUrl.trim().length > 0 ? iconUrl.trim() : undefined;
    }
    if (!iconFile) return undefined;

    setIconUploading(true);
    try {
      return await uploadOrganizationIcon(iconFile);
    } finally {
      setIconUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!slugReady) {
      setError("Choose a valid slug (2–50 characters, letters, numbers, or dashes).");
      return;
    }

    if (slugAvailability.available === false) {
      setError("That slug is already taken.");
      return;
    }

    if (slugAvailability.isChecking) {
      setError("Still checking slug availability. Please wait a moment.");
      return;
    }

    try {
      const icon = await resolveIconUrl();
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        orgType,
        plan,
        ...(icon ? { icon } : {}),
      };
      const result = await createOrganization.mutateAsync(payload);

      const organization = result.data.organization;
      setLastOrgSlug(organization.slug);

      if (result.data.checkoutStub) {
        setCreatedSlug(organization.slug);
        setCheckoutStubOpen(true);
        return;
      }

      toast({ variant: "success", title: "Organization created" });
      navigate(orgPath(organization.slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  }

  function handleCheckoutStubClose() {
    setCheckoutStubOpen(false);
    if (createdSlug) {
      navigate(orgPath(createdSlug));
    }
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50">
          Create your organization
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Set up a workspace to manage monitors, alerts, and team access.
        </p>
      </div>

      <form className="space-y-8" onSubmit={(event) => { void handleSubmit(event); }}>
        <FormField label="Organization name">
          <Input
            id="org-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugTouched) {
                setSlug(slugify(event.target.value));
              }
            }}
            required
          />
        </FormField>

        <SlugAvailabilityField
          slug={slug}
          onSlugChange={(value) => { setSlug(slugify(value)); }}
          onSlugTouched={() => { setSlugTouched(true); }}
          canCheck={slugAvailability.canCheck}
          available={slugAvailability.available}
          isChecking={slugAvailability.isChecking}
          isError={slugAvailability.isError}
        />

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-200">Icon</p>
          <div className="flex flex-wrap gap-2">
            {(["none", "url", "upload"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={iconMode === mode ? "primary" : "secondary"}
                onClick={() => { setIconMode(mode); }}
              >
                {mode === "none" ? "None" : mode === "url" ? "URL" : "Upload"}
              </Button>
            ))}
          </div>
          {iconMode === "url" ? (
            <Input
              placeholder="https://example.com/icon.png"
              value={iconUrl}
              onChange={(event) => { setIconUrl(event.target.value); }}
            />
          ) : null}
          {iconMode === "upload" ? (
            <div className="space-y-3">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/2 px-4 py-6 transition-colors hover:border-brand-400/30 hover:bg-brand-400/5">
                {iconPreviewUrl ? (
                  <img
                    src={iconPreviewUrl}
                    alt="Icon preview"
                    className="size-16 rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <span className="flex size-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400">
                    <Upload size={20} />
                  </span>
                )}
                <span className="text-sm font-medium text-slate-200">
                  {iconFile ? iconFile.name : "Choose an image"}
                </span>
                <span className="text-xs text-slate-500">PNG, JPEG, WebP, or SVG · max 512 KB</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="sr-only"
                  onChange={(event) => {
                    setIconFile(event.target.files?.[0] ?? null);
                  }}
                />
              </label>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-slate-200">Organization type</p>
            <p className="mt-1 text-xs text-slate-500">
              Personal orgs are for individual use; team orgs support inviting members with roles.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {orgTypeOptions.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setOrgType(value); }}
                className={`rounded-xl border px-4 py-4 text-left transition-all ${
                  orgType === value
                    ? "border-brand-400/50 bg-brand-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.15)]"
                    : "border-white/10 bg-white/3 hover:border-white/15"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex size-8 items-center justify-center rounded-lg ${
                      orgType === value ? "bg-brand-400/15 text-brand-300" : "bg-white/5 text-slate-400"
                    }`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-semibold text-slate-100">{label}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">{description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-200">Plan</p>
            <p className="mt-1 text-xs text-slate-500">
              Start on Free today. Paid plans can be selected now and will activate when checkout launches.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {planCards.map(({ plan: cardPlan, title, price, cadence, description, icon: Icon, highlight }) => {
              const limits = PLAN_LIMITS[cardPlan];
              const selected = plan === cardPlan;

              return (
                <button
                  key={cardPlan}
                  type="button"
                  onClick={() => { setPlan(cardPlan); }}
                  className={`group relative flex h-full flex-col rounded-2xl border p-5 text-left transition-all ${
                    selected
                      ? "border-brand-400/50 bg-linear-to-b from-brand-400/12 to-transparent shadow-[0_0_0_1px_rgba(34,211,238,0.12)]"
                      : "border-white/10 bg-slate-950/40 hover:border-white/15 hover:bg-white/3"
                  }`}
                >
                  {highlight ? (
                    <span className="absolute -top-2.5 left-4 rounded-full border border-brand-400/30 bg-slate-950 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-300">
                      {highlight}
                    </span>
                  ) : null}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex size-9 items-center justify-center rounded-xl ${
                          selected ? "bg-brand-400/15 text-brand-300" : "bg-white/5 text-slate-400"
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{title}</p>
                        <p className="text-[11px] text-slate-500">{cadence}</p>
                      </div>
                    </div>
                    {selected ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-brand-400 text-slate-950">
                        <Check size={14} />
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-end gap-1">
                    <span className="text-2xl font-bold tracking-tight text-slate-50">{price}</span>
                    {cardPlan !== SubscriptionPlan.Enterprise ? (
                      <span className="pb-1 text-xs text-slate-500">/mo</span>
                    ) : null}
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">{description}</p>

                  <ul className="mt-4 space-y-2 border-t border-white/8 pt-4 text-xs text-slate-400">
                    <li>{limits.maxMonitors} monitors</li>
                    <li>{limits.maxUsers} members</li>
                    <li>{limits.maxAlertChannels} alert channels</li>
                    <li>{limits.minCheckIntervalSec}s minimum check interval</li>
                  </ul>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-xs text-slate-400">
            <span className="font-medium text-slate-300">{planCards.find((c) => c.plan === plan)?.title} plan</span>
            {" · "}
            {selectedPlanLimits.maxMonitors} monitors, {selectedPlanLimits.maxUsers} members,{" "}
            {selectedPlanLimits.minCheckIntervalSec}s checks
          </div>
        </div>

        {error ? <ErrorMessage>{error}</ErrorMessage> : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="submit"
            loading={createOrganization.isPending || iconUploading}
            disabled={slugBlocked}
          >
            Create organization
          </Button>
        </div>
      </form>

      <Modal open={checkoutStubOpen} onClose={handleCheckoutStubClose} size="sm">
        <Modal.Header title="Paid plans coming soon" onClose={handleCheckoutStubClose} />
        <Modal.Body>
          <p className="text-sm text-slate-400">
            Checkout for Pro and Enterprise is not available yet. Your organization was created on
            the Free plan so you can continue setup.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleCheckoutStubClose}>Continue to dashboard</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
