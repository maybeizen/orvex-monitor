import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Building2,
  ChevronDown,
  ChevronsUpDown,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Plus,
  User,
} from "lucide-react";

import type { Organization, PublicUser } from "@orvex/types";
import { cn, Spinner } from "@orvex/ui";

import { StatusAvatar } from "@/components/account/StatusAvatar";
import { OrganizationIcon } from "@/components/organizations/OrganizationIcon";

import { getAvatarSrc } from "@/lib/user-avatar";
import { orgPath } from "@/lib/org-paths";
import { useOrganizations } from "@/hooks/use-organizations";
import { useAuthStore } from "@/stores/auth.store";
import { useSidebarStore } from "@/stores/sidebar.store";

interface MenuItem {
  label: string;
  icon: typeof User;
  onClick: () => void;
  destructive?: boolean;
}

interface UserProfileMenuProps {
  user: PublicUser;
  variant?: "landing" | "app";
  orgSlug?: string;
}

function OrganizationSwitcher({
  organizations,
  orgSlug,
  isLoading,
  menuOpen,
  onSelect,
  onCreate,
}: {
  organizations: Organization[] | undefined;
  orgSlug?: string | undefined;
  isLoading: boolean;
  menuOpen: boolean;
  onSelect: (organization: Organization) => void;
  onCreate: () => void;
}) {
  const [listOpen, setListOpen] = useState(false);
  const currentOrg = organizations?.find((org) => org.slug === orgSlug);
  const otherOrgs = (organizations ?? []).filter((org) => org.slug !== orgSlug);

  useEffect(() => {
    if (!menuOpen) {
      setListOpen(false);
    }
  }, [menuOpen]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/8 bg-slate-900/50">
      <div className="flex items-center gap-2 p-2">
        {isLoading ? (
          <div className="flex flex-1 justify-center py-2">
            <Spinner size="sm" />
          </div>
        ) : currentOrg ? (
          <>
            <OrganizationIcon organization={currentOrg} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                Organization
              </p>
              <p className="truncate text-sm font-medium text-slate-100">
                {currentOrg.name}
              </p>
            </div>
            <button
              type="button"
              aria-expanded={listOpen}
              aria-label={listOpen ? "Close organization list" : "Switch organization"}
              onClick={() => { setListOpen((value) => !value); }}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-slate-400 transition-all duration-200",
                "hover:border-white/12 hover:bg-white/8 hover:text-slate-200",
                listOpen && "border-brand-400/25 bg-brand-400/10 text-brand-300",
              )}
            >
              <ChevronsUpDown
                size={15}
                strokeWidth={1.75}
                className={cn(
                  "transition-transform duration-200 ease-out",
                  listOpen && "rotate-180",
                )}
              />
            </button>
          </>
        ) : (
          <p className="flex-1 px-1 py-2 text-sm text-slate-500">No organization</p>
        )}
      </div>

      <div
        className={cn(
          "org-switcher-list",
          listOpen && !isLoading ? "org-switcher-list-open" : "org-switcher-list-closed",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/6 px-2 pb-2 pt-1.5">
            <div className="space-y-0.5">
              {otherOrgs.map((organization, index) => (
                <button
                  key={organization.id}
                  type="button"
                  onClick={() => {
                    setListOpen(false);
                    onSelect(organization);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-[opacity,transform,background-color] duration-200 ease-out hover:bg-white/5",
                    listOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                  )}
                  style={{ transitionDelay: listOpen ? `${index * 35 + 40}ms` : "0ms" }}
                >
                  <OrganizationIcon organization={organization} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">
                    {organization.name}
                  </span>
                </button>
              ))}

              {otherOrgs.length === 0 ? (
                <p className="px-2 py-2 text-xs text-slate-500">No other organizations</p>
              ) : null}

              <button
                type="button"
                onClick={() => {
                  setListOpen(false);
                  onCreate();
                }}
                className={cn(
                  "mt-1 flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-brand-300 transition-[opacity,transform,background-color] duration-200 ease-out hover:bg-brand-400/8",
                  listOpen ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
                )}
                style={{
                  transitionDelay: listOpen ? `${otherOrgs.length * 35 + 40}ms` : "0ms",
                }}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-brand-400/30 bg-brand-400/10">
                  <Plus size={13} />
                </span>
                <span>Create organization</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function UserProfileMenu({
  user,
  variant = "landing",
  orgSlug,
}: UserProfileMenuProps) {
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const sidebarExpanded = useSidebarStore((s) => s.expanded);
  const { data: organizations, isLoading: orgsLoading } = useOrganizations();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const hasFullName = Boolean(user.firstName || user.lastName);
  const displayName = hasFullName
    ? `${user.firstName} ${user.lastName}`.trim()
    : user.username;

  const accountPath = "/app/account/general";
  const isAppCollapsed = variant === "app" && !sidebarExpanded;
  const showOrganizationSwitcher = variant === "app";

  const menuItems: MenuItem[] = [
    {
      label: "Account Details",
      icon: User,
      onClick: () => {
        navigate(accountPath);
        setOpen(false);
      },
    },
    {
      label: "Changelog",
      icon: FileText,
      onClick: () => { setOpen(false); },
    },
    {
      label: "Billing",
      icon: CreditCard,
      onClick: () => {
        navigate(accountPath);
        setOpen(false);
      },
    },
    {
      label: "Log Out",
      icon: LogOut,
      destructive: true,
      onClick: () => {
        setOpen(false);
        void signOut().then(() => { navigate("/"); });
      },
    },
  ];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleSelectOrganization(organization: Organization) {
    setOpen(false);
    navigate(orgPath(organization.slug));
  }

  function handleCreateOrganization() {
    setOpen(false);
    navigate("/app/onboarding?create=1");
  }

  const panelPosition =
    variant === "app"
      ? "absolute left-full bottom-0 z-50 ml-3 origin-bottom-left"
      : "absolute right-0 top-[calc(100%+0.375rem)] z-50 origin-top-right";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative",
        variant === "app" && (sidebarExpanded ? "w-full" : "flex justify-center"),
      )}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        onClick={() => { setOpen((value) => !value); }}
        className={cn(
          "border border-white/10 bg-white/3 transition-all duration-200",
          "hover:border-white/15 hover:bg-white/6",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/30",
          open && "border-brand-400/25 bg-white/6 shadow-[0_0_12px_rgba(34,211,238,0.08)]",
          isAppCollapsed
            ? "flex size-9 items-center justify-center rounded-lg p-0"
            : cn(
                "flex items-center gap-2 rounded-lg py-1.5",
                variant === "app" && sidebarExpanded ? "w-full px-2" : "px-2 pr-2.5",
              ),
        )}
      >
        <StatusAvatar
          src={getAvatarSrc(user)}
          name={displayName || user.email}
          status={user.status}
          size="xs"
        />
        {!isAppCollapsed ? (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-xs font-medium text-slate-300">
              {displayName}
            </span>
            <ChevronDown
              size={12}
              className={cn(
                "shrink-0 text-slate-500 transition-transform duration-200",
                open && "rotate-180 text-brand-400",
              )}
            />
          </>
        ) : null}
      </button>

      <div
        role="menu"
        aria-hidden={!open}
        className={cn(
          panelPosition,
          "profile-menu-panel w-72 rounded-xl border border-white/10 bg-slate-950 p-3 shadow-2xl shadow-black/50",
          variant === "app" ? "origin-bottom-left" : "origin-top-right",
          open
            ? "profile-menu-panel-open pointer-events-auto"
            : cn(
                "pointer-events-none",
                variant === "app"
                  ? "profile-menu-panel-closed-side"
                  : "profile-menu-panel-closed-down",
              ),
        )}
      >
        <div
          className={cn(
            "mb-3 flex items-center gap-3 rounded-lg bg-white/3 px-2.5 py-2.5 transition-[opacity,transform] duration-200 ease-out",
            open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
          )}
          style={{ transitionDelay: open ? "40ms" : "0ms" }}
        >
          <StatusAvatar
            src={getAvatarSrc(user)}
            name={displayName || user.email}
            status={user.status}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-100">{displayName}</p>
            <p className="truncate text-xs text-slate-500">@{user.username}</p>
          </div>
        </div>

        {showOrganizationSwitcher ? (
          <div
            className={cn(
              "transition-[opacity,transform] duration-200 ease-out",
              open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
            )}
            style={{ transitionDelay: open ? "70ms" : "0ms" }}
          >
            <OrganizationSwitcher
              organizations={organizations}
              orgSlug={orgSlug}
              isLoading={orgsLoading}
              menuOpen={open}
              onSelect={handleSelectOrganization}
              onCreate={handleCreateOrganization}
            />
          </div>
        ) : null}

        {showOrganizationSwitcher ? (
          <div
            className={cn(
              "my-3 h-px bg-white/6 transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0",
            )}
            style={{ transitionDelay: open ? "90ms" : "0ms" }}
          />
        ) : (
          <div className="mb-2" />
        )}

        <ul
          className={cn(
            "space-y-0.5 transition-[opacity,transform] duration-200 ease-out",
            open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          )}
          style={{ transitionDelay: open ? "100ms" : "0ms" }}
        >
          {variant === "landing" ? (
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate("/app/organizations");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-100"
              >
                <Building2 size={15} strokeWidth={1.75} />
                My Organizations
              </button>
            </li>
          ) : null}

          {variant === "app" ? (
            <li>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-slate-100"
              >
                <Home size={15} strokeWidth={1.75} />
                Return Home
              </button>
            </li>
          ) : null}

          {menuItems.map(({ label, icon: Icon, onClick, destructive }) => (
            <li key={label}>
              <button
                type="button"
                role="menuitem"
                onClick={onClick}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  destructive
                    ? "text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                    : "text-slate-300 hover:bg-white/5 hover:text-slate-100",
                )}
              >
                <Icon size={15} strokeWidth={1.75} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
