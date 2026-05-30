import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

import { getCsrfSecret, getEnv } from "../config/env";
import { ErrorCodes } from "../constants/http";
import { AppError } from "../utils/AppError";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-xsrf-token";
const CSRF_TOKEN_TTL_MS = 60 * 60 * 24 * 1000;

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (rawKey === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }
  return undefined;
}

function signCsrfPayload(payload: string): string {
  return createHmac("sha256", getCsrfSecret()).update(payload).digest("base64url");
}

function createCsrfToken(): string {
  const issuedAt = Date.now().toString();
  const nonce = randomBytes(16).toString("hex");
  const payload = `${issuedAt}.${nonce}`;
  return `${payload}.${signCsrfPayload(payload)}`;
}

function verifyCsrfToken(token: string): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;
  if (!issuedAt || !nonce || !signature) return false;

  const issuedAtMs = Number(issuedAt);
  if (!Number.isFinite(issuedAtMs) || Date.now() - issuedAtMs > CSRF_TOKEN_TTL_MS) {
    return false;
  }

  const payload = `${issuedAt}.${nonce}`;
  const expected = signCsrfPayload(payload);
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(sigBuf, expectedBuf);
}

function isCsrfExempt(req: Request): boolean {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return true;
  }
  const path = req.path;
  if (path.endsWith("/google/callback") || path.endsWith("/github/callback")) {
    return true;
  }
  return false;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  const env = getEnv();
  const cookieOptions = {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: CSRF_TOKEN_TTL_MS,
  };

  const existing = readCookie(req, CSRF_COOKIE_NAME);
  if (!existing || !verifyCsrfToken(existing)) {
    res.cookie(CSRF_COOKIE_NAME, createCsrfToken(), cookieOptions);
  }

  if (isCsrfExempt(req)) {
    next();
    return;
  }

  const headerToken = req.get(CSRF_HEADER_NAME);
  const cookieToken = readCookie(req, CSRF_COOKIE_NAME);

  if (
    !headerToken ||
    !cookieToken ||
    headerToken !== cookieToken ||
    !verifyCsrfToken(cookieToken)
  ) {
    next(new AppError("Invalid CSRF token", 403, ErrorCodes.FORBIDDEN));
    return;
  }

  next();
}
