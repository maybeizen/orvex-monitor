import { Link, Navigate, Outlet, useLocation } from "react-router";
import { Activity } from "lucide-react";

import { Spinner } from "@orvex/ui";

import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { useAuthStore } from "@/stores/auth.store";

export function AppHubLayout() {
  const { apiUser, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
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

  if (
    !apiUser.emailVerified &&
    location.pathname !== "/app/verify-email"
  ) {
    return <Navigate to="/app/verify-email" replace />;
  }

  if (apiUser.pendingDeletion && !location.pathname.startsWith("/app/account/danger")) {
    return <Navigate to="/app/account/danger" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <span className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_0_12px_rgba(34,211,238,0.25)]">
              <Activity size={14} className="text-slate-950" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-slate-100">
              Orvex<span className="text-brand-400"> Monitor</span>
            </span>
          </Link>

          <UserProfileMenu user={apiUser} variant="landing" />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
