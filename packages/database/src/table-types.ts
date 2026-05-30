import type { Tables } from "./types";

/** Row shape for `public.profiles` — derived from generated Supabase types. */
export type ProfileRow = Tables<"profiles">;

/** Row shape for `public.organizations`. */
export type OrganizationRow = Tables<"organizations">;

/** Row shape for `public.memberships`. */
export type MembershipRow = Tables<"memberships">;
