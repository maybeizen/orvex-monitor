import { NavLink } from "react-router";
import {
  Activity,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { cn } from "@orvex/ui";

import { UserProfileMenu } from "@/components/layout/UserProfileMenu";
import { orgPath } from "@/lib/org-paths";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarStore } from "@/stores/sidebar.store";

function SidebarTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full ml-2.5 z-50 whitespace-nowrap rounded-md border border-white/10 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 opacity-0 shadow-lg shadow-black/30 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {label}
    </span>
  );
}

interface AppSidebarProps {
  orgSlug: string;
}

export function AppSidebar({ orgSlug }: AppSidebarProps) {
  const expanded = useSidebarStore((s) => s.expanded);
  const toggle = useSidebarStore((s) => s.toggle);
  const apiUser = useAuthStore((s) => s.apiUser);

  const navItems = [
    {
      to: orgPath(orgSlug),
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: orgPath(orgSlug, "monitors"),
      label: "Monitors",
      icon: Activity,
    },
    {
      to: orgPath(orgSlug, "incidents"),
      label: "Incidents",
      icon: AlertTriangle,
    },
    {
      to: orgPath(orgSlug, "settings"),
      label: "Settings",
      icon: Settings,
    },
  ] as const;

  return (
    <nav
      id="app-sidebar-nav"
      aria-label="App navigation"
        className={cn(
        "relative z-10 flex shrink-0 flex-col border-r border-white/6 bg-[#0a0f1e] py-3 transition-[width] duration-200 ease-out",
        expanded ? "w-52 px-3" : "w-14 px-2",
      )}
    >
      <ul className={cn("flex flex-1 flex-col gap-1", expanded ? "w-full" : "items-center")}>
        {navItems.map(({ to, label, icon: Icon, ...rest }) => (
          <li key={to} className={expanded ? "w-full" : ""}>
            <NavLink
              to={to}
              {...("end" in rest ? { end: rest.end } : {})}
              aria-label={label}
              title={expanded ? undefined : label}
              className={({ isActive }: { isActive: boolean }) =>
                cn(
                  "group relative flex cursor-pointer items-center rounded-lg transition-all duration-150",
                  expanded ? "gap-3 px-3 py-2" : "size-9 justify-center",
                  isActive
                    ? "bg-brand-400/10 text-brand-400 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.15)]"
                    : "text-slate-500 hover:bg-white/5 hover:text-slate-300",
                )
              }
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0" />
              {expanded ? (
                <span className="truncate text-sm font-medium">{label}</span>
              ) : (
                <SidebarTooltip label={label} />
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-auto flex flex-col gap-2",
          expanded ? "w-full items-stretch" : "items-center",
        )}
      >
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls="app-sidebar-nav"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          className={cn(
            "group relative flex cursor-pointer items-center rounded-lg text-slate-600 transition-all hover:bg-white/5 hover:text-slate-300",
            expanded ? "gap-3 px-3 py-2" : "size-9 justify-center",
          )}
        >
          {expanded ? (
            <>
              <ChevronLeft size={16} strokeWidth={1.75} />
              <span className="text-sm font-medium">Collapse</span>
            </>
          ) : (
            <>
              <ChevronRight size={16} strokeWidth={1.75} />
              <SidebarTooltip label="Expand sidebar" />
            </>
          )}
        </button>

        {apiUser ? <UserProfileMenu user={apiUser} variant="app" orgSlug={orgSlug} /> : null}
      </div>
    </nav>
  );
}
