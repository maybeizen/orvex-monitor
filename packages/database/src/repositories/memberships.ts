import { createSupabaseServiceClient } from "../client";
import type { MembershipRow } from "../table-types";

const MEMBERSHIP_COLUMNS =
  "id, organization_id, user_id, invited_by, joined_at, role, permissions_override, is_owner";

export const membershipsRepository = {
  async countByOrganizationIds(
    organizationIds: string[],
  ): Promise<Record<string, number>> {
    if (organizationIds.length === 0) return {};

    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("memberships")
      .select("organization_id")
      .in("organization_id", organizationIds);

    if (error) throw error;

    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const orgId = row.organization_id as string;
      counts[orgId] = (counts[orgId] ?? 0) + 1;
    }

    return counts;
  },

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<MembershipRow | null> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("memberships")
      .select(MEMBERSHIP_COLUMNS)
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    if (error) throw error;
    return data as MembershipRow | null;
  },
};
