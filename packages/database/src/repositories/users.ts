import { randomUUID } from "node:crypto";

import type {
  PublicUser,
  UserAvatarType,
  UserGlobalRole,
  UserStatus,
} from "@orvex/types";
import { isReservedUsername, isValidUsernameFormat } from "@orvex/types";
import {
  and,
  eq,
  getTableColumns,
  gt,
  ilike,
  isNotNull,
  isNull,
  lte,
  ne,
} from "drizzle-orm";

import { createDb } from "../client";
import { profiles, userEmailVerifications, userPasswordResets } from "../schema";
import type { ProfileAuthRow, ProfileRow } from "../table-types";

function getPublicProfileColumns() {
  const { password_hash: _passwordHash, ...columns } = getTableColumns(profiles);
  return columns;
}

const publicProfileColumns = getPublicProfileColumns();

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

export function canAuthenticate(row: ProfileRow): boolean {
  return !row.is_banned && row.deleted_at === null;
}

function generateUsernameBase(email: string, userId: string): string {
  const localPart = email.split("@")[0] ?? "user";
  const sanitized = localPart.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
  const base = sanitized.length > 0 ? sanitized : "user";
  return `${base}_${userId.replace(/-/g, "").slice(0, 8)}`;
}

function resolveUsername(email: string, userId: string, requested?: string): string {
  const trimmed = requested?.trim();
  if (
    trimmed &&
    isValidUsernameFormat(trimmed) &&
    !isReservedUsername(trimmed)
  ) {
    return trimmed;
  }
  return generateUsernameBase(email, userId);
}

