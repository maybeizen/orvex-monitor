import type { PublicUser } from "@orvex/types";
import type { Request } from "express";

import {
  canAuthenticate,
  createSupabaseClient,
  mapProfileToPublicUser,
  usersRepository,
  type SupabaseAuthUserSnapshot,
} from "@orvex/database";
import { createLogger } from "@orvex/logger";

import { AppError } from "../../utils/AppError";
import { ErrorCodes } from "../../constants/http";

const logger = createLogger({ name: "api:auth" });

export interface VerifiedSupabaseUser extends SupabaseAuthUserSnapshot {
  id: string;
  email?: string | undefined;
}

function mapSupabaseUser(user: {
  id: string;
  email?: string | undefined;
  email_confirmed_at?: string | null | undefined;
  user_metadata?: Record<string, unknown> | undefined;
}): VerifiedSupabaseUser {
  const metadata = user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : undefined;

  return {
    id: user.id,
    email: user.email,
    emailConfirmed: user.email_confirmed_at != null,
    firstName: typeof metadata.first_name === "string" ? metadata.first_name : undefined,
    lastName: typeof metadata.last_name === "string" ? metadata.last_name : undefined,
    fullName,
    username:
      typeof metadata.username === "string"
        ? metadata.username
        : typeof metadata.preferred_username === "string"
          ? metadata.preferred_username
          : undefined,
  };
}

export async function verifySupabaseToken(token: string): Promise<VerifiedSupabaseUser> {
  const client = createSupabaseClient();
  const { data, error } = await client.auth.getUser(token);
  if (error !== null || data.user === null) {
    logger.warn("Supabase token verification failed");
    throw new AppError("Invalid or expired token", 401, ErrorCodes.UNAUTHORIZED);
  }
  return mapSupabaseUser(data.user);
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

export async function resolveUserForSession(
  verified: VerifiedSupabaseUser,
): Promise<PublicUser> {
  let profile = await usersRepository.findById(verified.id);
  if (!profile) {
    profile = await usersRepository.syncFromSupabaseAuth(verified);
  } else {
    const synced = await usersRepository.markEmailVerifiedIfNeeded(
      verified.id,
      verified.emailConfirmed,
    );
    if (synced) profile = synced;
  }

  if (profile.deleted_at) {
    throw new AppError("Account has been deleted", 410, ErrorCodes.ACCOUNT_DELETED);
  }

  if (!canAuthenticate(profile)) {
    throw new AppError("Account is banned", 403, ErrorCodes.ACCOUNT_BANNED);
  }

  return mapProfileToPublicUser(profile);
}

export function regenerateAndEstablishSession(
  req: Request,
  user: VerifiedSupabaseUser,
  options?: { mfaVerified?: boolean },
): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) {
        reject(regenerateErr);
        return;
      }

      req.session.userId = user.id;
      req.session.supabaseUserId = user.id;
      req.session.createdAt = Date.now();
      req.session.sessionVersion = 1;
      req.session.mfaVerified = options?.mfaVerified ?? true;

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

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
