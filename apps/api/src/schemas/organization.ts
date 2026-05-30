import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits, or hyphens");

export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(100),
  slug: slugSchema,
  icon: z.union([z.string().url(), z.literal("")]).optional(),
  orgType: z.enum(["personal", "team"]).default("personal"),
  plan: z.enum(["free", "pro", "enterprise"]).default("free"),
});

export const iconUploadUrlSchema = z.object({
  contentType: z.enum([
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
  ]),
  extension: z.enum(["png", "jpg", "jpeg", "webp", "svg"]),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: slugSchema.optional(),
  icon: z.string().url().optional(),
});

export const updateOrganizationSettingsSchema = z.object({
  require2FA: z.boolean().optional(),
  allowPublicDashboards: z.boolean().optional(),
  billingType: z.enum(["hard_limit", "soft_limit"]).optional(),
  notifyOnDowntime: z.boolean().optional(),
});

export type CreateOrganizationBody = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationBody = z.infer<typeof updateOrganizationSchema>;
export type UpdateOrganizationSettingsBody = z.infer<
  typeof updateOrganizationSettingsSchema
>;
