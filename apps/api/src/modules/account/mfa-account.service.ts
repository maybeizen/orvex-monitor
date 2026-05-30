import type { Json } from "@orvex/database";
import {
  createSupabaseClient,
  mfaRepository,
  usersRepository,
} from "@orvex/database";
import type { ProfileRow } from "@orvex/database";
import { sendAccountDeactivationEmail } from "@orvex/email";

import { getEnv } from "../../config/env";
import {
  decryptMfaSecret,
  encryptMfaSecret,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from "../../lib/mfa-crypto";
import {
  buildOtpAuthUri,
  generateTotpSecret,
  getTotpPreview,
  verifyTotp,
} from "../../lib/mfa-totp";
import { AppError } from "../../utils/AppError";
import { ErrorCodes } from "../../constants/http";

interface BackupCodeEntry {
  hash: string;
  used: boolean;
}

function parseBackupCodes(raw: Json): BackupCodeEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: BackupCodeEntry[] = [];
  for (const item of raw) {
    if (
      typeof item === "object" &&
      item !== null &&
      "hash" in item &&
      typeof (item as { hash: unknown }).hash === "string" &&
      "used" in item &&
      typeof (item as { used: unknown }).used === "boolean"
    ) {
      entries.push(item as unknown as BackupCodeEntry);
    }
  }
  return entries;
}

export async function verifyUserPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const client = createSupabaseClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  return error === null;
}

export async function requireMfaIfEnabled(
  profile: ProfileRow,
  otp?: string | undefined,
): Promise<void> {
  if (!profile.mfa_enabled) return;

  if (!otp) {
    throw new AppError("Two-factor code required", 403, ErrorCodes.MFA_REQUIRED);
  }

  await verifyMfaCode(profile.id, otp);
}

export async function verifyMfaCode(
  userId: string,
  code: string,
): Promise<void> {
  const row = await mfaRepository.findByUserId(userId);
  if (!row?.enabled || !row.secret) {
    throw new AppError("MFA is not enabled", 400, ErrorCodes.VALIDATION);
  }

  const secret = decryptMfaSecret(row.secret);
  const normalized = code.replace(/\s|-/g, "");

  if (normalized.length === 6 && verifyTotp(secret, normalized)) {
    return;
  }

  const backupCodes = parseBackupCodes(row.backup_codes);
  const hash = hashBackupCode(normalized.toUpperCase());
  const matchIndex = backupCodes.findIndex(
    (entry) => !entry.used && entry.hash === hash,
  );

  if (matchIndex === -1) {
    const legacyMatch = backupCodes.findIndex(
      (entry) => !entry.used && verifyBackupCode(normalized, entry.hash),
    );
    if (legacyMatch === -1) {
      throw new AppError("Invalid authentication code", 401, ErrorCodes.UNAUTHORIZED);
    }
    backupCodes[legacyMatch]!.used = true;
  } else {
    backupCodes[matchIndex]!.used = true;
  }

  await mfaRepository.updateBackupCodes(
    userId,
    backupCodes as unknown as Json,
  );
}

export async function startMfaEnroll(userId: string, email: string) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }
  if (profile.mfa_enabled) {
    throw new AppError("MFA is already enabled", 409, ErrorCodes.CONFLICT);
  }

  const secret = generateTotpSecret();
  const encrypted = encryptMfaSecret(secret);
  await mfaRepository.upsertPending(userId, encrypted);

  return {
    qrUri: buildOtpAuthUri(email, secret),
    secretPreview: getTotpPreview(secret),
  };
}

export async function confirmMfaEnroll(
  userId: string,
  email: string,
  otp: string,
  password: string,
) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  const validPassword = await verifyUserPassword(email, password);
  if (!validPassword) {
    throw new AppError("Incorrect password", 401, ErrorCodes.UNAUTHORIZED);
  }

  const row = await mfaRepository.findByUserId(userId);
  if (!row?.secret) {
    throw new AppError("Start MFA enrollment first", 400, ErrorCodes.VALIDATION);
  }

  const secret = decryptMfaSecret(row.secret);
  if (!verifyTotp(secret, otp)) {
    throw new AppError("Invalid authentication code", 401, ErrorCodes.UNAUTHORIZED);
  }

  const plainCodes = generateBackupCodes();
  const hashedEntries: BackupCodeEntry[] = plainCodes.map((code) => ({
    hash: hashBackupCode(code.replace(/-/g, "")),
    used: false,
  }));

  await mfaRepository.enable(userId, row.secret, hashedEntries as unknown as Json);
  await usersRepository.setMfaEnabled(userId, true);

  return { backupCodes: plainCodes };
}

export async function disableMfa(
  userId: string,
  email: string,
  otp: string,
  password: string,
) {
  const profile = await usersRepository.findById(userId);
  if (!profile) {
    throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
  }

  const validPassword = await verifyUserPassword(email, password);
  if (!validPassword) {
    throw new AppError("Incorrect password", 401, ErrorCodes.UNAUTHORIZED);
  }

  await verifyMfaCode(userId, otp);
  await mfaRepository.disable(userId);
  await usersRepository.setMfaEnabled(userId, false);
}

export async function sendDeactivationEmail(
  email: string,
  scheduledAt: Date,
): Promise<void> {
  const env = getEnv();
  await sendAccountDeactivationEmail({ email, scheduledAt });
  void env;
}
