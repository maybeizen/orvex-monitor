import { slugify } from "@/lib/slug";

export { slugify };

export interface CreateOrganizationFormValues {
  name: string;
  slug: string;
  iconMode: "none" | "url" | "upload";
  iconUrl: string;
  orgType: "personal" | "team";
  plan: "free" | "pro" | "enterprise";
}

export function defaultOrganizationName(username: string): string {
  return `${username}'s Organization`;
}

export function defaultOrganizationSlug(username: string): string {
  return slugify(username);
}
