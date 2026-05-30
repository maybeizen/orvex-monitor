import { NavLink, Outlet } from "react-router";
import { AlertTriangle, Shield, User } from "lucide-react";

import { cn } from "@orvex/ui";

import { AccountUnsavedProvider, useAccountUnsaved } from "@/contexts/account-unsaved.context";
import { AccountSaveBar } from "./AccountSaveBar";

const navItems = [
  { to: "/app/account/general", label: "General", icon: User },
  { to: "/app/account/security", label: "Security", icon: Shield },
  { to: "/app/account/danger", label: "Danger zone", icon: AlertTriangle },
] as const;

function AccountNavLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof User;
}) {
  const { dirty, requestNavigate } = useAccountUnsaved();

  return (
    <NavLink
      to={to}
      onClick={(e) => {
        if (dirty) {
          e.preventDefault();
          requestNavigate(to);
        }
      }}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-brand-500/10 text-brand-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.2)]"
            : "text-slate-500 hover:bg-white/4 hover:text-slate-200",
          dirty && "ring-1 ring-red-500/20",
        )
      }
    >
      <Icon size={16} strokeWidth={1.75} />
      {label}
    </NavLink>
  );
}

function AccountLayoutInner() {
  const { dirty, pendingPath } = useAccountUnsaved();

  return (
    <div className="account-page-enter mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">Account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your profile, security, and account preferences
        </p>
      </div>

      {(dirty || pendingPath) && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/8 px-3 py-2 text-xs text-red-300">
          <span className="size-1.5 shrink-0 rounded-full bg-red-400" />
          {pendingPath
            ? "You tried to leave General with unsaved changes."
            : "Unsaved changes on General — save or discard before switching tabs."}
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 gap-1 lg:w-52 lg:flex-col">
          {navItems.map((item) => (
            <AccountNavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="account-panel-enter relative min-w-0 flex-1 pb-20">
          <Outlet />
          <AccountSaveBar />
        </div>
      </div>
    </div>
  );
}

export function AccountLayout() {
  return (
    <AccountUnsavedProvider>
      <AccountLayoutInner />
    </AccountUnsavedProvider>
  );
}
