/** Min/max length aligned with API and web validators. */
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

export const RESERVED_USERNAME_MESSAGE =
  "This username is reserved and cannot be used";

/**
 * Lowercase reserved handles and impersonation-prone names.
 * Compared with exact match and underscore-stripped match (e.g. `a_d_m_i_n` → admin).
 */
const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "admins",
  "superadmin",
  "superuser",
  "sysadmin",
  "system",
  "sys",
  "root",
  "sudo",
  "owner",
  "moderator",
  "mod",
  "mods",
  "support",
  "help",
  "helpdesk",
  "staff",
  "team",
  "official",
  "verified",
  "orvex",
  "api",
  "www",
  "web",
  "mail",
  "email",
  "postmaster",
  "webmaster",
  "hostmaster",
  "security",
  "abuse",
  "billing",
  "legal",
  "privacy",
  "compliance",
  "null",
  "undefined",
  "anonymous",
  "guest",
  "unknown",
  "bot",
  "robot",
  "robots",
  "server",
  "database",
  "postgres",
  "supabase",
  "login",
  "signup",
  "register",
  "signin",
  "signout",
  "logout",
  "password",
  "auth",
  "authentication",
  "oauth",
  "internal",
  "external",
  "production",
  "staging",
]);

const RESERVED_NORMALIZED = new Set(
  [...RESERVED_USERNAMES].map((name) => normalizeUsernameKey(name)),
);

/** Case-insensitive; ignores underscores for reserved-name detection. */
export function normalizeUsernameKey(username: string): string {
  return username.trim().toLowerCase().replace(/_/g, "");
}

export function isValidUsernameFormat(username: string): boolean {
  const trimmed = username.trim();
  return (
    trimmed.length >= USERNAME_MIN_LENGTH &&
    trimmed.length <= USERNAME_MAX_LENGTH &&
    USERNAME_PATTERN.test(trimmed)
  );
}

export function isReservedUsername(username: string): boolean {
  const key = normalizeUsernameKey(username);
  if (key.length === 0) return false;
  return RESERVED_NORMALIZED.has(key);
}

export function isUsernameAllowed(username: string): boolean {
  return isValidUsernameFormat(username) && !isReservedUsername(username);
}
