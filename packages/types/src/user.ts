export enum UserAvatarType {
  Gravatar = "gravatar",
  Upload = "upload",
  None = "none",
}

export enum UserStatus {
  Online = "online",
  Offline = "offline",
  Away = "away",
  DoNotDisturb = "do_not_disturb",
}

export enum UserGlobalRole {
  User = "user",
  Moderator = "moderator",
  Support = "support",
  Admin = "admin",
}

export enum UserOAuthProvider {
  Google = "google",
  GitHub = "github",
}

/** Internal profile shape — password hash and tokens live in Postgres, never exposed via API. */
export interface User {
  id: string;
  email: string;
  lastLogin?: string;

  firstName: string;
  lastName: string;
  username: string;
  avatarType: UserAvatarType;
  avatarUrl?: string;

  isBanned: boolean;

  role: UserGlobalRole;
  status: UserStatus;

  emailVerified: boolean;

  mfaEnabled: boolean;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  bannedAt?: string;
}

/** Safe API/session payload — never includes secrets. */
export interface PublicUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarType: UserAvatarType;
  avatarUrl?: string;
  gravatarEmail?: string;
  role: UserGlobalRole;
  status: UserStatus;
  emailVerified: boolean;
  mfaEnabled: boolean;
  isBanned: boolean;
  pendingDeletion?: boolean;
  deletionScheduledAt?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/** Extended account settings returned from GET /account */
export interface AccountSettings extends PublicUser {
  linkedProviders: UserOAuthProvider[];
  mfaEnrolled: boolean;
  hasPassword: boolean;
}

export interface MultiFactorAuth {
  id: string;
  userId: string;
  enabled: boolean;
  secret?: string;
  backupCodes: string[];
}

export interface UserEmailVerification {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  used: boolean;
}

export interface UserPasswordReset {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export interface UserOAuth {
  id: string;
  userId: string;
  provider: UserOAuthProvider;
  providerId: string;
  createdAt: string;
}