export interface CreateUserInput {
  email: string;
  passwordHash?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  username?: string | undefined;
  emailVerified?: boolean | undefined;
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

export interface AuthTokenRow {
  id: string;
  user_id: string;
}

export const usersRepository = {
  async findById(id: string): Promise<ProfileRow | null> {
    const db = createDb();
    const [row] = await db
      .select(publicProfileColumns)
      .from(profiles)
      .where(eq(profiles.id, id))
      .limit(1);
    return row ?? null;
  },

  async findByEmail(email: string): Promise<ProfileAuthRow | null> {
    const db = createDb();
    const [row] = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return row ?? null;
  },

  async findPublicById(id: string): Promise<PublicUser | null> {
    const row = await this.findById(id);
    if (!row) return null;
    return mapProfileToPublicUser(row);
  },

  async createUser(input: CreateUserInput): Promise<ProfileRow> {
    const db = createDb();
    const id = randomUUID();
    const firstName = input.firstName ?? input.email.split("@")[0] ?? "user";
    const lastName = input.lastName ?? "";
    const username = resolveUsername(input.email, id, input.username);

    const [row] = await db
      .insert(profiles)
      .values({
        id,
        email: input.email,
        password_hash: input.passwordHash ?? null,
        first_name: firstName,
        last_name: lastName,
        username,
        full_name: `${firstName} ${lastName}`.trim() || null,
        email_verified: input.emailVerified ?? false,
      })
      .returning(publicProfileColumns);

    if (!row) throw new Error("Failed to create user");
    return row;
  },

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    const db = createDb();
    await db
      .update(profiles)
      .set({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .where(eq(profiles.id, userId));
  },

  async updateLastLogin(id: string): Promise<void> {
    const db = createDb();
    await db
      .update(profiles)
      .set({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .where(eq(profiles.id, id));
  },

  async markEmailVerified(userId: string): Promise<ProfileRow | null> {
    const db = createDb();
    const [row] = await db
      .update(profiles)
      .set({ email_verified: true, updated_at: new Date().toISOString() })
      .where(and(eq(profiles.id, userId), eq(profiles.email_verified, false)))
      .returning(publicProfileColumns);
    return row ?? null;
  },

  async markEmailVerifiedIfNeeded(
    userId: string,
    emailConfirmed: boolean | undefined,
  ): Promise<ProfileRow | null> {
    if (!emailConfirmed) return null;
    return this.markEmailVerified(userId);
  },

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const db = createDb();
    const conditions = [ilike(profiles.username, username)];
    if (excludeUserId) {
      conditions.push(ne(profiles.id, excludeUserId));
    }

    const rows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(...conditions))
      .limit(1);

    return rows.length === 0;
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<ProfileRow> {
    const db = createDb();
    const patch: Partial<typeof profiles.$inferInsert> = {
      updated_at: new Date().toISOString(),
    };

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

    const [row] = await db
      .update(profiles)
      .set(patch)
      .where(eq(profiles.id, userId))
      .returning(publicProfileColumns);

    if (!row) throw new Error("Profile not found");
    return row;
  },

  async setMfaEnabled(userId: string, enabled: boolean): Promise<void> {
    const db = createDb();
    await db
      .update(profiles)
      .set({ mfa_enabled: enabled, updated_at: new Date().toISOString() })
      .where(eq(profiles.id, userId));
  },

  async requestDeletion(userId: string): Promise<ProfileRow> {
    const db = createDb();
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 30);

    const [row] = await db
      .update(profiles)
      .set({
        deletion_requested_at: new Date().toISOString(),
        deletion_scheduled_at: scheduledAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .where(eq(profiles.id, userId))
      .returning(publicProfileColumns);

    if (!row) throw new Error("Profile not found");
    return row;
  },

  async reactivate(userId: string): Promise<ProfileRow> {
    const db = createDb();
    const [row] = await db
      .update(profiles)
      .set({
        deletion_requested_at: null,
        deletion_scheduled_at: null,
        updated_at: new Date().toISOString(),
      })
      .where(eq(profiles.id, userId))
      .returning(publicProfileColumns);

    if (!row) throw new Error("Profile not found");
    return row;
  },

  async findPendingDeletionDue(): Promise<ProfileRow[]> {
    const db = createDb();
    const now = new Date().toISOString();
    return db
      .select(publicProfileColumns)
      .from(profiles)
      .where(
        and(
          isNotNull(profiles.deletion_scheduled_at),
          lte(profiles.deletion_scheduled_at, now),
          isNull(profiles.deleted_at),
        ),
      );
  },

  async markDeleted(userId: string): Promise<void> {
    const db = createDb();
    await db
      .update(profiles)
      .set({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .where(eq(profiles.id, userId));
  },

  async createEmailVerificationToken(
    userId: string,
    token: string,
    expiresAt: string,
  ): Promise<void> {
    const db = createDb();
    await db.insert(userEmailVerifications).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  },

  async findValidEmailVerificationToken(token: string): Promise<AuthTokenRow | null> {
    const db = createDb();
    const now = new Date().toISOString();
    const [row] = await db
      .select({ id: userEmailVerifications.id, user_id: userEmailVerifications.user_id })
      .from(userEmailVerifications)
      .where(
        and(
          eq(userEmailVerifications.token, token),
          eq(userEmailVerifications.used, false),
          gt(userEmailVerifications.expires_at, now),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async consumeEmailVerificationToken(tokenId: string): Promise<void> {
    const db = createDb();
    await db
      .update(userEmailVerifications)
      .set({ used: true })
      .where(eq(userEmailVerifications.id, tokenId));
  },

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: string,
  ): Promise<void> {
    const db = createDb();
    await db.insert(userPasswordResets).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
    });
  },

  async findValidPasswordResetToken(token: string): Promise<AuthTokenRow | null> {
    const db = createDb();
    const now = new Date().toISOString();
    const [row] = await db
      .select({ id: userPasswordResets.id, user_id: userPasswordResets.user_id })
      .from(userPasswordResets)
      .where(
        and(
          eq(userPasswordResets.token, token),
          eq(userPasswordResets.used, false),
          gt(userPasswordResets.expires_at, now),
        ),
      )
      .limit(1);
    return row ?? null;
  },

  async consumePasswordResetToken(tokenId: string): Promise<void> {
    const db = createDb();
    await db
      .update(userPasswordResets)
      .set({ used: true })
      .where(eq(userPasswordResets.id, tokenId));
  },
};

export { mapProfileToPublicUser };
