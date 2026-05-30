import type {
  memberships,
  organizations,
  profiles,
  userMfa,
  userOauthAccounts,
} from "./schema";

export type ProfileRow = Omit<typeof profiles.$inferSelect, "password_hash">;

export type ProfileAuthRow = typeof profiles.$inferSelect;

export type OrganizationRow = typeof organizations.$inferSelect;

export type MembershipRow = typeof memberships.$inferSelect;

export type MfaRow = typeof userMfa.$inferSelect;

export type OAuthAccountRow = typeof userOauthAccounts.$inferSelect;
