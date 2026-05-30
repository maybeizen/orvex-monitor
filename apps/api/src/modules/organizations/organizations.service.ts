import { randomUUID } from "node:crypto";

import type {
  Organization,
  OrganizationListItem,
  PublicUser,
  SubscriptionPlan,
} from "@orvex/types";
import { SubscriptionPlan as Plan } from "@orvex/types";

import {
  createSupabaseServiceClient,
  mapOrganizationRow,
  membershipsRepository,
  organizationsRepository,
} from "@orvex/database";

import { getEnv } from "../../config/env";
import { ErrorCodes } from "../../constants/http";
import { AppError } from "../../utils/AppError";
import type { CreateOrganizationBody } from "../../schemas/organization";

const ORG_ICONS_BUCKET = "org-icons";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function generateUniqueSlug(base: string): Promise<string> {
  const normalized = slugify(base);
  const candidate = normalized.length >= 2 ? normalized : "org";

  if (await organizationsRepository.isSlugAvailable(candidate)) {
    return candidate;
  }

  for (let i = 0; i < 5; i += 1) {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 6);
    const withSuffix = `${candidate}-${suffix}`.slice(0, 50);
    if (await organizationsRepository.isSlugAvailable(withSuffix)) {
      return withSuffix;
    }
  }

  throw new AppError("Unable to generate unique slug", 409, ErrorCodes.CONFLICT);
}

export async function listOrganizationsForUser(
  userId: string,
): Promise<OrganizationListItem[]> {
  const organizations = await organizationsRepository.listForUser(userId);
  const memberCounts = await membershipsRepository.countByOrganizationIds(
    organizations.map((org) => org.id),
  );

  return organizations.map((organization) => ({
    ...organization,
    memberCount: memberCounts[organization.id] ?? 0,
  }));
}

export async function checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
  const available = await organizationsRepository.isSlugAvailable(slug);
  return { available };
}

export async function getOrganizationForUser(
  slug: string,
  userId: string,
): Promise<Organization> {
  const row = await organizationsRepository.findBySlug(slug);
  if (!row) {
    throw new AppError("Organization not found", 404, ErrorCodes.NOT_FOUND);
  }

  const membership = await membershipsRepository.findByUserAndOrg(userId, row.id);
  if (!membership) {
    throw new AppError("Organization not found", 404, ErrorCodes.NOT_FOUND);
  }

  return mapOrganizationRow(row);
}

export interface CreateOrganizationResult {
  organization: Organization;
  checkoutStub: boolean;
  requestedPlan: SubscriptionPlan;
}

export async function createOrganizationForUser(
  user: PublicUser,
  body: CreateOrganizationBody,
): Promise<CreateOrganizationResult> {
  const isPersonal = body.orgType === "personal";
  const requestedPlan = body.plan as SubscriptionPlan;
  const icon = body.icon && body.icon.length > 0 ? body.icon : undefined;

  const available = await organizationsRepository.isSlugAvailable(body.slug);
  if (!available) {
    throw new AppError("Slug is already taken", 409, ErrorCodes.CONFLICT);
  }

  const row = await organizationsRepository.create(
    {
      name: body.name,
      slug: body.slug,
      icon,
      isPersonal,
      plan: Plan.Free,
    },
    user.id,
  );

  const organization = mapOrganizationRow(row);
  const checkoutStub = requestedPlan !== Plan.Free;

  return {
    organization,
    checkoutStub,
    requestedPlan,
  };
}

export interface IconUploadUrlResult {
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
}

export async function createOrganizationIconUploadUrl(
  userId: string,
  contentType: string,
  extension: string,
): Promise<IconUploadUrlResult> {
  const env = getEnv();
  const client = createSupabaseServiceClient();
  const objectPath = `${userId}/${randomUUID()}.${extension}`;

  const { data, error } = await client.storage
    .from(ORG_ICONS_BUCKET)
    .createSignedUploadUrl(objectPath, { upsert: false });

  if (error || !data) {
    throw new AppError(
      error?.message ?? "Failed to create upload URL",
      500,
      ErrorCodes.INTERNAL,
    );
  }

  const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${ORG_ICONS_BUCKET}/${objectPath}`;

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: objectPath,
    publicUrl,
  };
}
