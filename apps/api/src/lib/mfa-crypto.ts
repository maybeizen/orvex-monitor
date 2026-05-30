import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { scryptSync, timingSafeEqual } from "node:crypto";

import { getEnv } from "../config/env";

function deriveKey(): Buffer {
  return createHash("sha256").update(getEnv().SESSION_SECRET).digest();
}

export function encryptMfaSecret(plain: string): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptMfaSecret(encoded: string): string {
  const key = deriveKey();
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function hashBackupCode(code: string): string {
  const salt = "orvex-mfa-backup";
  return scryptSync(code, salt, 32).toString("hex");
}

export function verifyBackupCode(code: string, hash: string): boolean {
  const computed = hashBackupCode(code);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const segment = randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${segment.slice(0, 4)}-${segment.slice(4, 8)}`);
  }
  return codes;
}
