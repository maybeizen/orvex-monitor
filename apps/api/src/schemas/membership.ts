import { z } from "zod";

import { OrganizationPermission, OrganizationRole } from "@orvex/types";

const roleSchema = z.nativeEnum(OrganizationRole).refine(
  (r) => r !== OrganizationRole.Owner,
  "Cannot assign 'owner' through this endpoint",
);

const permissionsSchema = z.array(z.nativeEnum(OrganizationPermission)).max(64);

export const inviteMemberSchema = z.object({
  userId: z.string().uuid(),
  role: roleSchema.default(OrganizationRole.Member),
  permissionsOverride: permissionsSchema.optional(),
});

export const updateMembershipSchema = z.object({
  role: roleSchema.optional(),
  permissionsOverride: permissionsSchema.optional(),
});

export type InviteMemberBody = z.infer<typeof inviteMemberSchema>;
export type UpdateMembershipBody = z.infer<typeof updateMembershipSchema>;
