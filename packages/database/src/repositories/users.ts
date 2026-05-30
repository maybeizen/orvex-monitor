import type {
  PublicUser,
  UserAvatarType,
  UserGlobalRole,
  UserStatus,
} from "@orvex/types";
import { isReservedUsername, isValidUsernameFormat } from "@orvex/types";

import { createSupabaseServiceClient } from "../client";
import type { ProfileRow } from "../table-types";

const PROFILE_COLUMNS =
  "id, email, full_name, avatar_url, timezone, first_name, last_name, username, avatar_type, global_role, status, is_banned, banned_at, email_verified, last_login_at, deleted_at, deletion_requested_at, deletion_scheduled_at, gravatar_email, mfa_enabled, created_at, updated_at";

function mapProfileToPublicUser(row: ProfileRow): PublicUser {
  const user: PublicUser = {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    avatarType: row.avatar_type as UserAvatarType,
    role: row.global_role as UserGlobalRole,
    status: row.status as UserStatus,
    emailVerified: row.email_verified,
    mfaEnabled: row.mfa_enabled,
    isBanned: row.is_banned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.avatar_url) user.avatarUrl = row.avatar_url;
  if (row.gravatar_email) user.gravatarEmail = row.gravatar_email;
  if (row.last_login_at) user.lastLogin = row.last_login_at;
  if (row.deletion_requested_at) {
    user.pendingDeletion = true;
    if (row.deletion_scheduled_at) user.deletionScheduledAt = row.deletion_scheduled_at;
  }

  return user;
}

export function isActiveUser(row: ProfileRow): boolean {
  return !row.is_banned && row.deleted_at === null && row.deletion_requested_at === null;
}

/** Allows session creation (excludes hard-deleted and banned only). */
export function canAuthenticate(row: ProfileRow): boolean {
  return !row.is_banned && row.deleted_at === null;
}

function generateUsernameBase(email: string, userId: string): string {
  const localPart = email.split("@")[0] ?? "user";
  const sanitized = localPart.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  const base = sanitized.length > 0 ? sanitized : "user";
  return `${base}_${userId.replace(/-/g, "").slice(0, 8)}`;
}

export interface SupabaseAuthUserSnapshot {
  id: string;
  email?: string | undefined;
  emailConfirmed?: boolean | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  fullName?: string | undefined;
  username?: string | undefined;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarType?: UserAvatarType;
  avatarUrl?: string | null;
  gravatarEmail?: string | null;
  status?: UserStatus;
  email?: string;
}

export const usersRepository = {
  async findById(id: string): Promise<ProfileRow | null> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as ProfileRow | null;
  },

  async findPublicById(id: string): Promise<PublicUser | null> {
    const row = await this.findById(id);
    if (!row) return null;
    return mapProfileToPublicUser(row);
  },

  async updateLastLogin(id: string): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
  },

  /** Keep profiles.email_verified in sync when Supabase Auth confirms the address. */
  async markEmailVerifiedIfNeeded(
    userId: string,
    emailConfirmed: boolean | undefined,
  ): Promise<ProfileRow | null> {
    if (!emailConfirmed) return null;

    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("profiles")
      .update({ email_verified: true })
      .eq("id", userId)
      .eq("email_verified", false)
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    return data as ProfileRow | null;
  },

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const client = createSupabaseServiceClient();
    let query = client
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .limit(1);

    if (excludeUserId) {
      query = query.neq("id", excludeUserId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).length === 0;
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileRow> {
    const client = createSupabaseServiceClient();
    const patch: {
      first_name?: string;
      last_name?: string;
      username?: string;
      avatar_type?: UserAvatarType;
      avatar_url?: string | null;
      gravatar_email?: string | null;
      status?: UserStatus;
      email?: string;
      email_verified?: boolean;
      full_name?: string | null;
    } = {};

    if (input.firstName !== undefined) patch.first_name = input.firstName;
    if (input.lastName !== undefined) patch.last_name = input.lastName;
    if (input.username !== undefined) patch.username = input.username;
    if (input.avatarType !== undefined) patch.avatar_type = input.avatarType;
    if (input.avatarUrl !== undefined) patch.avatar_url = input.avatarUrl;
    if (input.gravatarEmail !== undefined) patch.gravatar_email = input.gravatarEmail;
    if (input.status !== undefined) patch.status = input.status;
    if (input.email !== undefined) {
      patch.email = input.email;
      patch.email_verified = false;
    }

    if (input.firstName !== undefined || input.lastName !== undefined) {
      const existing = await this.findById(userId);
      const first = input.firstName ?? existing?.first_name ?? "";
      const last = input.lastName ?? existing?.last_name ?? "";
      patch.full_name = `${first} ${last}`.trim() || null;
    }

    const { data, error } = await client
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;
    return data as ProfileRow;
  },

  async setMfaEnabled(userId: string, enabled: boolean): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("profiles")
      .update({ mfa_enabled: enabled })
      .eq("id", userId);

    if (error) throw error;
  },

  async requestDeletion(userId: string): Promise<ProfileRow> {
    const client = createSupabaseServiceClient();
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 30);

    const { data, error } = await client
      .from("profiles")
      .update({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_at: scheduledAt.toISOString(),
      })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;
    return data as ProfileRow;
  },

  async reactivate(userId: string): Promise<ProfileRow> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("profiles")
      .update({
        deletion_requested_at: null,
        deletion_scheduled_at: null,
      })
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;
    return data as ProfileRow;
  },

  async findPendingDeletionDue(): Promise<ProfileRow[]> {
    const client = createSupabaseServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await client
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .not("deletion_scheduled_at", "is", null)
      .lte("deletion_scheduled_at", now)
      .is("deleted_at", null);

    if (error) throw error;
    return (data ?? []) as ProfileRow[];
  },

  async markDeleted(userId: string): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;
  },

  async syncFromSupabaseAuth(snapshot: SupabaseAuthUserSnapshot): Promise<ProfileRow> {
    const existing = await this.findById(snapshot.id);
    if (existing) return existing;

    const email = snapshot.email ?? "";
    const fullName = snapshot.fullName ?? "";
    const firstName =
      snapshot.firstName ??
      (fullName ? fullName.split(" ")[0] : email.split("@")[0]) ??
      "user";
    const lastName =
      snapshot.lastName ??
      (fullName.includes(" ") ? fullName.slice(fullName.indexOf(" ") + 1) : "");
    const requested = snapshot.username?.trim();
    const username =
      requested &&
      isValidUsernameFormat(requested) &&
      !isReservedUsername(requested)
        ? requested
        : generateUsernameBase(email, snapshot.id);

    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("profiles")
      .insert({
        id: snapshot.id,
        email,
        full_name: fullName || null,
        first_name: firstName,
        last_name: lastName,
        username,
        email_verified: snapshot.emailConfirmed ?? false,
      })
      .select(PROFILE_COLUMNS)
      .single();

    if (error) throw error;
    return data as ProfileRow;
  },
};

export { mapProfileToPublicUser };
