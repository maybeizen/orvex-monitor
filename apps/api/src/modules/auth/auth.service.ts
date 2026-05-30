import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { PublicUser, UserOAuthProvider } from "@orvex/types";
import type { Request } from "express";
import * as argon2 from "argon2";

import {
  canAuthenticate,
  mapProfileToPublicUser,
  oauthRepository,
  usersRepository,
  type ProfileAuthRow,
  type ProfileRow,
} from "@orvex/database";
import {
  sendPasswordResetEmail,
  sendSignupVerificationEmail,
} from "@orvex/mailer";

import { getCsrfSecret } from "../../config/env";
import { ErrorCodes } from "../../constants/http";
import { AppError } from "../../utils/AppError";
import type { OAuthProfile } from "../../config/passport";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const EMAIL_CHANGE_TTL_MS = 24 * 60 * 60 * 1000;

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  username?: string | undefined;
}

export interface LoginResult {
  user: PublicUser;
  mfaRequired: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password);
}

export async function verifyPassword(
  hash: string | null | undefined,
  password: string,
): Promise<boolean> {
  if (!hash) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

function signPayload(payload: string): string {
  return createHmac("sha256", getCsrfSecret()).update(payload).digest("base64url");
}

function createSignedToken(data: Record<string, string | number>): string {
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64url");
  return `${encoded}.${signPayload(encoded)}`;
}

function verifySignedToken(token: string): Record<string, string | number> | null {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = signPayload(encoded);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Record<
      string,
      string | number
    >;
  } catch {
    return null;
  }
}

export function createEmailChangeToken(userId: string, newEmail: string): string {
  return createSignedToken({
    userId,
    newEmail,
    exp: Date.now() + EMAIL_CHANGE_TTL_MS,
  });
}

export function parseEmailChangeToken(
  token: string,
): { userId: string; newEmail: string } | null {
  const data = verifySignedToken(token);
  if (!data) return null;

  const userId = data.userId;
  const newEmail = data.newEmail;
  const exp = data.exp;
  if (typeof userId !== "string" || typeof newEmail !== "string" || typeof exp !== "number") {
    return null;
  }
  if (Date.now() > exp) return null;
  return { userId, newEmail };
}

export async function requireActiveUserFromDb(userId: string): Promise<void> {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND);
  }

  if (profile.deleted_at) {
    throw new AppError("Account has been deleted", 410, ErrorCodes.ACCOUNT_DELETED);
  }

  if (!canAuthenticate(profile)) {
    throw new AppError("Account is banned", 403, ErrorCodes.ACCOUNT_BANNED);
  }
}

export function regenerateAndEstablishSession(
  req: Request,
  userId: string,
  options?: { mfaVerified?: boolean; mfaRequired?: boolean },
): Promise<void> {
  const mfaRequired = options?.mfaRequired ?? false;
  const mfaVerified = options?.mfaVerified ?? !mfaRequired;

  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        reject(regenerateErr);
        return;
      }

      req.session.userId = userId;
      req.session.createdAt = Date.now();
      req.session.sessionVersion = 1;
      req.session.mfaVerified = mfaVerified;

      req.session.save((saveErr) => {
        if (saveErr) reject(saveErr);
        else resolve();
      });
    });
  });
}

export async function getCurrentUser(userId: string): Promise<PublicUser> {
  const publicUser = await usersRepository.findPublicById(userId);
  if (!publicUser) {
    throw new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND);
  }
  return publicUser;
}

export function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function assertCanAuthenticate(profile: ProfileAuthRow | ProfileRow): void {
  if (profile.deleted_at) {
    throw new AppError("Account has been deleted", 410, ErrorCodes.ACCOUNT_DELETED);
  }
  if (!canAuthenticate(profile)) {
    throw new AppError("Account is banned", 403, ErrorCodes.ACCOUNT_BANNED);
  }
}

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await usersRepository.findByEmail(input.email.toLowerCase());
  if (existing) {
    throw new AppError("Email already registered", 409, ErrorCodes.CONFLICT);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await usersRepository.createUser({
    email: input.email.toLowerCase(),
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    username: input.username,
    emailVerified: false,
  });

  const token = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS).toISOString();
  await usersRepository.createEmailVerificationToken(user.id, token, expiresAt);
  await sendSignupVerificationEmail({ email: user.email, token });

  return mapProfileToPublicUser(user);
}

