import { randomUUID } from "node:crypto";

import type { AccountSettings } from "@orvex/types";
import { UserOAuthProvider, isReservedUsername } from "@orvex/types";
import {
  createSupabaseServiceClient,
  mapProfileToPublicUser,
  oauthRepository,
  usersRepository,
  type UpdateProfileInput,
} from "@orvex/database";
import { mfaRepository } from "@orvex/database";

import { getEnv } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { ErrorCodes } from "../../constants/http";
import {
  disableMfa,
  requireMfaIfEnabled,
  sendDeactivationEmail,
  startMfaEnroll,
  confirmMfaEnroll,
  verifyUserPassword,
} from "./mfa-account.service";

const AVATARS_BUCKET = "avatars";

function assertNotPendingDeletion(profile: { deletion_requested_at: string | null }) {
  if (profile.deletion_requested_at) {
    throw new AppError(
      "Account is pending deletion",
      403,
      ErrorCodes.ACCOUNT_PENDING_DELETION,
    );
  }
}

export async function getAccountSettings(userId: string): Promise<AccountSettings> {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  const oauth = await oauthRepository.listByUserId(userId);
  const mfa = await mfaRepository.findByUserId(userId);
  const service = createSupabaseServiceClient();
  const { data: authUser } = await service.auth.admin.getUserById(userId);

  const identities = authUser.user?.identities ?? [];
  const linkedFromAuth = identities
    .map((i) => i.provider)
    .filter((p): p is "google" | "github" => p === "google" || p === "github");

  const linkedProviders = [
    ...new Set([
      ...oauth.map((o) => o.provider as UserOAuthProvider),
      ...linkedFromAuth,
    ]),
  ] as UserOAuthProvider[];

  const hasPassword =
    identities.some((i) => i.provider === "email") ||
    (authUser.user?.app_metadata?.provider === "email");

  return {
    ...mapProfileToPublicUser(profile),
    linkedProviders,
    mfaEnrolled: mfa?.enabled ?? false,
    hasPassword: hasPassword || identities.length === 0,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }
  assertNotPendingDeletion(profile);

  if (input.username) {
    if (isReservedUsername(input.username)) {
      throw new AppError("This username is reserved", 409, ErrorCodes.CONFLICT);
    }
    const available = await usersRepository.isUsernameAvailable(input.username, userId);
    if (!available) {
      throw new AppError("Username is already taken", 409, ErrorCodes.CONFLICT);
    }
  }

  const row = await usersRepository.updateProfile(userId, input);
  return mapProfileToPublicUser(row);
}

export async function checkUsername(username: string, userId: string) {
  if (isReservedUsername(username)) {
    return { available: false, reserved: true as const };
  }
  const available = await usersRepository.isUsernameAvailable(username, userId);
  return { available, reserved: false as const };
}

export async function createAvatarUploadUrl(userId: string, contentType: string, extension: string) {
  const env = getEnv();
  const client = createSupabaseServiceClient();
  const objectPath = `${userId}/${randomUUID()}.${extension}`;

  const { data, error } = await client.storage
    .from(AVATARS_BUCKET)
    .createSignedUploadUrl(objectPath, { upsert: false });

  if (error || !data) {
    throw new AppError(
      error?.message ?? "Failed to create upload URL",
      500,
      ErrorCodes.INTERNAL,
    );
  }

  const publicUrl = `${env.SUPABASE_URL}/storage/v1/object/public/${AVATARS_BUCKET}/${objectPath}`;

  return {
    signedUrl: data.signedUrl,
    token: data.token,
    path: objectPath,
    publicUrl,
  };
}

export async function authorizeEmailChange(
  userId: string,
  newEmail: string,
  otp?: string | undefined,
) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }
  assertNotPendingDeletion(profile);
  await requireMfaIfEnabled(profile, otp);

  if (newEmail.toLowerCase() === profile.email.toLowerCase()) {
    throw new AppError("New email must be different from your current email", 400, ErrorCodes.VALIDATION);
  }
}

export async function syncEmailChangeProfile(userId: string, newEmail: string) {
  await usersRepository.updateProfile(userId, { email: newEmail });
  const updated = await usersRepository.findById(userId);
  if (!updated) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }
  return mapProfileToPublicUser(updated);
}

export async function changePassword(
  userId: string,
  email: string,
  currentPassword: string,
  newPassword: string,
  otp?: string | undefined,
) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }
  assertNotPendingDeletion(profile);
  await requireMfaIfEnabled(profile, otp);

  const valid = await verifyUserPassword(email, currentPassword);
  if (!valid) {
    throw new AppError("Incorrect current password", 401, ErrorCodes.UNAUTHORIZED);
  }

  const service = createSupabaseServiceClient();
  const { error } = await service.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new AppError(error.message, 400, ErrorCodes.VALIDATION);
  }
}

export async function syncOAuthAccounts(userId: string) {
  const service = createSupabaseServiceClient();
  const { data: authUser, error } = await service.auth.admin.getUserById(userId);
  if (error || !authUser.user) {
    throw new AppError("Failed to load auth user", 500, ErrorCodes.INTERNAL);
  }

  const identities = authUser.user.identities ?? [];
  const providers: UserOAuthProvider[] = [];

  for (const identity of identities) {
    if (identity.provider === "google") {
      await oauthRepository.upsert(
        userId,
        UserOAuthProvider.Google,
        identity.identity_id ?? identity.id,
      );
      providers.push(UserOAuthProvider.Google);
    } else if (identity.provider === "github") {
      await oauthRepository.upsert(
        userId,
        UserOAuthProvider.GitHub,
        identity.identity_id ?? identity.id,
      );
      providers.push(UserOAuthProvider.GitHub);
    }
  }

  const stored = await oauthRepository.listByUserId(userId);
  for (const row of stored) {
    if (!providers.includes(row.provider as UserOAuthProvider)) {
      await oauthRepository.remove(userId, row.provider as UserOAuthProvider);
    }
  }

  return { linkedProviders: providers };
}

export async function getLinkedOAuth(userId: string) {
  const rows = await oauthRepository.listByUserId(userId);
  return { linkedProviders: rows.map((r) => r.provider as UserOAuthProvider) };
}

export async function deactivateAccount(
  userId: string,
  email: string,
  password: string,
  otp?: string | undefined,
) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (profile.deletion_requested_at) {
    throw new AppError("Account is already scheduled for deletion", 409, ErrorCodes.CONFLICT);
  }

  const valid = await verifyUserPassword(email, password);
  if (!valid) {
    throw new AppError("Incorrect password", 401, ErrorCodes.UNAUTHORIZED);
  }

  await requireMfaIfEnabled(profile, otp);

  const row = await usersRepository.requestDeletion(userId);
  const scheduledAt = new Date(row.deletion_scheduled_at ?? Date.now());
  await sendDeactivationEmail(email, scheduledAt);

  return mapProfileToPublicUser(row);
}

export async function reactivateAccount(userId: string) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (!profile.deletion_requested_at) {
    throw new AppError("Account is not pending deletion", 400, ErrorCodes.VALIDATION);
  }

  const row = await usersRepository.reactivate(userId);
  return mapProfileToPublicUser(row);
}

export {
  startMfaEnroll,
  confirmMfaEnroll,
  disableMfa,
};
