import type {
  CreateOrganizationInput,
  Organization,
  OrganizationStatus,
  SubscriptionPlan,
} from "@orvex/types";

import { createSupabaseServiceClient } from "../client";
import type { OrganizationRow } from "../table-types";

const ORG_COLUMNS =
  "id, name, slug, icon, owner_id, status, is_personal, plan, customer_id, subscription_id, auto_renew, plan_expires_at, created_at, updated_at";

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
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("memberships")
      .select(`organizations (${ORG_COLUMNS})`)
      .eq("user_id", userId)
      .order("joined_at", { ascending: true });

    if (error) throw error;

    const rows = (data ?? [])
      .map((entry) => entry.organizations as OrganizationRow | null)
      .filter((row): row is OrganizationRow => row !== null);

    return rows.map(mapOrganizationRow);
  },

  async findBySlug(slug: string): Promise<OrganizationRow | null> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("organizations")
      .select(ORG_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data as OrganizationRow | null;
  },

  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.findBySlug(slug);
    return existing === null;
  },

  async create(
    input: CreateOrganizationInput,
    ownerId: string,
  ): Promise<OrganizationRow> {
    const client = createSupabaseServiceClient();

    const { data: org, error: orgError } = await client
      .from("organizations")
      .insert({
        name: input.name,
        slug: input.slug,
        icon: input.icon ?? null,
        owner_id: ownerId,
        is_personal: input.isPersonal ?? false,
        plan: input.plan ?? "free",
        status: "active",
      })
      .select(ORG_COLUMNS)
      .single();

    if (orgError) throw orgError;

    const { error: membershipError } = await client.from("memberships").insert({
      organization_id: org.id,
      user_id: ownerId,
      role: "owner",
      is_owner: true,
    });

    if (membershipError) {
      await client.from("organizations").delete().eq("id", org.id);
      throw membershipError;
    }

    return org as OrganizationRow;
  },
};