export async function loginWithPassword(email: string, password: string): Promise<LoginResult> {
  const profile = await usersRepository.findByEmail(email.toLowerCase());
  if (!profile) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }

  const valid = await verifyPassword(profile.password_hash, password);
  if (!valid) {
    throw new AppError("Invalid email or password", 401, ErrorCodes.UNAUTHORIZED);
  }

  assertCanAuthenticate(profile);

  const user = mapProfileToPublicUser(profile);
  return {
    user,
    mfaRequired: user.mfaEnabled,
  };
}

export async function verifyEmailToken(token: string): Promise<PublicUser> {
  const row = await usersRepository.findValidEmailVerificationToken(token);
  if (!row) {
    throw new AppError("Invalid or expired verification token", 400, ErrorCodes.VALIDATION);
  }

  await usersRepository.consumeEmailVerificationToken(row.id);
  const verified = await usersRepository.markEmailVerified(row.user_id);
  if (!verified) {
    const profile = await usersRepository.findById(row.user_id);
    if (!profile) {
      throw new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND);
    }
    return mapProfileToPublicUser(profile);
  }

  return mapProfileToPublicUser(verified);
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const profile = await usersRepository.findByEmail(email.toLowerCase());
  if (!profile || profile.email_verified) {
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS).toISOString();
  await usersRepository.createEmailVerificationToken(profile.id, token, expiresAt);
  await sendSignupVerificationEmail({ email: profile.email, token });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const profile = await usersRepository.findByEmail(email.toLowerCase());
  if (!profile || !profile.password_hash) {
    return;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();
  await usersRepository.createPasswordResetToken(profile.id, token, expiresAt);
  await sendPasswordResetEmail({ email: profile.email, token });
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<void> {
  const row = await usersRepository.findValidPasswordResetToken(token);
  if (!row) {
    throw new AppError("Invalid or expired reset token", 400, ErrorCodes.VALIDATION);
  }

  const passwordHash = await hashPassword(newPassword);
  await usersRepository.setPasswordHash(row.user_id, passwordHash);
  await usersRepository.consumePasswordResetToken(row.id);
}

export async function resolveOAuthLogin(profile: OAuthProfile): Promise<LoginResult> {
  const existingOAuth = await oauthRepository.findByProviderAndProviderId(
    profile.provider,
    profile.providerId,
  );

  if (existingOAuth) {
    const userProfile = await usersRepository.findById(existingOAuth.user_id);
    if (!userProfile) {
      throw new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND);
    }
    assertCanAuthenticate(userProfile);
    const user = mapProfileToPublicUser(userProfile);
    return { user, mfaRequired: user.mfaEnabled };
  }

  const emailMatch = await usersRepository.findByEmail(profile.email.toLowerCase());
  if (emailMatch) {
    assertCanAuthenticate(emailMatch);
    await oauthRepository.upsert(emailMatch.id, profile.provider, profile.providerId);
    const user = mapProfileToPublicUser(emailMatch);
    return { user, mfaRequired: user.mfaEnabled };
  }

  const created = await usersRepository.createUser({
    email: profile.email.toLowerCase(),
    firstName: profile.firstName,
    lastName: profile.lastName,
    emailVerified: true,
  });
  await oauthRepository.upsert(created.id, profile.provider, profile.providerId);
  const user = mapProfileToPublicUser(created);
  return { user, mfaRequired: user.mfaEnabled };
}

export async function linkOAuthAccount(
  userId: string,
  profile: OAuthProfile,
): Promise<{ linkedProviders: UserOAuthProvider[] }> {
  const existing = await oauthRepository.findByProviderAndProviderId(
    profile.provider,
    profile.providerId,
  );
  if (existing && existing.user_id !== userId) {
    throw new AppError("OAuth account is linked to another user", 409, ErrorCodes.CONFLICT);
  }

  await oauthRepository.upsert(userId, profile.provider, profile.providerId);
  const rows = await oauthRepository.listByUserId(userId);
  return { linkedProviders: rows.map((row) => row.provider as UserOAuthProvider) };
}

export async function unlinkOAuthAccount(
  userId: string,
  provider: UserOAuthProvider,
): Promise<{ linkedProviders: UserOAuthProvider[] }> {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND);
  }

  const authProfile = await usersRepository.findByEmail(profile.email);
  const oauthRows = await oauthRepository.listByUserId(userId);
  const hasPassword = Boolean(authProfile?.password_hash);
  const remaining = oauthRows.filter((row) => row.provider !== provider);

  if (!hasPassword && remaining.length === 0) {
    throw new AppError(
      "Cannot unlink the only sign-in method",
      400,
      ErrorCodes.VALIDATION,
    );
  }

  await oauthRepository.remove(userId, provider);
  return { linkedProviders: remaining.map((row) => row.provider as UserOAuthProvider) };
}
