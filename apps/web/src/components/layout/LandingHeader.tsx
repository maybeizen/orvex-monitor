import { Link, useNavigate } from "react-router";
import { Activity } from "lucide-react";

import { Button, Spinner } from "@orvex/ui";

import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { useAuthStore } from "@/stores/auth.store";

export function LandingHeader() {
  const navigate = useNavigate();
  const { apiUser, loading } = useAuthStore();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between rounded-xl border border-white/10 bg-slate-950 px-4">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <span className="flex size-6 items-center justify-center rounded-md bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_0_8px_rgba(34,211,238,0.25)]">
            <Activity size={12} className="text-slate-950" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-100">
            Orvex<span className="text-brand-400"> Monitor</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {["#features", "#how-it-works", "#pricing"].map((href, i) => (
            <a
              key={href}
              href={href}
              className="text-sm text-slate-500 transition-colors hover:text-slate-200"
            >
              {["Features", "How it works", "Pricing"][i]}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {loading ? (
            <Spinner size="sm" />
          ) : apiUser ? (
            <>
              <Button size="sm" onClick={() => navigate("/app/organizations")}>
                Dashboard
              </Button>
              <UserProfileMenu user={apiUser} />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-sm text-slate-500 transition-colors hover:text-slate-200 sm:block"
              >
                Sign in
              </Link>
              <Button size="sm" onClick={() => navigate("/signup")}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
