import { and, eq, inArray } from "drizzle-orm";

import { createDb } from "../client";
import { memberships } from "../schema";
import type { MembershipRow } from "../table-types";

export const membershipsRepository = {
  async countByOrganizationIds(
    organizationIds: string[],
  ): Promise<Record<string, number>> {
    if (organizationIds.length === 0) return {};

    const db = createDb();
    const rows = await db
      .select({ organization_id: memberships.organization_id })
      .from(memberships)
      .where(inArray(memberships.organization_id, organizationIds));

    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.organization_id] = (counts[row.organization_id] ?? 0) + 1;
    }

    return counts;
  },

  async findByUserAndOrg(
    userId: string,
    organizationId: string,
  ): Promise<MembershipRow | null> {
    const db = createDb();
    const [row] = await db
      .select()
      .from(memberships)
      .where(
        and(
          eq(memberships.user_id, userId),
          eq(memberships.organization_id, organizationId),
        ),
      )
      .limit(1);
    return row ?? null;
  },
};
