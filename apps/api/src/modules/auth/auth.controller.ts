import type { NextFunction, Request, Response } from "express";

import { usersRepository } from "@orvex/database";

import { getEnv } from "../../config/env";
import type { AuthenticatedRequest } from "../../types/express";
import { ErrorCodes } from "../../constants/http";
import {
  destroySession,
  extractBearerToken,
  getCurrentUser,
  regenerateAndEstablishSession,
  resolveUserForSession,
  verifySupabaseToken,
} from "./auth.service";
import { createSessionBodySchema } from "./auth.validator";

function sessionCookieOptions() {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

export async function createSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let token = extractBearerToken(req);
    if (!token) {
      const parsed = createSessionBodySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "Missing access token",
          statusCode: 400,
          code: ErrorCodes.VALIDATION,
        });
        return;
      }
      token = parsed.data.accessToken;
    }

    const verified = await verifySupabaseToken(token);
    const user = await resolveUserForSession(verified);
    await regenerateAndEstablishSession(req, verified, {
      mfaVerified: !user.mfaEnabled,
    });
    await usersRepository.updateLastLogin(verified.id);

    const refreshed = await getCurrentUser(verified.id);
    res.status(201).json({
      data: {
        user: refreshed ?? user,
        mfaRequired: user.mfaEnabled,
        mfaVerified: !user.mfaEnabled,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    res.json({
      data: {
        authenticated: true,
        user: user ?? (await getCurrentUser(userId)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    res.json({ data: { user: user ?? (await getCurrentUser(userId)) } });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await destroySession(req);
    res.clearCookie(getEnv().SESSION_COOKIE_NAME, sessionCookieOptions());
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
