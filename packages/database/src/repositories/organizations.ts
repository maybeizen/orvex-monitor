import type {
  CreateOrganizationInput,
  Organization,
  OrganizationStatus,
  SubscriptionPlan,
} from "@orvex/types";
import { asc, eq } from "drizzle-orm";

import { createDb } from "../client";
import { memberships, organizations } from "../schema";
import type { OrganizationRow } from "../table-types";

export function mapOrganizationRow(row: OrganizationRow): Organization {
  const org: Organization = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    ownerId: row.owner_id,
    status: row.status as OrganizationStatus,
    isPersonal: row.is_personal,
    plan: row.plan as SubscriptionPlan,
    autoRenew: row.auto_renew,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.icon) org.icon = row.icon;
  if (row.customer_id) org.customerId = row.customer_id;
  if (row.subscription_id) org.subscriptionId = row.subscription_id;
  if (row.plan_expires_at) org.planExpiresAt = row.plan_expires_at;

  return org;
}

export const organizationsRepository = {
  async listForUser(userId: string): Promise<Organization[]> {
    const db = createDb();
    const rows = await db
      .select({ organization: organizations })
      .from(memberships)
      .innerJoin(organizations, eq(memberships.organization_id, organizations.id))
      .where(eq(memberships.user_id, userId))
      .orderBy(asc(memberships.joined_at));

    return rows.map((entry) => mapOrganizationRow(entry.organization));
  },

  async findBySlug(slug: string): Promise<OrganizationRow | null> {
    const db = createDb();
    const [row] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return row ?? null;
  },

  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.findBySlug(slug);
    return existing === null;
  },

  async create(
    input: CreateOrganizationInput,
    ownerId: string,
  ): Promise<OrganizationRow> {
    const db = createDb();

    return db.transaction(async (tx) => {
      const [org] = await tx
        .insert(organizations)
        .values({
          name: input.name,
          slug: input.slug,
          icon: input.icon ?? null,
          owner_id: ownerId,
          is_personal: input.isPersonal ?? false,
          plan: input.plan ?? "free",
          status: "active",
        })
        .returning();

      if (!org) throw new Error("Failed to create organization");

      await tx.insert(memberships).values({
        organization_id: org.id,
        user_id: ownerId,
        role: "owner",
        is_owner: true,
      });

      return org;
    });
  },
};
