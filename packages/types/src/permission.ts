import { OrganizationPermission, OrganizationRole } from "./enums";
import type { Membership } from "./membership";

const ALL_PERMISSIONS = Object.values(OrganizationPermission);

const VIEWER_PERMISSIONS: OrganizationPermission[] = [
  OrganizationPermission.OrgProfileView,
  OrganizationPermission.MemberViewList,
  OrganizationPermission.MonitorViewAll,
  OrganizationPermission.AlertChannelView,
  OrganizationPermission.AlertRuleView,
];

const MEMBER_PERMISSIONS: OrganizationPermission[] = [
  ...VIEWER_PERMISSIONS,
  OrganizationPermission.MonitorCreate,
  OrganizationPermission.MonitorManageOwn,
  OrganizationPermission.AlertChannelCreate,
  OrganizationPermission.AlertRuleCreate,
];

const ADMIN_PERMISSIONS: OrganizationPermission[] = [
  ...MEMBER_PERMISSIONS,
  OrganizationPermission.OrgProfileEdit,
  OrganizationPermission.OrgSettingsEdit,
  OrganizationPermission.OrgBillingView,
  OrganizationPermission.OrgAuditLogsView,
  OrganizationPermission.MemberInvite,
  OrganizationPermission.MemberManageRoles,
  OrganizationPermission.MemberRemove,
  OrganizationPermission.MonitorEditAny,
  OrganizationPermission.MonitorDeleteAny,
  OrganizationPermission.AlertChannelEditAny,
  OrganizationPermission.AlertChannelDeleteAny,
  OrganizationPermission.AlertRuleEditAny,
  OrganizationPermission.AlertRuleDeleteAny,
  OrganizationPermission.UsageViewFull,
];

export const ROLE_PERMISSIONS: Record<OrganizationRole, OrganizationPermission[]> = {
  [OrganizationRole.Owner]: ALL_PERMISSIONS,
  [OrganizationRole.Admin]: ADMIN_PERMISSIONS,
  [OrganizationRole.Member]: MEMBER_PERMISSIONS,
  [OrganizationRole.Viewer]: VIEWER_PERMISSIONS,
};

export function resolvePermissions(m: Membership): OrganizationPermission[] {
  if (m.isOwner) return ALL_PERMISSIONS;
  const fromRole = ROLE_PERMISSIONS[m.role] ?? [];
  const merged = new Set<OrganizationPermission>([
    ...fromRole,
    ...(m.permissionsOverride ?? []),
  ]);
  return Array.from(merged);
}

export function hasPermission(
  m: Membership,
  perm: OrganizationPermission,
): boolean {
  return m.isOwner || resolvePermissions(m).includes(perm);
}

export function hasAnyPermission(
  m: Membership,
  perms: OrganizationPermission[],
): boolean {
  if (m.isOwner) return true;
  const resolved = resolvePermissions(m);
  return perms.some((p) => resolved.includes(p));
}

export function hasAllPermissions(
  m: Membership,
  perms: OrganizationPermission[],
): boolean {
  if (m.isOwner) return true;
  const resolved = resolvePermissions(m);
  return perms.every((p) => resolved.includes(p));
}
