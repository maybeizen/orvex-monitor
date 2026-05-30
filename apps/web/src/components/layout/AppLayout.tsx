import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useParams } from "react-router";

import { Spinner } from "@orvex/ui";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { useAuthStore } from "@/stores/auth.store";

export function AppLayout() {
  const { apiUser, loading } = useAuthStore();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (apiUser === null) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (!slug) {
    return <Navigate to="/app" replace />;
  }

  if (!apiUser.emailVerified) {
    return <Navigate to="/app/verify-email" replace />;
  }

  if (apiUser.pendingDeletion) {
    return <Navigate to="/app/account/danger" replace />;
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <AppTopBar orgSlug={slug} />
      <div className="relative flex min-h-0 flex-1">
        <AppSidebar orgSlug={slug} />
        <main className="min-w-0 flex-1 overflow-auto">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Spinner size="lg" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
