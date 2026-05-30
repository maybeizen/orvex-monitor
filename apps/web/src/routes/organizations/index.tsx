import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";

import type { OrganizationListItem } from "@orvex/types";
import { SubscriptionPlan } from "@orvex/types";
import { Badge, Button, Card, Input, Spinner } from "@orvex/ui";

import { OrganizationIcon } from "@/components/organizations/OrganizationIcon";
import { useOrganizations } from "@/hooks/use-organizations";
import { orgPath } from "@/lib/org-paths";

function planLabel(plan: SubscriptionPlan): string {
  switch (plan) {
    case SubscriptionPlan.Pro:
      return "Pro";
    case SubscriptionPlan.Enterprise:
      return "Enterprise";
    default:
      return "Free";
  }
}

function OrganizationSettingsMenu({
  organization,
  onClose,
}: {
  organization: OrganizationListItem;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      role="menu"
      className="absolute right-0 top-full z-20 mt-1 min-w-40 rounded-lg border border-white/10 bg-slate-950 p-1 shadow-xl shadow-black/40"
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          navigate(orgPath(organization.slug));
        }}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-100"
      >
        <Building2 size={14} />
        Open workspace
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          navigate(orgPath(organization.slug, "settings"));
        }}
        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-100"
      >
        <Settings size={14} />
        Settings
      </button>
    </div>
  );
}

function OrganizationCard({ organization }: { organization: OrganizationListItem }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <Card
      padding="md"
      className="group relative transition-all hover:border-white/12 hover:bg-white/2"
    >
      <button
        type="button"
        onClick={() => { navigate(orgPath(organization.slug)); }}
        className="flex w-full flex-col items-start text-left"
      >
        <div className="flex w-full items-start gap-3">
          <OrganizationIcon organization={organization} size="lg" className="rounded-xl" />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="truncate text-base font-semibold text-slate-100">
              {organization.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-500">
              /{organization.slug}
            </p>
          </div>
        </div>

        <div className="mt-4 flex w-full flex-wrap items-center gap-2">
          <Badge variant="neutral">{planLabel(organization.plan)}</Badge>
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} />
            {organization.memberCount}{" "}
            {organization.memberCount === 1 ? "member" : "members"}
          </span>
        </div>
      </button>

      <div ref={menuRef} className="absolute right-3 top-3">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label={`${organization.name} settings`}
          onClick={(event) => {
            event.stopPropagation();
            setMenuOpen((value) => !value);
          }}
          className="flex size-8 items-center justify-center rounded-lg border border-transparent text-slate-500 transition-colors hover:border-white/10 hover:bg-white/5 hover:text-slate-200"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen ? (
          <OrganizationSettingsMenu
            organization={organization}
            onClose={() => { setMenuOpen(false); }}
          />
        ) : null}
      </div>
    </Card>
  );
}

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { data: organizations, isLoading } = useOrganizations();
  const [search, setSearch] = useState("");

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || !organizations) return organizations ?? [];

    return organizations.filter(
      (organization) =>
        organization.name.toLowerCase().includes(query) ||
        organization.slug.toLowerCase().includes(query),
    );
  }, [organizations, search]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Your organizations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Switch between workspaces or create a new one.
          </p>
        </div>
        <Button onClick={() => { navigate("/app/onboarding?create=1"); }}>
          <Plus size={16} />
          Create organization
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); }}
            placeholder="Search organizations..."
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredOrganizations.length === 0 ? (
        <Card padding="lg" className="flex flex-col items-center py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-white/8 bg-white/4">
            <Building2 size={20} className="text-slate-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-slate-300">
            {search.trim() ? "No organizations match your search" : "No organizations yet"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {search.trim()
              ? "Try a different name or slug."
              : "Create your first organization to start monitoring."}
          </p>
          {!search.trim() ? (
            <Button
              className="mt-5"
              onClick={() => { navigate("/app/onboarding?create=1"); }}
            >
              <Plus size={16} />
              Create organization
            </Button>
          ) : null}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredOrganizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}
    </div>
  );
}
