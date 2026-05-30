import { useLocation } from "react-router";

import { BreadcrumbOrgSwitcher } from "@/components/organizations/BreadcrumbOrgSwitcher";
import { OrvexMark } from "@/components/layout/OrvexMark";
import { useOrganization } from "@/hooks/use-organization";

interface AppTopBarProps {
  orgSlug: string;
  pageLabel?: string;
}

function segmentLabel(pathname: string, orgSlug: string): string | null {
  const base = `/app/org/${orgSlug}`;
  if (pathname === base) return null;
  if (pathname.startsWith(`${base}/monitors/`)) return "Monitor";
  if (pathname.startsWith(`${base}/monitors`)) return "Monitors";
  if (pathname.startsWith(`${base}/incidents`)) return "Incidents";
  if (pathname.startsWith(`${base}/settings`)) return "Settings";
  return null;
}

function BreadcrumbSeparator() {
  return (
    <span className="select-none text-slate-600" aria-hidden="true">
      /
    </span>
  );
}

export function AppTopBar({ orgSlug, pageLabel }: AppTopBarProps) {
  const location = useLocation();
  const { data: organization, isLoading } = useOrganization(orgSlug);
  const section = pageLabel ?? segmentLabel(location.pathname, orgSlug);

  return (
    <header className="relative z-40 shrink-0 border-b border-white/6 bg-slate-950/95 backdrop-blur-md">
      <nav
        aria-label="Breadcrumb"
        className="flex h-12 min-w-0 items-center gap-2.5 pl-3 pr-4 text-sm sm:pl-3.5 sm:pr-5"
      >
        <OrvexMark />
        <BreadcrumbSeparator />
        <BreadcrumbOrgSwitcher
          orgSlug={orgSlug}
          organizationName={organization?.name}
          organizationIcon={organization?.icon}
          organizationPlan={organization?.plan}
          isLoading={isLoading}
        />
        {section ? (
          <>
            <BreadcrumbSeparator />
            <span className="truncate text-slate-400">{section}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}
