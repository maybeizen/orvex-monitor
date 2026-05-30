import { Navigate, Outlet, useParams } from "react-router";

import { Spinner } from "@orvex/ui";

import { useOrganization } from "@/hooks/use-organization";
import { useOrganizations } from "@/hooks/use-organizations";

export function OrgRouteGuard() {
  const { slug } = useParams<{ slug: string }>();
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const { isLoading: orgLoading, isError } = useOrganization(slug);

  if (orgsLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return <Navigate to="/app/onboarding" replace />;
  }

  if (!slug) {
    return <Navigate to="/app" replace />;
  }

  if (orgLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
