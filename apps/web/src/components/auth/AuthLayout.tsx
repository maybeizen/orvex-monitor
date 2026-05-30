import type { ReactNode } from "react";
import { Link, Navigate } from "react-router";
import { Activity } from "lucide-react";

import { Card, Spinner } from "@orvex/ui";

import { useAuthStore } from "@/stores/auth.store";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { apiUser, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (apiUser) {
    return <Navigate to="/app" replace />;
  }

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

      <div className="relative w-full max-w-md">
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <Card padding="lg" className="border-white/10 bg-slate-950/80 backdrop-blur-sm">
          {children}
        </Card>

        {footer ? <div className="mt-6 text-center text-sm text-slate-500">{footer}</div> : null}

        <p className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs font-medium text-slate-600 transition-colors hover:text-brand-400"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
