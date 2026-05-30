import type { OrganizationPermission, OrganizationRole } from "./enums";

export interface Membership {
  id: string;
  organizationId: string;
  userId: string;
  invitedBy?: string;
  joinedAt: string;
  role: OrganizationRole;
  permissionsOverride: OrganizationPermission[];
  isOwner: boolean;
}

export interface CreateMembershipInput {
  organizationId: string;
  userId: string;
  role?: OrganizationRole | undefined;
  permissionsOverride?: OrganizationPermission[] | undefined;
  invitedBy?: string | undefined;
  isOwner?: boolean | undefined;
}

export interface UpdateMembershipInput {
  role?: OrganizationRole | undefined;
  permissionsOverride?: OrganizationPermission[] | undefined;
}

export interface MembershipInvite {
  email: string;
  role: OrganizationRole;
  permissionsOverride?: OrganizationPermission[] | undefined;
}
