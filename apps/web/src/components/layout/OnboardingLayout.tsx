import type { ReactNode } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Activity } from "lucide-react";

import { Spinner } from "@orvex/ui";

import { useAppEntryPath } from "@/hooks/use-app-entry";
import { useOrganizations } from "@/hooks/use-organizations";
import { useAuthStore } from "@/stores/auth.store";

export function OnboardingLayout() {
  const { apiUser, loading } = useAuthStore();
  const location = useLocation();
  const entryPath = useAppEntryPath();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();

  if (loading || orgsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (apiUser === null) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  const isCreatingOrganization =
    location.pathname.endsWith("/create") ||
    new URLSearchParams(location.search).get("create") === "1";

  if (
    !isCreatingOrganization &&
    organizations &&
    organizations.length > 0 &&
    location.pathname.startsWith("/app/onboarding")
  ) {
    return <Navigate to={entryPath} replace />;
  }

  return <Outlet />;
}

export function OnboardingShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(34,211,238,0.1), transparent)",
        }}
        aria-hidden="true"
      />

      <div className={`relative w-full ${wide ? "max-w-4xl" : "max-w-2xl"}`}>
        <div className="mb-8 flex flex-col items-center text-center">
          <Link
            to="/"
            className="mb-6 flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Activity size={14} className="text-slate-950" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-100">
              Orvex<span className="text-brand-400"> Monitor</span>
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
