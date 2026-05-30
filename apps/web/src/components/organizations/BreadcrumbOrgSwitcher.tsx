import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { ChevronsUpDown, Plus } from "lucide-react";

import type { OrganizationListItem } from "@orvex/types";
import { SubscriptionPlan } from "@orvex/types";
import { cn, Spinner } from "@orvex/ui";

import { OrganizationIcon } from "@/components/organizations/OrganizationIcon";
import { useOrganizations } from "@/hooks/use-organizations";

interface BreadcrumbOrgSwitcherProps {
  orgSlug: string;
  organizationName?: string | undefined;
  organizationIcon?: string | undefined;
  organizationPlan?: SubscriptionPlan | undefined;
  isLoading?: boolean;
}

function planLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case SubscriptionPlan.Pro:
      return "PRO";
    case SubscriptionPlan.Enterprise:
      return "ENTERPRISE";
    default:
      return "FREE";
  }
}

function switchOrgPath(pathname: string, currentSlug: string, nextSlug: string): string {
  const base = `/app/org/${currentSlug}`;
  const nextBase = `/app/org/${nextSlug}`;

  if (pathname === base) return nextBase;
  if (pathname.startsWith(`${base}/monitors/`)) return `${nextBase}/monitors`;
  if (pathname.startsWith(`${base}/monitors`)) return `${nextBase}/monitors`;
  if (pathname.startsWith(`${base}/incidents`)) return `${nextBase}/incidents`;
  if (pathname.startsWith(`${base}/settings`)) return `${nextBase}/settings`;
  return nextBase;
}

export function BreadcrumbOrgSwitcher({
  orgSlug,
  organizationName,
  organizationIcon,
  organizationPlan,
  isLoading = false,
}: BreadcrumbOrgSwitcherProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOrg = organizations?.find((org) => org.slug === orgSlug);
  const displayOrg: Pick<OrganizationListItem, "name" | "icon"> = currentOrg ?? {
    name: organizationName ?? "Organization",
    ...(organizationIcon ? { icon: organizationIcon } : {}),
  };
  const displayPlan = currentOrg?.plan ?? organizationPlan ?? SubscriptionPlan.Free;
  const otherOrgs = (organizations ?? []).filter((org) => org.slug !== orgSlug);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelect(nextSlug: string) {
    setOpen(false);
    navigate(switchOrgPath(location.pathname, orgSlug, nextSlug));
  }

  if (isLoading || orgsLoading) {
    return <Spinner size="sm" />;
  }

  return (
    <div ref={containerRef} className="relative min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => { setOpen((value) => !value); }}
        className={cn(
          "flex max-w-[min(100vw-12rem,24rem)] items-center gap-2 rounded-md px-1 py-0.5 transition-colors",
          "hover:bg-white/5",
          open && "bg-white/5",
        )}
      >
        <OrganizationIcon organization={displayOrg} size="xs" />
        <span className="truncate font-medium text-slate-100">{displayOrg.name}</span>
        <span className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-400">
          {planLabel(displayPlan)}
        </span>
        <ChevronsUpDown
          size={14}
          className={cn(
            "shrink-0 text-slate-500 transition-transform duration-200",
            open && "rotate-180 text-brand-400",
          )}
        />
      </button>

      <div
        role="listbox"
        aria-hidden={!open}
        className={cn(
          "absolute top-[calc(100%+0.375rem)] z-50 w-64 rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-2xl shadow-black/50",
          "origin-top transition-all duration-200 ease-out",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Switch organization
        </p>

        <div className="space-y-0.5">
          {otherOrgs.map((organization) => (
            <button
              key={organization.id}
              type="button"
              role="option"
              onClick={() => { handleSelect(organization.slug); }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
            >
              <OrganizationIcon organization={organization} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                {organization.name}
              </span>
            </button>
          ))}

          {otherOrgs.length === 0 ? (
            <p className="px-2 py-2 text-xs text-slate-500">No other organizations</p>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/app/onboarding?create=1");
            }}
            className="mt-0.5 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-brand-300 transition-colors hover:bg-brand-400/8"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-brand-400/30 bg-brand-400/10">
              <Plus size={13} />
            </span>
            <span>Create organization</span>
          </button>
        </div>
      </div>
    </div>
  );
}
