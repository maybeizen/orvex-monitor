import type { AccountSettings, UserOAuthProvider } from "@orvex/types";
import { isReservedUsername } from "@orvex/types";
import {
  mapProfileToPublicUser,
  oauthRepository,
  usersRepository,
  type UpdateProfileInput,
} from "@orvex/database";
import { mfaRepository } from "@orvex/database";
import { createAvatarUploadUrl as createStorageAvatarUploadUrl } from "@orvex/storage";
import {
  sendAccountDeactivationEmail,
  sendEmailChangeEmail,
} from "@orvex/mailer";

import { AppError } from "../../utils/AppError";
import { ErrorCodes } from "../../constants/http";
import {
  createEmailChangeToken,
  hashPassword,
  parseEmailChangeToken,
  unlinkOAuthAccount,
  verifyPassword,
} from "../auth/auth.service";
import {
  disableMfa,
  requireMfaIfEnabled,
  startMfaEnroll,
  confirmMfaEnroll,
  verifyUserPassword,
} from "./mfa-account.service";

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
  const authProfile = await usersRepository.findByEmail(profile.email);

  return {
    ...mapProfileToPublicUser(profile),
    linkedProviders: oauth.map((o) => o.provider as UserOAuthProvider),
    mfaEnrolled: mfa?.enabled ?? false,
    hasPassword: Boolean(authProfile?.password_hash),
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

export async function createAvatarUploadUrl(
  userId: string,
  contentType: string,
  extension: string,
) {
  return createStorageAvatarUploadUrl(userId, contentType, extension);
}

export async function requestEmailChange(
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

  const normalized = newEmail.toLowerCase();
  if (normalized === profile.email.toLowerCase()) {
    throw new AppError("New email must be different from your current email", 400, ErrorCodes.VALIDATION);
  }

  const existing = await usersRepository.findByEmail(normalized);
  if (existing && existing.id !== userId) {
    throw new AppError("Email is already in use", 409, ErrorCodes.CONFLICT);
  }

  const currentToken = createEmailChangeToken(userId, normalized);
  const newToken = createEmailChangeToken(userId, normalized);

  await sendEmailChangeEmail({
    email: profile.email,
    token: currentToken,
    kind: "current",
  });
  await sendEmailChangeEmail({
    email: normalized,
    token: newToken,
    kind: "new",
  });
}

export async function confirmEmailChange(token: string) {
  const parsed = parseEmailChangeToken(token);
  if (!parsed) {
    throw new AppError("Invalid or expired email change token", 400, ErrorCodes.VALIDATION);
  }

  const existing = await usersRepository.findByEmail(parsed.newEmail);
  if (existing && existing.id !== parsed.userId) {
    throw new AppError("Email is already in use", 409, ErrorCodes.CONFLICT);
  }

  const row = await usersRepository.updateProfile(parsed.userId, {
    email: parsed.newEmail,
  });
  return mapProfileToPublicUser(row);
}

export async function changePassword(
  userId: string,
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

  const authProfile = await usersRepository.findByEmail(profile.email);
  const valid = await verifyPassword(authProfile?.password_hash, currentPassword);
  if (!valid) {
    throw new AppError("Incorrect current password", 401, ErrorCodes.UNAUTHORIZED);
  }

  const passwordHash = await hashPassword(newPassword);
  await usersRepository.setPasswordHash(userId, passwordHash);
}

export async function getLinkedOAuth(userId: string) {
  const rows = await oauthRepository.listByUserId(userId);
  return { linkedProviders: rows.map((r) => r.provider as UserOAuthProvider) };
}

export async function unlinkOAuthProvider(userId: string, provider: UserOAuthProvider) {
  return unlinkOAuthAccount(userId, provider);
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
  await sendAccountDeactivationEmail({ email, scheduledAt });

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
